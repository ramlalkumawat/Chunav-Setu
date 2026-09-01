import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/security/session";
import { SecurityUser } from "@/lib/security/types";
import { INITIAL_PROFILES } from "@/lib/store/mock-data";
import { dbService } from "@/lib/store/data-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roleType } = body;

    let targetProfile = INITIAL_PROFILES[0];

    if (roleType === "super_admin") {
      targetProfile = INITIAL_PROFILES.find((p) => p.role === "super_admin") || targetProfile;
    } else if (roleType === "client_1") {
      targetProfile = INITIAL_PROFILES.find((p) => p.role === "client_admin" && p.client_id === "client-1") || targetProfile;
    } else if (roleType === "client_2") {
      targetProfile = INITIAL_PROFILES.find((p) => p.role === "client_admin" && p.client_id === "client-2") || targetProfile;
    } else if (roleType === "volunteer_1") {
      targetProfile = INITIAL_PROFILES.find((p) => p.role === "volunteer") || targetProfile;
    }

    const securityUser: SecurityUser = {
      id: targetProfile.id,
      email: targetProfile.email,
      full_name: targetProfile.full_name,
      role: targetProfile.role,
      client_id: targetProfile.client_id,
      status: targetProfile.status,
    };

    const token = createSessionToken(securityUser);
    const response = NextResponse.json({
      success: true,
      user: securityUser,
      message: `Switched to role: ${securityUser.role}`,
    });

    setSessionCookie(response, token);

    dbService.logAction(
      { id: securityUser.id, name: securityUser.full_name },
      "DEMO_ROLE_SWITCH",
      "Session",
      securityUser.id,
      { role: securityUser.role, target: roleType },
      securityUser.client_id
    );

    return response;
  } catch (err) {
    console.error("Demo switch error:", err);
    return NextResponse.json({ error: "Failed to switch demo role." }, { status: 500 });
  }
}

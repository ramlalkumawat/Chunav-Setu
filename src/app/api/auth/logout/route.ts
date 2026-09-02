import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getRequestSession } from "@/lib/security/session";
import { db } from "@/lib/supabase/database-service";

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  clearSessionCookie(response);

  if (session) {
    await db.logAuditEvent(
      { id: session.userId, name: session.fullName },
      "USER_LOGOUT",
      "Session",
      session.userId,
      { role: session.role },
      session.clientId
    );
  }

  return response;
}

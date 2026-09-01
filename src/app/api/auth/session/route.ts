import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { dbService } from "@/lib/store/data-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);

  if (!session) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
  }

  const client = session.clientId ? dbService.getClientById(session.clientId) : null;
  const volunteers = session.clientId ? dbService.getVolunteers(session.clientId) : [];
  const volunteer = volunteers.find((v) => v.user_id === session.userId || v.email === session.email) || null;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      full_name: session.fullName,
      role: session.role,
      client_id: session.clientId,
      status: "active",
    },
    role: session.role,
    client: client || null,
    volunteer: volunteer || null,
  });
}

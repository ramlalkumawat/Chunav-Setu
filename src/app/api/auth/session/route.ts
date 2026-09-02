import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);

  if (!session) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
  }

  const client = session.clientId ? await db.getClientById(session.clientId) : null;
  const volunteers = session.clientId ? await db.getVolunteers(session.clientId) : [];
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

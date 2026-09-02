import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { sanitizeString, isValidMobile } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const clients = await db.getClients();
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "create");
  if (!perm.authorized) return perm.errorResponse!;

  try {
    const body = await req.json();

    const name = sanitizeString(body.name);
    const candidateName = sanitizeString(body.candidate_name);
    const mobile = sanitizeString(body.mobile);
    const email = sanitizeString(body.email).toLowerCase();
    const username = body.username ? sanitizeString(body.username).toLowerCase() : undefined;
    const campaignName = sanitizeString(body.campaign_name || `${candidateName} Campaign 2026`);
    const electionType = sanitizeString(body.election_type || "Vidhan Sabha");
    const location = sanitizeString(body.location || "Constituency");
    const password = body.password ? sanitizeString(body.password) : undefined;

    if (!name || !candidateName || !email) {
      return NextResponse.json({ error: "Name, Candidate Name, and Email are required." }, { status: 400 });
    }

    if (mobile && !isValidMobile(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number format." }, { status: 400 });
    }

    const { client, tempPassword, error } = await db.createCandidateClient(
      {
        name,
        candidate_name: candidateName,
        mobile,
        email,
        username,
        campaign_name: campaignName,
        election_type: electionType,
        location,
        status: "active",
      },
      password
    );

    if (error || !client) {
      return NextResponse.json({ error: error || "Failed to provision candidate tenant." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "CLIENT_TENANT_PROVISIONED",
      "Client",
      client.id,
      { candidateName, email, electionType },
      client.id
    );

    return NextResponse.json({ client, tempPassword }, { status: 201 });
  } catch (err: any) {
    console.error("Create client API error:", err);
    return NextResponse.json({ error: "Failed to provision client tenant." }, { status: 500 });
  }
}

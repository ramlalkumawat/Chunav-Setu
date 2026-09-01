import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { sanitizeString, isValidMobile } from "@/lib/security/sanitizer";
import { dbService } from "@/lib/store/data-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const clients = dbService.getClients();
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
    const campaignName = sanitizeString(body.campaign_name);
    const electionType = sanitizeString(body.election_type);
    const location = sanitizeString(body.location);

    if (!name || !candidateName || !email) {
      return NextResponse.json({ error: "Missing required client tenant fields." }, { status: 400 });
    }

    if (mobile && !isValidMobile(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number." }, { status: 400 });
    }

    const created = dbService.createClient({
      name,
      candidate_name: candidateName,
      mobile,
      email,
      campaign_name: campaignName,
      election_type: electionType,
      location,
      status: "active",
    });

    dbService.logAction(
      { id: session!.userId, name: session!.fullName },
      "CLIENT_TENANT_PROVISIONED",
      "Client",
      created.id,
      { candidateName, email, electionType }
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Create client API error:", err);
    return NextResponse.json({ error: "Failed to provision client tenant." }, { status: 500 });
  }
}

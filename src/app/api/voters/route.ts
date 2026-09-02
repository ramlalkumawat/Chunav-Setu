import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString, isValidVoterCard, isValidMobile } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const { searchParams } = new URL(req.url);
  const targetClientId = searchParams.get("clientId") || undefined;
  const tenantCheck = validateTenantAccess(session!, targetClientId);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  const search = sanitizeString(searchParams.get("search") || "");
  const boothId = searchParams.get("boothId") || undefined;
  const areaId = searchParams.get("areaId") || undefined;
  const contactStatus = searchParams.get("contactStatus") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  const result = await db.getVoters(effectiveClientId, {
    search,
    boothId,
    areaId,
    contactStatus,
    gender,
    page: isNaN(page) ? 1 : Math.max(1, page),
    pageSize: isNaN(pageSize) ? 12 : Math.min(100, Math.max(1, pageSize)),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "create");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  try {
    const body = await req.json();

    const voterIdCard = sanitizeString(body.voter_id_card).toUpperCase();
    const name = sanitizeString(body.name);
    const mobile = body.mobile ? sanitizeString(body.mobile) : undefined;
    const address = body.address ? sanitizeString(body.address) : undefined;
    const boothId = body.booth_id ? sanitizeString(body.booth_id) : undefined;
    const areaId = body.area_id ? sanitizeString(body.area_id) : undefined;
    const age = body.age ? parseInt(String(body.age), 10) : undefined;
    const gender = ["Male", "Female", "Other", "Unknown"].includes(body.gender) ? body.gender : "Unknown";
    const contactStatus = body.contact_status || "uncontacted";
    const notes = body.notes ? sanitizeString(body.notes) : undefined;

    if (!isValidVoterCard(voterIdCard)) {
      return NextResponse.json({ error: "Invalid Voter ID / EPIC number format." }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Valid voter name is required." }, { status: 400 });
    }

    if (mobile && !isValidMobile(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number format." }, { status: 400 });
    }

    // Get default campaign if not provided
    let campaignId = body.campaign_id;
    if (!campaignId) {
      const campaigns = await db.getCampaigns(effectiveClientId);
      campaignId = campaigns[0]?.id;
    }

    const created = await db.createVoter({
      client_id: effectiveClientId,
      campaign_id: campaignId,
      voter_id_card: voterIdCard,
      name,
      mobile,
      age: isNaN(age!) ? undefined : age,
      gender,
      address,
      booth_id: boothId,
      area_id: areaId,
      contact_status: contactStatus,
      follow_up_status: body.follow_up_status || "none",
      notes,
    });

    if (!created) {
      return NextResponse.json({ error: "Failed to create voter record in database." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "VOTER_CREATED",
      "Voter",
      created.id,
      { voter_id_card: voterIdCard, name },
      effectiveClientId
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Create voter API error:", err);
    return NextResponse.json({ error: "Failed to create voter record." }, { status: 500 });
  }
}

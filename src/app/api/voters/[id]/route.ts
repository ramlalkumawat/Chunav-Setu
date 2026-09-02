import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess, verifyEntityOwnership } from "@/lib/security/tenant";
import { sanitizeString, isValidMobile } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const voter = await db.getVoterById(tenantCheck.effectiveClientId!, params.id);
  if (!voter || !verifyEntityOwnership(voter, session!)) {
    return NextResponse.json({ error: "Elector record not found or unauthorized." }, { status: 404 });
  }

  return NextResponse.json(voter);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "update");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const voter = await db.getVoterById(tenantCheck.effectiveClientId!, params.id);
  if (!voter || !verifyEntityOwnership(voter, session!)) {
    return NextResponse.json({ error: "Elector record not found or unauthorized." }, { status: 404 });
  }

  try {
    const body = await req.json();

    const updates: any = {};
    if (body.name !== undefined) updates.name = sanitizeString(body.name);
    if (body.mobile !== undefined) {
      const cleanMobile = sanitizeString(body.mobile);
      if (cleanMobile && !isValidMobile(cleanMobile)) {
        return NextResponse.json({ error: "Invalid mobile number format." }, { status: 400 });
      }
      updates.mobile = cleanMobile;
    }
    if (body.address !== undefined) updates.address = sanitizeString(body.address);
    if (body.booth_id !== undefined) updates.booth_id = sanitizeString(body.booth_id);
    if (body.area_id !== undefined) updates.area_id = sanitizeString(body.area_id);
    if (body.contact_status !== undefined) updates.contact_status = body.contact_status;
    if (body.follow_up_status !== undefined) updates.follow_up_status = body.follow_up_status;
    if (body.notes !== undefined) updates.notes = sanitizeString(body.notes);

    const updated = await db.updateVoter(tenantCheck.effectiveClientId!, params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update voter record." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "VOTER_UPDATED",
      "Voter",
      params.id,
      updates,
      tenantCheck.effectiveClientId
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update voter API error:", err);
    return NextResponse.json({ error: "Failed to update voter record." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "delete");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const voter = await db.getVoterById(tenantCheck.effectiveClientId!, params.id);
  if (!voter || !verifyEntityOwnership(voter, session!)) {
    return NextResponse.json({ error: "Elector record not found or unauthorized." }, { status: 404 });
  }

  const deleted = await db.deleteVoter(tenantCheck.effectiveClientId!, params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Failed to delete voter record." }, { status: 500 });
  }

  await db.logAuditEvent(
    { id: session!.userId, name: session!.fullName },
    "VOTER_DELETED",
    "Voter",
    params.id,
    { voter_id_card: voter.voter_id_card, name: voter.name },
    tenantCheck.effectiveClientId
  );

  return NextResponse.json({ success: true, message: "Elector record deleted successfully." });
}

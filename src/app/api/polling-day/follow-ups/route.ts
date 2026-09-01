import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString } from "@/lib/security/sanitizer";
import { dbService } from "@/lib/store/data-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "polling_day", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const { searchParams } = new URL(req.url);
  const targetClientId = searchParams.get("clientId") || undefined;
  const tenantCheck = validateTenantAccess(session!, targetClientId);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;
  const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;

  const followUps = dbService.getPollingDayFollowUps(effectiveClientId, volunteerId);
  return NextResponse.json(followUps);
}

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "polling_day", "update");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  try {
    const body = await req.json();

    // Check if resolving existing follow-up
    if (body.action === "resolve" && body.followUpId) {
      const resolved = dbService.resolvePollingFollowUp(effectiveClientId, body.followUpId);
      if (!resolved) {
        return NextResponse.json({ error: "Follow-up record not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, record: resolved });
    }

    // Creating new follow-up
    const { voterId, voterName, voterIdCard, boothId, boothNumber, boothName, areaName, reason, note } = body;

    if (!voterId || !reason) {
      return NextResponse.json({ error: "Voter ID and follow-up reason are required." }, { status: 400 });
    }

    const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;
    const volunteerName = session!.fullName || "Volunteer";

    const created = dbService.createPollingFollowUp(effectiveClientId, {
      client_id: effectiveClientId,
      campaign_id: "campaign-1",
      polling_day_id: `pd-${effectiveClientId}`,
      voter_id: voterId,
      voter_name: sanitizeString(voterName) || "Voter",
      voter_id_card: sanitizeString(voterIdCard) || "VOT1000",
      booth_id: boothId || "booth-1",
      booth_number: boothNumber || "Booth 101",
      booth_name: boothName || "Govt School",
      area_name: areaName || "General Ward",
      volunteer_id: volunteerId,
      volunteer_name: volunteerName,
      reason: sanitizeString(reason),
      note: note ? sanitizeString(note) : undefined,
    });

    dbService.logAction(
      { id: session!.userId, name: session!.fullName },
      "POLLING_FOLLOWUP_CREATED",
      "FollowUp",
      created.id,
      { voter: created.voter_name, reason },
      effectiveClientId
    );

    return NextResponse.json({ success: true, record: created }, { status: 201 });
  } catch (err) {
    console.error("Polling follow-up API error:", err);
    return NextResponse.json({ error: "Failed to process follow-up." }, { status: 500 });
  }
}

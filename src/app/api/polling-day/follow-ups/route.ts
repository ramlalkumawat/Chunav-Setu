import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

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

  const followUps = await db.getPollingDayFollowUps(effectiveClientId, volunteerId);
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
      const resolved = await db.resolvePollingDayFollowUp(effectiveClientId, body.followUpId);
      if (!resolved) {
        return NextResponse.json({ error: "Follow-up record not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, record: resolved });
    }

    // Creating new follow-up
    const { voterId, boothId, reason, note, pollingDayId } = body;

    if (!voterId || !reason) {
      return NextResponse.json({ error: "Voter ID and follow-up reason are required." }, { status: 400 });
    }

    const activePollingDay = await db.getActivePollingDay(effectiveClientId);
    const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;

    const created = await db.createPollingDayFollowUp(effectiveClientId, {
      campaign_id: activePollingDay?.campaign_id || "c1111111-1111-1111-1111-111111111111",
      polling_day_id: pollingDayId || activePollingDay?.id || "00000000-0000-0000-0000-000000000000",
      voter_id: voterId,
      booth_id: boothId || undefined,
      volunteer_id: volunteerId,
      reason: sanitizeString(reason),
      note: note ? sanitizeString(note) : undefined,
    });

    if (!created) {
      return NextResponse.json({ error: "Failed to record follow-up issue." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "POLLING_FOLLOWUP_CREATED",
      "FollowUp",
      created.id,
      { voter_id: voterId, reason },
      effectiveClientId
    );

    return NextResponse.json({ success: true, record: created }, { status: 201 });
  } catch (err) {
    console.error("Polling follow-up API error:", err);
    return NextResponse.json({ error: "Failed to process follow-up." }, { status: 500 });
  }
}

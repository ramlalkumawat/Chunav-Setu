import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";
import { PollingVoterStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "polling_day", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const { searchParams } = new URL(req.url);
  const targetClientId = searchParams.get("clientId") || undefined;
  const tenantCheck = validateTenantAccess(session!, targetClientId);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  const search = sanitizeString(searchParams.get("search") || "");
  const status = searchParams.get("status") || "ALL";
  const boothId = searchParams.get("boothId") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;

  const result = await db.getPollingDayVoters(effectiveClientId, volunteerId, {
    search,
    status,
    boothId,
    page: isNaN(page) ? 1 : Math.max(1, page),
    pageSize: isNaN(pageSize) ? 20 : Math.min(100, Math.max(1, pageSize)),
  });

  return NextResponse.json(result);
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
    const { voterId, status, note, pollingDayId, boothId } = body;

    if (!voterId || typeof voterId !== "string") {
      return NextResponse.json({ error: "Voter ID is required." }, { status: 400 });
    }

    const validStatuses: PollingVoterStatus[] = ["VOTING_REPORTED", "PENDING", "FOLLOW_UP_REQUIRED", "VOTE_CAST", "NOT_REPORTED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid polling operational status." }, { status: 400 });
    }

    const activePollingDay = await db.getActivePollingDay(effectiveClientId);
    const targetPollingDayId = pollingDayId || activePollingDay?.id || `00000000-0000-0000-0000-000000000000`;
    const cleanNote = note ? sanitizeString(note) : undefined;

    const record = await db.recordPollingStatusUpdate(effectiveClientId, {
      polling_day_id: targetPollingDayId,
      campaign_id: activePollingDay?.campaign_id || "c1111111-1111-1111-1111-111111111111",
      voter_id: voterId,
      booth_id: boothId || undefined,
      volunteer_id: session!.role === "volunteer" ? session!.userId : undefined,
      status,
      updated_by: session!.fullName || "Volunteer",
      updated_by_role: session!.role,
      note: cleanNote,
    });

    if (!record) {
      return NextResponse.json({ error: "Failed to update polling status." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "POLLING_STATUS_UPDATED",
      "Voter",
      voterId,
      { status, note: cleanNote },
      effectiveClientId
    );

    return NextResponse.json({
      success: true,
      record,
      message: "Status updated successfully",
      updatedAt: record.updated_at || record.created_at,
    });
  } catch (err) {
    console.error("Polling status update API error:", err);
    return NextResponse.json({ error: "Failed to update polling status." }, { status: 500 });
  }
}

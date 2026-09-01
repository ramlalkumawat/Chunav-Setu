import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString } from "@/lib/security/sanitizer";
import { dbService } from "@/lib/store/data-service";
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

  // If volunteer role, pass volunteer ID to scope to assigned booth
  const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;

  const result = dbService.getPollingDayVoters(effectiveClientId, volunteerId, {
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
    const { voterId, status, note } = body;

    if (!voterId || typeof voterId !== "string") {
      return NextResponse.json({ error: "Voter ID is required." }, { status: 400 });
    }

    const validStatuses: PollingVoterStatus[] = ["VOTING_REPORTED", "PENDING", "FOLLOW_UP_REQUIRED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid polling operational status." }, { status: 400 });
    }

    const volunteerId = session!.role === "volunteer" ? session!.userId : undefined;
    const cleanNote = note ? sanitizeString(note) : undefined;

    const record = dbService.updatePollingVoterStatus(
      effectiveClientId,
      voterId,
      status,
      volunteerId,
      cleanNote
    );

    dbService.logAction(
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
      updatedAt: record.created_at,
    });
  } catch (err) {
    console.error("Polling status update API error:", err);
    return NextResponse.json({ error: "Failed to update polling status." }, { status: 500 });
  }
}

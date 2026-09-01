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
  const stats = dbService.getPollingDayDashboardStats(effectiveClientId);

  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "polling_day", "manage");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  try {
    const body = await req.json();

    // Check if locking action
    if (body.action === "lock") {
      dbService.lockPollingDay(effectiveClientId);
      dbService.logAction(
        { id: session!.userId, name: session!.fullName },
        "POLLING_DAY_LOCKED",
        "PollingDay",
        undefined,
        { status: "completed" },
        effectiveClientId
      );
      return NextResponse.json({ success: true, message: "Polling day operations locked successfully." });
    }

    const title = sanitizeString(body.title) || "General Assembly Election Polling Day";
    const pollingDate = sanitizeString(body.polling_date) || "12 December 2026";
    const startTime = sanitizeString(body.start_time) || "07:00 AM";
    const endTime = sanitizeString(body.end_time) || "06:00 PM";
    const status = ["upcoming", "active", "completed"].includes(body.status) ? body.status : "active";

    const configured = dbService.configurePollingDay(effectiveClientId, {
      title,
      polling_date: pollingDate,
      start_time: startTime,
      end_time: endTime,
      status,
    });

    dbService.logAction(
      { id: session!.userId, name: session!.fullName },
      "POLLING_DAY_CONFIGURED",
      "PollingDay",
      configured.id,
      { title, pollingDate, status },
      effectiveClientId
    );

    return NextResponse.json(configured);
  } catch (err) {
    console.error("Configure polling day API error:", err);
    return NextResponse.json({ error: "Failed to configure polling day." }, { status: 500 });
  }
}

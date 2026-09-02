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
  const stats = await db.getPollingDayDashboardStats(effectiveClientId);

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

    // Check if status update for voter turnout
    if (body.action === "update_voter_status") {
      const updated = await db.recordPollingStatusUpdate(effectiveClientId, {
        polling_day_id: body.polling_day_id,
        campaign_id: body.campaign_id || "camp-1",
        voter_id: body.voter_id,
        booth_id: body.booth_id,
        volunteer_id: session!.userId,
        status: body.status,
        updated_by: session!.fullName,
        updated_by_role: session!.role,
        note: body.note ? sanitizeString(body.note) : undefined,
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Polling day action error:", err);
    return NextResponse.json({ error: "Failed to process polling day operation." }, { status: 500 });
  }
}

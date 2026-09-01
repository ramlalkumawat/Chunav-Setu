import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/security/rate-limiter";
import { sanitizeCsvCell } from "@/lib/security/sanitizer";
import { dbService } from "@/lib/store/data-service";

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "polling_day", "export");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  const rateLimit = checkRateLimit(session!.userId, "export");
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit);
  }

  try {
    const boothStats = dbService.getPollingDayBoothStats(effectiveClientId);
    const volunteerStats = dbService.getPollingDayVolunteerStats(effectiveClientId);
    const dashboardStats = dbService.getPollingDayDashboardStats(effectiveClientId);

    const headers = [
      "Booth Number",
      "Polling Station Name",
      "Area / Ward",
      "Total Registered Voters",
      "Turnout Reported",
      "Voting Activity Recorded",
      "Pending Contact",
      "Follow-up Issues",
      "Turnout Progress %",
      "Assigned Volunteers",
    ];

    const headerLine = headers.map(sanitizeCsvCell).join(",");
    const rows = boothStats.map((b) =>
      [
        b.booth_number,
        b.booth_name,
        b.area_name,
        b.total_voters,
        b.reported_count,
        b.voting_reported_count,
        b.pending_count,
        b.follow_up_count,
        `${b.progress_percentage}%`,
        b.assigned_volunteers_count,
      ]
        .map(sanitizeCsvCell)
        .join(",")
    );

    const titleLine = sanitizeCsvCell("CHUNAV SETU - INTERNAL CAMPAIGN OPERATIONAL REPORT (POLLING DAY TELEMETRY ONLY)");
    const dateLine = sanitizeCsvCell(`Date: ${dashboardStats.pollingDay?.polling_date || "12 December 2026"} | Status: ${dashboardStats.pollingDay?.status || "LIVE"}`);
    const summaryLine = sanitizeCsvCell(`Summary: Total Voters: ${dashboardStats.totalVoters} | Status Reported: ${dashboardStats.statusReported} | Voting Reported: ${dashboardStats.votingActivityReported} | Pending: ${dashboardStats.pendingVoters} | Turnout Rate: ${dashboardStats.turnoutPercentage}%`);

    const csvOutput = [titleLine, dateLine, summaryLine, "", headerLine, ...rows].join("\r\n");

    dbService.logAction(
      { id: session!.userId, name: session!.fullName },
      "POLLING_REPORT_EXPORTED",
      "Report",
      undefined,
      { format: "CSV", booths: boothStats.length },
      effectiveClientId
    );

    return new NextResponse(csvOutput, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Polling_Day_Operational_Report_${effectiveClientId}_${new Date().toISOString().split("T")[0]}.csv"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Polling export API error:", err);
    return NextResponse.json({ error: "Failed to generate operational report." }, { status: 500 });
  }
}

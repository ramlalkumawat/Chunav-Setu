import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/security/rate-limiter";
import { sanitizeCsvCell } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "voter", "export");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const effectiveClientId = tenantCheck.effectiveClientId!;

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(session!.userId, "export");
  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit);
  }

  try {
    const voterResult = await db.getVoters(effectiveClientId, { pageSize: 50000 });
    const allVoters = voterResult.data || [];

    const headers = [
      "Voter ID / EPIC",
      "Full Name",
      "Mobile",
      "Age",
      "Gender",
      "Address",
      "Contact Status",
      "Follow-up Status",
      "Notes",
    ];

    // Build sanitized CSV with formula injection defense
    const headerLine = headers.map(sanitizeCsvCell).join(",");
    const dataLines = allVoters.map((v) =>
      [
        v.voter_id_card,
        v.name,
        v.mobile || "",
        v.age || "",
        v.gender || "",
        v.address || "",
        v.contact_status,
        v.follow_up_status,
        v.notes || "",
      ]
        .map(sanitizeCsvCell)
        .join(",")
    );

    const csvOutput = [headerLine, ...dataLines].join("\r\n");

    // Audit Log the sensitive export event
    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "VOTERS_EXPORTED",
      "Voter",
      undefined,
      { count: allVoters.length, format: "CSV" },
      effectiveClientId
    );

    return new NextResponse(csvOutput, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Voters_Export_${effectiveClientId}_${new Date().toISOString().split("T")[0]}.csv"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Voter export API error:", err);
    return NextResponse.json({ error: "Failed to export voter dataset." }, { status: 500 });
  }
}

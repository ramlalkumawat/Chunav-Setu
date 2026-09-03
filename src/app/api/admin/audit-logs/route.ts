import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "audit_log", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const { searchParams } = new URL(req.url);
  const clientId = session!.role === "super_admin" ? (searchParams.get("clientId") || undefined) : session!.clientId;

  const logs = await db.getAuditLogs(clientId);
  return NextResponse.json(logs);
}

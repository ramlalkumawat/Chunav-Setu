import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { sanitizeString } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const client = await db.getClientById(params.id);
  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "update");
  if (!perm.authorized) return perm.errorResponse!;

  try {
    const body = await req.json();
    const updates: any = {};

    if (body.name) updates.name = sanitizeString(body.name);
    if (body.candidate_name) updates.candidate_name = sanitizeString(body.candidate_name);
    if (body.mobile) updates.mobile = sanitizeString(body.mobile);
    if (body.campaign_name) updates.campaign_name = sanitizeString(body.campaign_name);
    if (body.election_type) updates.election_type = sanitizeString(body.election_type);
    if (body.location) updates.location = sanitizeString(body.location);
    if (body.status && ["active", "inactive", "archived"].includes(body.status)) {
      updates.status = body.status;
    }
    if (body.poster_url !== undefined) updates.poster_url = body.poster_url;
    if (body.poster_alt !== undefined) updates.poster_alt = body.poster_alt;

    const updated = await db.updateClient(params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update client." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "CLIENT_UPDATED",
      "Client",
      params.id,
      updates,
      params.id
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update client error:", err);
    return NextResponse.json({ error: "Failed to update client record." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "client", "manage");
  if (!perm.authorized) return perm.errorResponse!;

  try {
    const body = await req.json();
    const action = body.action;

    if (action === "reset_password") {
      const result = await db.resetCandidatePassword(params.id, body.newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Password reset failed." }, { status: 500 });
      }

      await db.logAuditEvent(
        { id: session!.userId, name: session!.fullName },
        "PASSWORD_RESET",
        "CandidateAccount",
        params.id,
        { action: "Admin password reset" },
        params.id
      );

      return NextResponse.json({ success: true, tempPassword: result.tempPassword });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Action processing error." }, { status: 500 });
  }
}

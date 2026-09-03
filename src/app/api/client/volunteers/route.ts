import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/security/session";
import { requirePermission } from "@/lib/security/rbac";
import { validateTenantAccess } from "@/lib/security/tenant";
import { sanitizeString, isValidMobile } from "@/lib/security/sanitizer";
import { db } from "@/lib/supabase/database-service";

export async function GET(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "volunteer", "read");
  if (!perm.authorized) return perm.errorResponse!;

  const tenantCheck = validateTenantAccess(session!);
  if (!tenantCheck.authorized) return tenantCheck.errorResponse!;

  const volunteers = await db.getVolunteers(tenantCheck.effectiveClientId!);
  return NextResponse.json(volunteers);
}

export async function POST(req: NextRequest) {
  const session = getRequestSession(req);
  const perm = requirePermission(session, "volunteer", "create");
  if (!perm.authorized) return perm.errorResponse!;

  // Candidate must have valid client_id in session
  if (!session!.clientId) {
    return NextResponse.json(
      { error: "Forbidden. Account is not linked to any active campaign tenant." },
      { status: 403 }
    );
  }

  // Strictly enforce client inheritance: Server derives client_id directly from session
  const candidateClientId = session!.clientId;

  try {
    const body = await req.json();

    // Check if resetting password
    if (body.action === "reset_password" && body.volunteerId) {
      const permManage = requirePermission(session, "volunteer", "update");
      if (!permManage.authorized) return permManage.errorResponse!;

      const resetResult = await db.resetVolunteerPassword(candidateClientId, body.volunteerId, body.newPassword);
      if (!resetResult.success) {
        return NextResponse.json({ error: resetResult.error || "Password reset failed." }, { status: 500 });
      }

      await db.logAuditEvent(
        { id: session!.userId, name: session!.fullName },
        "PASSWORD_RESET",
        "VolunteerAccount",
        body.volunteerId,
        { action: "Candidate reset volunteer password" },
        candidateClientId
      );

      return NextResponse.json({ success: true, tempPassword: resetResult.tempPassword });
    }

    const name = sanitizeString(body.name);
    const mobile = sanitizeString(body.mobile);
    const email = body.email ? sanitizeString(body.email).toLowerCase() : undefined;
    const username = body.username ? sanitizeString(body.username).toLowerCase() : undefined;
    const password = body.password ? sanitizeString(body.password) : undefined;
    const assignedBoothId = body.assigned_booth_id ? sanitizeString(body.assigned_booth_id) : undefined;
    const assignedAreaId = body.assigned_area_id ? sanitizeString(body.assigned_area_id) : undefined;
    const notes = body.notes ? sanitizeString(body.notes) : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Valid volunteer name is required." }, { status: 400 });
    }

    if (!mobile || !isValidMobile(mobile)) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required." }, { status: 400 });
    }

    const { volunteer, tempPassword, error } = await db.createVolunteerUser(candidateClientId, {
      name,
      mobile,
      email,
      username,
      password,
      assigned_booth_id: assignedBoothId,
      assigned_area_id: assignedAreaId,
      notes,
    });

    if (error || !volunteer) {
      return NextResponse.json({ error: error || "Failed to create volunteer." }, { status: 500 });
    }

    await db.logAuditEvent(
      { id: session!.userId, name: session!.fullName },
      "VOLUNTEER_CREATED",
      "Volunteer",
      volunteer.id,
      { name, mobile, assignedBoothId },
      candidateClientId
    );

    return NextResponse.json({ volunteer, tempPassword }, { status: 201 });
  } catch (err: any) {
    console.error("Create volunteer API error:", err);
    return NextResponse.json({ error: "Failed to create volunteer account." }, { status: 500 });
  }
}

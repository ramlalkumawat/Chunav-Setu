import { SessionTokenPayload } from "./types";
import { NextResponse } from "next/server";

/**
 * Validates tenant ownership.
 * Super admins have global cross-tenant visibility.
 * All other roles MUST strictly match their session's assigned clientId.
 */
export function validateTenantAccess(
  session: SessionTokenPayload,
  targetClientId?: string
): { authorized: boolean; effectiveClientId?: string; errorResponse?: NextResponse } {
  // Super admin can access any requested tenant or defaults to the requested one
  if (session.role === "super_admin") {
    return {
      authorized: true,
      effectiveClientId: targetClientId || session.clientId || "client-1",
    };
  }

  // Non-super-admins MUST have a valid assigned clientId
  if (!session.clientId) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Forbidden. Account is not linked to any active campaign tenant." },
        { status: 403 }
      ),
    };
  }

  // Cross-tenant breach attempt detection
  if (targetClientId && targetClientId !== session.clientId) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          error: "Cross-Tenant Access Denied. You cannot access or modify records of another campaign.",
          code: "CROSS_TENANT_VIOLATION",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    effectiveClientId: session.clientId,
  };
}

/**
 * IDOR Defense Helper:
 * Ensures an entity lookup or modification contains the tenant's client_id.
 */
export function verifyEntityOwnership<T extends { client_id?: string; client_id_card?: string }>(
  entity: T | null | undefined,
  session: SessionTokenPayload
): boolean {
  if (!entity) return false;
  if (session.role === "super_admin") return true;
  return entity.client_id === session.clientId;
}

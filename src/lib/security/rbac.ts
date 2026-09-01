import { UserRole } from "../types";
import { Resource, Action, SessionTokenPayload } from "./types";
import { NextResponse } from "next/server";

// Comprehensive Role-Based Access Control matrix
const RBAC_MATRIX: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    system: ["read", "update", "manage", "switch_role"],
    client: ["create", "read", "update", "delete", "manage"],
    campaign: ["create", "read", "update", "delete", "manage"],
    voter: ["create", "read", "update", "delete", "export", "import", "manage"],
    booth: ["create", "read", "update", "delete", "manage"],
    volunteer: ["create", "read", "update", "delete", "manage"],
    task: ["create", "read", "update", "delete", "manage"],
    field_activity: ["create", "read", "update", "delete", "manage"],
    follow_up: ["create", "read", "update", "delete", "manage"],
    report: ["read", "export"],
    audit_log: ["read", "manage"],
    polling_day: ["create", "read", "update", "delete", "export", "manage"],
  },

  client_admin: {
    client: ["read", "update"],
    campaign: ["read", "update"],
    voter: ["create", "read", "update", "delete", "export", "import"],
    booth: ["create", "read", "update", "delete"],
    volunteer: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
    field_activity: ["read"],
    follow_up: ["create", "read", "update", "delete"],
    report: ["read", "export"],
    audit_log: ["read"],
    polling_day: ["create", "read", "update", "export", "manage"],
  },

  volunteer: {
    voter: ["read", "update"], // Can only update contact status/notes for assigned electors
    task: ["read", "update"], // Can only view and complete assigned tasks
    field_activity: ["create", "read"], // Can record door-to-door canvassing
    follow_up: ["create", "read", "update"], // Can log and resolve assigned callbacks
    polling_day: ["read", "update", "create"], // Can view assigned booth voters and record quick status / follow-up
  },
};

/**
 * Validates whether a specific role has permission to perform an action on a resource.
 */
export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
  const permissions = RBAC_MATRIX[role]?.[resource];
  if (!permissions) return false;
  return permissions.includes(action);
}

/**
 * Enforces RBAC permissions for a session.
 * Throws or returns an error response if authorization fails.
 */
export function requirePermission(
  session: SessionTokenPayload | null,
  resource: Resource,
  action: Action
): { authorized: boolean; errorResponse?: NextResponse } {
  if (!session) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.role, resource, action)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          error: "Forbidden. Insufficient permissions for requested resource action.",
          required: { resource, action },
          currentRole: session.role,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

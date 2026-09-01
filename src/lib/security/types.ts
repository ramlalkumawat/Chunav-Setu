import { UserRole } from "../types";

export interface SecurityUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  client_id?: string;
  assigned_booth_id?: string;
  assigned_area_id?: string;
  status: "active" | "inactive" | "suspended";
}

export interface SessionTokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  clientId?: string;
  assignedBoothId?: string;
  assignedAreaId?: string;
  createdAt: number;
  expiresAt: number;
  nonce: string;
}

export type Resource =
  | "system"
  | "client"
  | "campaign"
  | "voter"
  | "booth"
  | "volunteer"
  | "task"
  | "field_activity"
  | "follow_up"
  | "report"
  | "audit_log";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"
  | "manage"
  | "switch_role";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds?: number;
}

import crypto from "crypto";
import { SecurityUser } from "./types";
import { createAdminClient } from "../supabase/admin";

// In-memory failed login tracking for lockout defense
interface FailedAttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

const failedAttempts = new Map<string, FailedAttemptRecord>();

/**
 * Authenticates user credentials against Supabase Auth with account lockout defense.
 * Supports Username or Email login.
 */
export async function authenticateCredentials(
  identifier: string,
  password?: string
): Promise<{ success: boolean; user?: SecurityUser; error?: string; retryAfterSeconds?: number }> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const now = Date.now();

  // 1. Check account lockout
  const attempt = failedAttempts.get(normalizedIdentifier);
  if (attempt && attempt.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Account temporarily locked due to consecutive failed attempts. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
    };
  }

  if (!password || password.trim().length === 0) {
    return { success: false, error: "Password is required." };
  }

  const admin = createAdminClient();

  try {
    // 2. Resolve Identifier: Check if user entered username or email
    let authEmail = normalizedIdentifier;
    let profileRecord: any = null;

    if (!normalizedIdentifier.includes("@")) {
      // Lookup profile by username
      const { data: profileByUsername } = await admin
        .from("profiles")
        .select("*")
        .ilike("username", normalizedIdentifier)
        .single();

      if (profileByUsername) {
        authEmail = profileByUsername.email;
        profileRecord = profileByUsername;
      }
    }

    if (!profileRecord) {
      const { data: profileByEmail } = await admin
        .from("profiles")
        .select("*")
        .eq("email", authEmail)
        .single();

      profileRecord = profileByEmail;
    }

    // 3. Verify profile exists and is active
    if (profileRecord && profileRecord.status !== "active") {
      return {
        success: false,
        error: `Your account is ${profileRecord.status}. Please contact your administrator.`,
      };
    }

    // 4. Authenticate via Supabase Auth
    const { data: authData, error: authErr } = await admin.auth.signInWithPassword({
      email: authEmail,
      password: password,
    });

    if (authErr || !authData.user) {
      recordFailedAttempt(normalizedIdentifier);
      return {
        success: false,
        error: "Invalid username/email or password.",
      };
    }

    // Clear failed attempts on successful authentication
    failedAttempts.delete(normalizedIdentifier);

    // 5. Build verified SecurityUser object
    const userId = authData.user.id;
    let userRole = (authData.user.user_metadata?.role || profileRecord?.role || "volunteer") as any;
    let clientId = authData.user.user_metadata?.client_id || profileRecord?.client_id || null;
    let fullName = authData.user.user_metadata?.full_name || profileRecord?.full_name || authEmail.split("@")[0];

    // If profile exists in DB, ensure most up-to-date fields
    if (profileRecord) {
      userRole = profileRecord.role;
      clientId = profileRecord.client_id;
      fullName = profileRecord.full_name;
    }

    const securityUser: SecurityUser = {
      id: userId,
      email: authEmail,
      full_name: fullName,
      role: userRole,
      client_id: clientId || undefined,
      status: (profileRecord?.status || "active") as any,
    };

    return { success: true, user: securityUser };
  } catch (err: any) {
    console.error("Authentication error:", err);
    return { success: false, error: "Authentication service error. Please try again." };
  }
}

function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = failedAttempts.get(identifier) || { count: 0, lastAttempt: now, lockedUntil: 0 };
  record.count += 1;
  record.lastAttempt = now;

  // Lock for 5 minutes after 5 consecutive failures
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000;
  }

  failedAttempts.set(identifier, record);
}

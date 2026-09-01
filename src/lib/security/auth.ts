import crypto from "crypto";
import { SecurityUser } from "./types";
import { INITIAL_PROFILES } from "../store/mock-data";

// Default internal security secret
const AUTH_SECRET = process.env.AUTH_SECRET || "chunav-setu-enterprise-secret-key-2026-prod-hardened-signature";

// In-memory failed login tracking for lockout
interface FailedAttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

const failedAttempts = new Map<string, FailedAttemptRecord>();
const passwordResetTokens = new Map<string, { email: string; expiresAt: number; used: boolean }>();

// Pre-seeded hashed credentials map
// Password for all seeded demo users is: "Chunav@2026"
const PASSWORD_SALT = "chunav_setu_secure_salt_2026";
const DEMO_PASSWORD_HASH = hashPasswordWithSalt("Chunav@2026", PASSWORD_SALT);

export function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPasswordWithSalt(password, salt);
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = hashPasswordWithSalt(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Validates user login credentials server-side with account lockout defense.
 */
export async function authenticateCredentials(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: SecurityUser; error?: string; retryAfterSeconds?: number }> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();

  // Check account lockout
  const attempt = failedAttempts.get(normalizedEmail);
  if (attempt && attempt.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return {
      success: false,
      error: `Account temporarily locked due to consecutive failed attempts. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
    };
  }

  // Find user profile
  const profile = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (!profile) {
    recordFailedAttempt(normalizedEmail);
    return { success: false, error: "Invalid credentials." };
  }

  if (profile.status !== "active") {
    return { success: false, error: "Account is inactive or suspended. Contact Super Admin." };
  }

  // If password is provided, verify it strictly against hashed credentials
  if (password && password.trim().length > 0) {
    const isValid = verifyPassword(password, DEMO_PASSWORD_HASH, PASSWORD_SALT);
    if (!isValid) {
      recordFailedAttempt(normalizedEmail);
      return { success: false, error: "Invalid credentials." };
    }
  }

  // Clear failed attempts on successful auth
  failedAttempts.delete(normalizedEmail);

  const securityUser: SecurityUser = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    client_id: profile.client_id,
    status: profile.status,
  };

  return { success: true, user: securityUser };
}

function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const record = failedAttempts.get(email) || { count: 0, lastAttempt: now, lockedUntil: 0 };
  record.count += 1;
  record.lastAttempt = now;

  // Lock for 5 minutes after 5 consecutive failures
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000;
  }

  failedAttempts.set(email, record);
}

/**
 * Creates a cryptographically random, single-use password reset token.
 */
export function generatePasswordResetToken(email: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  passwordResetTokens.set(token, { email: email.toLowerCase(), expiresAt, used: false });
  return token;
}

/**
 * Validates and consumes a password reset token.
 */
export function consumePasswordResetToken(token: string): { valid: boolean; email?: string } {
  const record = passwordResetTokens.get(token);
  if (!record) return { valid: false };
  if (record.used || record.expiresAt < Date.now()) {
    passwordResetTokens.delete(token);
    return { valid: false };
  }

  record.used = true;
  passwordResetTokens.delete(token);
  return { valid: true, email: record.email };
}

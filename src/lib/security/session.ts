import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SecurityUser, SessionTokenPayload } from "./types";

export const SESSION_COOKIE_NAME = "chunav_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTH_SECRET = process.env.AUTH_SECRET || "chunav-setu-enterprise-secret-key-2026-prod-hardened-signature";

/**
 * Creates an HMAC-SHA256 signed session token string.
 */
export function createSessionToken(user: SecurityUser): string {
  const payload: SessionTokenPayload = {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    clientId: user.client_id,
    assignedBoothId: user.assigned_booth_id,
    assignedAreaId: user.assigned_area_id,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
    nonce: crypto.randomBytes(12).toString("hex"),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token.
 * Returns null if token is forged, expired, or malformed.
 */
export function verifySessionToken(tokenString: string): SessionTokenPayload | null {
  try {
    if (!tokenString || !tokenString.includes(".")) return null;
    const [payloadB64, signature] = tokenString.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const payload: SessionTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets the secure HttpOnly cookie on a Next.js NextResponse.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

/**
 * Clears the session cookie on a Next.js NextResponse.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Retrieves and verifies the session from Next.js server components or API routes.
 */
export async function getServerSession(): Promise<SessionTokenPayload | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies session from an incoming NextRequest.
 */
export function getRequestSession(req: NextRequest): SessionTokenPayload | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) {
    // Also check Authorization: Bearer <token> header for programmatic API calls
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return verifySessionToken(cookie.value);
}

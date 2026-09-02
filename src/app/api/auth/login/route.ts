import { NextRequest, NextResponse } from "next/server";
import { authenticateCredentials } from "@/lib/security/auth";
import { createSessionToken, setSessionCookie } from "@/lib/security/session";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/security/rate-limiter";
import { db } from "@/lib/supabase/database-service";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

    // 1. Rate Limiting Check (Auth endpoint)
    const rateLimit = checkRateLimit(ip, "auth");
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }

    const body = await req.json();
    const identifier = body.identifier || body.email || body.username;
    const password = body.password;

    if (!identifier || typeof identifier !== "string" || identifier.trim().length === 0) {
      return NextResponse.json({ error: "Username or Email is required." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    // 2. Authentication against Supabase Auth with account status verification
    const result = await authenticateCredentials(identifier.trim(), password);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // 3. Issue HMAC-SHA256 Signed Session Token & HttpOnly Cookie
    const token = createSessionToken(result.user);
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Authentication successful.",
    });

    setSessionCookie(response, token);

    // 4. Record Audit Log in PostgreSQL
    await db.logAuditEvent(
      { id: result.user.id, name: result.user.full_name },
      "USER_LOGIN",
      "Session",
      result.user.id,
      { ip, role: result.user.role },
      result.user.client_id
    );

    return response;
  } catch (err) {
    console.error("Auth login endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server authentication error." },
      { status: 500 }
    );
  }
}

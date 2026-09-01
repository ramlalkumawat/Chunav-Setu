import { NextRequest, NextResponse } from "next/server";
import { authenticateCredentials } from "@/lib/security/auth";
import { createSessionToken, setSessionCookie } from "@/lib/security/session";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/security/rate-limiter";
import { dbService } from "@/lib/store/data-service";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

    // 1. Rate Limiting Check
    const rateLimit = checkRateLimit(ip, "auth");
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit);
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // 2. Cryptographic Authentication
    const result = await authenticateCredentials(email, password);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Authentication failed." },
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

    // 4. Record Audit Log
    dbService.logAction(
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

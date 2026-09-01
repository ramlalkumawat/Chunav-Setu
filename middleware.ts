import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./src/lib/security/session";

// Public routes accessible without authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/demo-switch",
  "/api/auth/session",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Check if route is public
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith("/api/auth/"));

  // 3. Extract and verify session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? verifySessionToken(sessionCookie.value) : null;

  // 4. If accessing protected page without session, redirect to /login
  if (!isPublic && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required. Session missing or expired." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-based route enforcement
  if (session) {
    // Admin Route Protection
    if (pathname.startsWith("/admin") && session.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Super Admin privileges required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL(session.role === "volunteer" ? "/volunteer" : "/client", request.url));
    }

    // Client Admin Route Protection
    if (pathname.startsWith("/client") && session.role !== "client_admin" && session.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Candidate Admin privileges required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/volunteer", request.url));
    }

    // Volunteer Route Protection
    if (pathname.startsWith("/volunteer") && session.role !== "volunteer" && session.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Volunteer privileges required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/client", request.url));
    }
  }

  // 6. Security Headers Injection
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

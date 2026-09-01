import { RateLimitResult } from "./types";
import { NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  auth: { limit: 10, windowMs: 60 * 1000 }, // 10 attempts per minute
  export: { limit: 15, windowMs: 60 * 1000 }, // 15 exports per minute
  write: { limit: 60, windowMs: 60 * 1000 }, // 60 writes per minute
  read: { limit: 200, windowMs: 60 * 1000 }, // 200 reads per minute
};

// In-memory sliding log store
const rateLimitStore = new Map<string, number[]>();

// Periodic cleanup of stale records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const valid = timestamps.filter((t) => now - t < 5 * 60 * 1000);
      if (valid.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, valid);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks rate limit for an identifier (e.g. client IP or User ID) against a tier.
 */
export function checkRateLimit(
  identifier: string,
  tier: "auth" | "export" | "write" | "read" = "read"
): RateLimitResult {
  const config = LIMITS[tier] || LIMITS.read;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${tier}:${identifier}`;

  const timestamps = (rateLimitStore.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.limit) {
    const oldest = timestamps[0];
    const resetTimeMs = oldest + config.windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    return {
      allowed: false,
      remaining: 0,
      resetTimeMs,
      retryAfterSeconds,
    };
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.limit - timestamps.length,
    resetTimeMs: now + config.windowMs,
  };
}

/**
 * Helper to generate 429 Too Many Requests response with proper headers.
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Rate limit exceeded.",
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds || 60),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetTimeMs / 1000)),
      },
    }
  );
}

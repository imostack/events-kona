interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

// Preset configs
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 } as RateLimitConfig, // 5 per 15 min
  general: { windowMs: 60 * 1000, max: 100 } as RateLimitConfig, // 100 per minute
  upload: { windowMs: 60 * 1000, max: 10 } as RateLimitConfig, // 10 per minute
  webhook: { windowMs: 60 * 1000, max: 200 } as RateLimitConfig, // 200 per minute
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number; // seconds
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // First request or window expired - create new entry
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
      retryAfter: 0,
    };
  }

  if (entry.count >= config.max) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment counter
  entry.count++;
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

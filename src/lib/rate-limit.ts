/**
 * Rate Limiting Utility
 * Provides per-IP rate limiting for API endpoints
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

// In-memory store for rate limiting data
const store = new Map<string, RateLimitRecord>();

/**
 * Extract client IP address from request headers
 */
export function getClientIp(req: Request & { headers: Headers; ip?: string }): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0].trim() : req.headers.get("x-real-ip")) || (req as { ip?: string }).ip || "unknown";
}

/**
 * Check if request is within rate limit
 * @param ip - Client IP address
 * @param opts - Rate limiting options
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(ip: string, opts: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 10 }): boolean {
  const now = Date.now();
  const record = store.get(ip);

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetTime) {
    store.set(ip, { count: 1, resetTime: now + opts.windowMs });
    return true;
  }

  // If limit exceeded, deny request
  if (record.count >= opts.max) {
    return false;
  }

  // Increment count and allow request
  record.count++;
  return true;
}

/**
 * Get current rate limit status for an IP
 * @param ip - Client IP address
 * @param opts - Rate limiting options
 * @returns Object with current count and reset time
 */
export function getRateLimitStatus(ip: string, opts: RateLimitOptions = { windowMs: 15 * 60 * 1000, max: 10 }) {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    return {
      count: 0,
      limit: opts.max,
      resetTime: now + opts.windowMs,
      remaining: opts.max,
    };
  }

  return {
    count: record.count,
    limit: opts.max,
    resetTime: record.resetTime,
    remaining: Math.max(0, opts.max - record.count),
  };
}

/**
 * Clear rate limit data for an IP (useful for testing)
 * @param ip - Client IP address
 */
export function clearRateLimit(ip: string): void {
  store.delete(ip);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}

/**
 * Get all current rate limit records (for debugging)
 */
export function getAllRateLimits(): Map<string, RateLimitRecord> {
  return new Map(store);
}

/**
 * Clean up expired rate limit records
 * This should be called periodically to prevent memory leaks
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [ip, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(ip);
    }
  }
}

// Clean up expired records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
}

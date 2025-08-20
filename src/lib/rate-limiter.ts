interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 3, windowMs: number = 60 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs; // Default: 1 hour
  }

  isAllowed(email: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(email);

    if (!entry) {
      // First attempt
      this.attempts.set(email, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return true;
    }

    // Check if window has expired
    if (now - entry.firstAttempt > this.windowMs) {
      // Reset for new window
      this.attempts.set(email, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return true;
    }

    // Check if max attempts reached
    if (entry.attempts >= this.maxAttempts) {
      return false;
    }

    // Increment attempts
    entry.attempts++;
    entry.lastAttempt = now;
    return true;
  }

  getRemainingAttempts(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry) return this.maxAttempts;

    const now = Date.now();
    if (now - entry.firstAttempt > this.windowMs) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - entry.attempts);
  }

  getTimeUntilReset(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry) return 0;

    const now = Date.now();
    const timeSinceFirst = now - entry.firstAttempt;
    return Math.max(0, this.windowMs - timeSinceFirst);
  }

  // Clean up old entries to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [email, entry] of this.attempts.entries()) {
      if (now - entry.firstAttempt > this.windowMs) {
        this.attempts.delete(email);
      }
    }
  }
}

// Create a singleton instance for verification codes
export const verificationRateLimiter = new RateLimiter(3, 60 * 60 * 1000);

// Create rate limiters for different endpoints
export const adminRateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Clean up old entries every hour
setInterval(
  () => {
    verificationRateLimiter.cleanup();
    adminRateLimiter.cleanup();
    authRateLimiter.cleanup();
  },
  60 * 60 * 1000
);

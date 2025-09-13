import { randomBytes } from "crypto";

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Token expiration time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + TOKEN_EXPIRY;

  csrfTokens.set(sessionId, { token, expires });

  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token has expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Verify token matches
  return stored.token === token;
}

/**
 * Clean up expired tokens (call this periodically)
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now();

  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * Get CSRF token for a request
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Try to get token from header first
  const headerToken = request.headers.get("x-csrf-token");
  if (headerToken) {
    return headerToken;
  }

  // Try to get token from body for POST requests
  if (request.method === "POST") {
    try {
      // Note: This is a simplified approach. In production, you'd want to
      // handle this more carefully to avoid consuming the request body
      return null; // We'll handle this in the API route
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Get session ID from request (simplified - in production use proper session management)
 */
export function getSessionIdFromRequest(request: Request): string {
  // In a real implementation, you'd get this from the session
  // For now, we'll use a combination of IP and User-Agent as a simple identifier
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Create a simple hash-like identifier
  return Buffer.from(`${ip}-${userAgent}`).toString("base64").slice(0, 16);
}

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Stateless CSRF tokens signed with server secret
const CSRF_SECRET = process.env.CSRF_SECRET || "dev_csrf_secret"; // set a strong secret in prod

// Token expiration time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const expires = Date.now() + TOKEN_EXPIRY;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${sessionId}.${expires}.${nonce}`;
  const sig = createHmac("sha256", CSRF_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 4) return false;

  const [sid, expiresStr, nonce, sig] = parts;
  const expires = parseInt(expiresStr, 10);

  if (!sid || !expiresStr || !nonce || !sig || isNaN(expires)) return false;
  if (sid !== sessionId) return false;
  if (Date.now() > expires) return false;

  const payload = `${sid}.${expiresStr}.${nonce}`;
  const expected = createHmac("sha256", CSRF_SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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

  // Create a secure hash-like identifier using HMAC
  const input = `${ip}-${userAgent}`;
  const digest = createHmac("sha256", CSRF_SECRET).update(input).digest("base64url");
  return digest.slice(0, 32);
}

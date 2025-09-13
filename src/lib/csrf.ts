import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Stateless CSRF tokens signed with server secret
// 🚨 CRITICAL: Set CSRF_SECRET environment variable in production!
// Default secret is only for development - using it in production makes your app vulnerable to CSRF attacks
const CSRF_SECRET = process.env.CSRF_SECRET || "dev_csrf_secret";

// Token expiration time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * Convert buffer to base64url encoding (browser compatible)
 */
function toBase64Url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Convert base64url string to buffer (browser compatible)
 */
function fromBase64Url(str: string): Buffer {
  // Add padding back
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return Buffer.from(base64, "base64");
}

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const expires = Date.now() + TOKEN_EXPIRY;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${sessionId}.${expires}.${nonce}`;
  const sig = toBase64Url(createHmac("sha256", CSRF_SECRET).update(payload).digest());
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
  const expected = toBase64Url(createHmac("sha256", CSRF_SECRET).update(payload).digest());
  const a = fromBase64Url(sig);
  const b = fromBase64Url(expected);
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
  const digest = toBase64Url(createHmac("sha256", CSRF_SECRET).update(input).digest());
  return digest.slice(0, 32);
}

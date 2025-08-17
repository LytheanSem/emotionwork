import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract client IP address from request headers
 * Handles various proxy scenarios and headers
 */
export function getClientIP(headers: Headers): string {
  // Check for forwarded headers (common with proxies)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Check for real IP header
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Check for client IP header
  const clientIP = headers.get("x-client-ip");
  if (clientIP) {
    return clientIP;
  }

  // Check for CF-Connecting-IP (Cloudflare)
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }

  // Fallback to localhost for development
  return "127.0.0.1";
}

/**
 * Get user agent string from headers
 */
export function getUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "Unknown";
}

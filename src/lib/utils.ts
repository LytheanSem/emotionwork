import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Input sanitization utilities
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  // Remove HTML tags and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === "string") {
    return sanitizeString(input);
  }

  if (typeof input === "object" && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate username format (alphanumeric, underscores, hyphens)
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
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

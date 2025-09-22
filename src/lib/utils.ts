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

/**
 * Parse a date string in YYYY-MM-DD format as a local date to avoid off-by-one errors
 * new Date("YYYY-MM-DD") is parsed as UTC in some browsers, causing timezone issues
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string provided');
  }

  // Match YYYY-MM-DD format
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    throw new Error('Date string must be in YYYY-MM-DD format');
  }

  const [, year, month, day] = dateMatch;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  // Validate date components
  if (yearNum < 1900 || yearNum > 2100) {
    throw new Error('Year must be between 1900 and 2100');
  }
  if (monthNum < 1 || monthNum > 12) {
    throw new Error('Month must be between 1 and 12');
  }
  if (dayNum < 1 || dayNum > 31) {
    throw new Error('Day must be between 1 and 31');
  }

  // Create local date (month is 0-indexed in Date constructor)
  const localDate = new Date(yearNum, monthNum - 1, dayNum);
  
  // Validate the date is valid (handles cases like Feb 30)
  if (localDate.getFullYear() !== yearNum || 
      localDate.getMonth() !== monthNum - 1 || 
      localDate.getDate() !== dayNum) {
    throw new Error('Invalid date');
  }

  return localDate;
}

/**
 * Parse a date string in YYYY-MM-DD format and return as ISO string for storage
 * This ensures consistent date handling across different timezones
 */
export function parseLocalDateAsISO(dateString: string): string {
  const localDate = parseLocalDate(dateString);
  return localDate.toISOString();
}
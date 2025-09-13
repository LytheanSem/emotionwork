import { NextRequest } from "next/server";

// Request size limits (in bytes)
export const REQUEST_LIMITS = {
  // General API requests
  API_REQUEST: 1024 * 1024, // 1MB

  // File uploads (if any)
  FILE_UPLOAD: 10 * 1024 * 1024, // 10MB

  // JSON payloads
  JSON_PAYLOAD: 512 * 1024, // 512KB

  // Form data
  FORM_DATA: 2 * 1024 * 1024, // 2MB
} as const;

/**
 * Check if request size is within limits
 */
export function checkRequestSize(request: NextRequest, limit: number = REQUEST_LIMITS.API_REQUEST): boolean {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    // If no content-length header, we can't determine size
    // Allow the request but log a warning
    console.warn("Request without content-length header");
    return true;
  }

  const size = parseInt(contentLength, 10);

  if (isNaN(size)) {
    console.warn("Invalid content-length header:", contentLength);
    return false;
  }

  return size <= limit;
}

/**
 * Get appropriate size limit for different request types
 */
export function getSizeLimitForPath(pathname: string): number {
  // File upload endpoints
  if (pathname.includes("/upload") || pathname.includes("/media")) {
    return REQUEST_LIMITS.FILE_UPLOAD;
  }

  // Form data endpoints
  if (pathname.includes("/form") || pathname.includes("/submit")) {
    return REQUEST_LIMITS.FORM_DATA;
  }

  // JSON API endpoints
  if (pathname.startsWith("/api/")) {
    return REQUEST_LIMITS.JSON_PAYLOAD;
  }

  // Default limit
  return REQUEST_LIMITS.API_REQUEST;
}

/**
 * Middleware function to check request size
 */
export function validateRequestSize(request: NextRequest): { valid: boolean; error?: string } {
  const pathname = request.nextUrl.pathname;
  const limit = getSizeLimitForPath(pathname);

  if (!checkRequestSize(request, limit)) {
    const sizeMB = (limit / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Request too large. Maximum size allowed: ${sizeMB}MB`,
    };
  }

  return { valid: true };
}

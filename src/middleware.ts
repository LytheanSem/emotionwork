import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    // Allow unsafe-inline for Next.js scripts in production (required for Next.js)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://sheets.googleapis.com https://gmail.googleapis.com",
    "frame-ancestors 'none'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Admin routes are protected by the admin page component itself
    // which checks for admin privileges using NextAuth session
    return response;
  }

  // Allow all other routes
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

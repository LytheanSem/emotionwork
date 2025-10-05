import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // www redirects are handled by next.config.ts redirects

  // Create response
  const response = NextResponse.next();

  // Enhanced security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Add HSTS header for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // CSP is set in next.config.ts headers()

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

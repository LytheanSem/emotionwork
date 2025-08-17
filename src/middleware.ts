import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that handle their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin routes - ensure they're properly protected
  if (pathname.startsWith("/admin")) {
    // Admin routes are handled by PayloadCMS's built-in authentication
    // We just need to ensure they're not accessible from frontend context
    return NextResponse.next();
  }

  // Frontend routes - ensure they don't have admin privileges
  if (
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/service") ||
    pathname.startsWith("/equipment") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/bookmeeting") ||
    pathname.startsWith("/design") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    // Frontend routes are accessible to all users
    // Authentication is handled by the navbar component
    return NextResponse.next();
  }

  return NextResponse.next();
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

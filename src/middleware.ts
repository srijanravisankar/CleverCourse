import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session cookie name (must match auth.ts)
const SESSION_COOKIE = "clevercourse_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup"];

// Static files and API routes to exclude from middleware
const excludedPaths = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/landing-page-image.jpg",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths (static files, API routes, etc.)
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const isAuthenticated = isValidSession(sessionCookie?.value);

  // If on a public route and authenticated, redirect to home
  if (publicRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If on a protected route and not authenticated, redirect to login
  if (!publicRoutes.includes(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Optionally preserve the intended destination
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Validate session cookie (simple check - matches auth.ts logic)
 */
function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }

  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const [userId, timestampStr] = decoded.split(":");
    const timestamp = parseInt(timestampStr, 10);

    // Check if session is expired
    if (Date.now() - timestamp > SESSION_MAX_AGE) {
      return false;
    }

    // Basic validation that userId exists
    return !!userId && userId.length > 0;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For demo purposes, we'll simulate authentication
  // In a real app, you'd check for valid JWT tokens or session cookies
  const isAuthenticated = request.cookies.get("auth-token") || true // Mock authentication

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/"]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith("/api/auth"),
  )

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
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
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if user is authenticated (has token in cookies)
  const token = request.cookies.get('token')?.value

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // If user is not authenticated and trying to access a protected route
  if (!token && !isPublicRoute) {
    // Redirect to login page
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (token && isPublicRoute) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
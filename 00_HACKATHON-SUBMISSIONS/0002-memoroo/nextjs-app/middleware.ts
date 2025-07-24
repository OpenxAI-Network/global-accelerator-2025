import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware function runs after auth check
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/flashcards", "/api/quiz", "/api/study-buddy"],
}
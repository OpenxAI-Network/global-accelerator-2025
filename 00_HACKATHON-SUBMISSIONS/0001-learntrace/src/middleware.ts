import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("[MW test] Path:", req.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

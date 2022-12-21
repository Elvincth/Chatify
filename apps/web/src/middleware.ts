import { NextRequest, NextResponse } from "next/server";
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest, res: NextResponse) {
  const loggedIn = req.cookies.get("access-token");
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") || // exclude Next.js internals
    pathname.startsWith("/api") || //  exclude all API routes
    pathname.startsWith("/static") || // exclude static files
    PUBLIC_FILE.test(pathname) // exclude all files in the public folder
  ) {
    return NextResponse.next();
  }

  if (!loggedIn && (pathname.startsWith("/chat") || pathname === "/")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    loggedIn &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }
}

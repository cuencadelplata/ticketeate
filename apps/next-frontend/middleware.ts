
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";


const COOKIE_NAME = "better-auth.session_token";

export function middleware(req: NextRequest) {
  
  let hasSession = !!getSessionCookie(req);
 
  if (!hasSession) hasSession = !!req.cookies.get(COOKIE_NAME)?.value;

  if (!hasSession) {
    const url = new URL("/sign-in", req.url);
    // preserva a dónde quería ir la persona
    url.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/eventos/:path*",
    "/crear/:path*",
    "/productoras/:path*",
    "/evento/manage/:path*",
  ],
};

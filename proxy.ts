import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

  // 1. Redirect to /login if trying to access a protected route without a token
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !refreshToken) {
    const url = new URL("/login", request.url);
    // Keep track of the original page to redirect back after login
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect to /dashboard if trying to access auth pages when already logged in
  if (authRoutes.some((route) => pathname.startsWith(route)) && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Set global custom platform headers
  const response = NextResponse.next();
  response.headers.set("x-custom-platform", "smart-picks-india");

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

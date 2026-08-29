import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/pawn-tickets") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/onboarding");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (isAuthPage || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/customers/:path*",
    "/pawn-tickets/:path*",
    "/inventory/:path*",
    "/payments/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/analytics/:path*",
    "/employees/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/help/:path*",
  ],
};


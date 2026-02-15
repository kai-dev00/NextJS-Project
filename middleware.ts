import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";

  /**
   * ===============================
   * LOGIN PAGE
   * ===============================
   * If user is already authenticated,
   * block access to /login
   */
  if (isLoginRoute) {
    if (!accessToken) {
      return NextResponse.next();
    }

    try {
      await verifyAccessToken(accessToken);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      return NextResponse.next();
    }
  }

  /**
   * ===============================
   * DASHBOARD (PROTECTED)
   * ===============================
   */
  if (isDashboardRoute) {
    // 1. Try access token
    if (accessToken) {
      try {
        await verifyAccessToken(accessToken);
        return NextResponse.next();
      } catch {
        // access token expired → try refresh
      }
    }

    // 2. Try refresh token
    if (refreshToken) {
      try {
        await verifyRefreshToken(refreshToken);

        const refreshUrl = new URL("/api/auth/refresh", req.url);
        refreshUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(refreshUrl);
      } catch {
        // refresh invalid
      }
    }

    // 3. No valid tokens → login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

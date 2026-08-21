import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // TODO: AKTIFKAN LAGI SEBELUM PRODUCTION (Nonaktif sementara untuk keperluan UI testing)
  return NextResponse.next();

  const pathname = request.nextUrl.pathname;

  // Check for protected routes: /peserta, /juri, /admin
  const isProtectedRoute =
    pathname.startsWith("/peserta") ||
    pathname.startsWith("/juri") ||
    pathname.startsWith("/admin");

  if (isProtectedRoute) {
    // Check if refresh token cookie is present
    const refreshToken =
      request.cookies.get("refreshToken")?.value ||
      request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/peserta/:path*",
    "/juri/:path*",
    "/admin/:path*",
  ],
};

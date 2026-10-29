import { NextResponse } from "next/server";

export function proxy() {
  // TEMPORARY: auth guard disabled for local dev — allow dashboard access without login
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/peserta/:path*", "/juri/:path*", "/admin/:path*"],
};

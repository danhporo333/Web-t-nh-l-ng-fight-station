import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Chỉ kiểm tra có cookie session hay chưa. Quyền thật nằm trong src/lib/auth.ts.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/change-password"],
};

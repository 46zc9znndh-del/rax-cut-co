import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/cms/session";
import { verifySessionTokenEdge } from "@/lib/cms/auth-edge";

function isProtectedAdminPath(pathname: string) {
  if (pathname === "/admin") return false;
  if (pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/login")) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authenticated = await verifySessionTokenEdge(token);

  if (!authenticated) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/driver/login",
  "/api/health",
  "/health",
  "/healthz",
  "/manifest.webmanifest",
  "/sw.js",
  "/offline",
];

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/offline.html"
  );
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  url.hash = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    if (pathname === "/health" || pathname === "/healthz") {
      const url = request.nextUrl.clone();
      url.pathname = "/api/health";
      return NextResponse.rewrite(url);
    }
    if (isPublic(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get("trm_session")?.value;
    const secret = process.env.AUTH_SECRET || "atlas-coast-transfer-auth-secret";
    if (!token) {
      return redirectTo(request, "/login");
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const role = payload.role === "driver" ? "driver" : "admin";
      if (role === "driver" && !pathname.startsWith("/driver")) {
        return redirectTo(request, "/driver");
      }
      return NextResponse.next();
    } catch {
      const response = redirectTo(request, "/login");
      response.cookies.delete("trm_session");
      return response;
    }
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

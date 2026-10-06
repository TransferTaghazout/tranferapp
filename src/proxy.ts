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

function firstHeader(request: NextRequest, name: string) {
  return request.headers.get(name)?.split(",")[0]?.trim() || "";
}

function publicOrigin(request: NextRequest) {
  const host =
    firstHeader(request, "x-forwarded-host") || firstHeader(request, "host") || request.nextUrl.host;
  const proto =
    firstHeader(request, "x-forwarded-proto") ||
    (request.nextUrl.protocol === "https:" ? "https" : "http");
  return `${proto}://${host}`;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(`${publicOrigin(request)}${path}`);
}

function nextWithForwardedHost(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const host = firstHeader(request, "x-forwarded-host") || firstHeader(request, "host");
  const proto = firstHeader(request, "x-forwarded-proto") || "https";
  if (host) {
    requestHeaders.set("x-forwarded-host", host);
    requestHeaders.set("x-forwarded-proto", proto);
    requestHeaders.set("host", host);
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/health" || pathname === "/healthz") {
    return NextResponse.rewrite(new URL("/api/health", request.url));
  }
  if (isPublic(pathname)) {
    return nextWithForwardedHost(request);
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
    if (role === "admin" && pathname.startsWith("/driver") && pathname !== "/driver/login") {
      return nextWithForwardedHost(request);
    }
    return nextWithForwardedHost(request);
  } catch {
    const response = redirectTo(request, "/login");
    response.cookies.delete("trm_session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

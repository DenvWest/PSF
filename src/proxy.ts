import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";

function requiresAdminAuth(pathname: string): boolean {
  const isAdminArea =
    pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminArea) {
    if (pathname === "/admin/login") return false;
    if (pathname.startsWith("/admin/api")) return false;
    return true;
  }
  if (pathname.startsWith("/api/admin/auth")) {
    return false;
  }
  if (pathname.startsWith("/api/admin/")) {
    return true;
  }
  return false;
}

function getSupabaseOrigin(): string | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!rawUrl) {
    return null;
  }

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function buildContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";
  const connectSrc = [
    "'self'",
    "https://challenges.cloudflare.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
  ];

  const supabaseOrigin = getSupabaseOrigin();
  if (supabaseOrigin) {
    connectSrc.push(supabaseOrigin);
  }

  if (!isProduction) {
    connectSrc.push("ws:");
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src https://challenges.cloudflare.com",
    "manifest-src 'self'",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (requiresAdminAuth(pathname)) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
    if (!isValidAdminSessionCookie(token)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Niet geautoriseerd." },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next();
  const isSecureRequest =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (process.env.NODE_ENV === "production" && isSecureRequest) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

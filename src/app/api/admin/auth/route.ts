import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  getAdminSecret,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { signAdminCookie } from "@/lib/admin-session-cookie";
import { getClientIp } from "@/lib/client-ip";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";

/** `path: "/"` zodat het token ook bij `/api/admin/*` wordt meegestuurd. */
const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 43200,
};

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminSecret = getAdminSecret();

  if (!adminPassword || !adminSecret) {
    return NextResponse.json(
      { error: "Admin is niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "admin_auth",
    clientIp,
    getRateLimitConfig("admin_auth"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel inlogpogingen, probeer het over 15 minuten opnieuw" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const password =
    body &&
    typeof body === "object" &&
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (!verifyAdminPassword(password, adminPassword)) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const sessionToken = signAdminCookie();
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Admin is niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_TOKEN_COOKIE_NAME, sessionToken, {
    ...COOKIE_BASE,
    secure: isProd,
  });
  return res;
}

export async function GET(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.set(ADMIN_TOKEN_COOKIE_NAME, "", {
    ...COOKIE_BASE,
    secure: isProd,
    maxAge: 0,
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { getClientIp } from "@/lib/turnstile-verify";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;

function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn("[api/intake/recover][security]", { event, ...details });
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (!process.env.COOKIE_SECRET?.trim()) {
    return NextResponse.json(
      { error: "Sessie is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const sid = request.nextUrl.searchParams.get("sid")?.trim() ?? "";
  const sessionId = verifySignedIntakeSessionCookie(sid);
  if (!sessionId) {
    logSecurityEvent("invalid_sid", { remoteIp: clientIp });
    return NextResponse.redirect(new URL(`${getPublicSiteUrl()}/intake`));
  }

  const dest = new URL(`${getPublicSiteUrl()}/intake?resultaten=true`);
  const res = NextResponse.redirect(dest);
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}

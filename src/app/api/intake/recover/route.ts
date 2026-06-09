import { NextRequest, NextResponse } from "next/server";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import {
  INTAKE_REMEASURE_BASELINE_COOKIE_NAME,
  REMEASURE_BASELINE_COOKIE_MAX_AGE_SEC,
  signRemeasureBaselineSessionId,
} from "@/lib/intake-remeasure-cookie";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import {
  isSessionRecoverable,
  resolveRecoveryToken,
} from "@/lib/recovery-token";
import { getClientIp } from "@/lib/turnstile-verify";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;

function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn("[api/intake/recover][security]", { event, ...details });
}

function redirectToIntake(): NextResponse {
  return NextResponse.redirect(new URL(`${getPublicSiteUrl()}/intake`));
}

function setSessionCookie(signedCookie: string): NextResponse {
  const dest = new URL(`${getPublicSiteUrl()}/intake?resultaten=true`);
  const res = NextResponse.redirect(dest);
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, signedCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  return res;
}

function setRemeasureCookie(baselineSessionId: string): NextResponse {
  const signed = signRemeasureBaselineSessionId(baselineSessionId);
  if (!signed) {
    return redirectToIntake();
  }

  const dest = new URL(`${getPublicSiteUrl()}/intake?hermeting=1`);
  const res = NextResponse.redirect(dest);
  res.cookies.set(INTAKE_REMEASURE_BASELINE_COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REMEASURE_BASELINE_COOKIE_MAX_AGE_SEC,
  });
  return res;
}

async function redirectWithExistingSession(
  request: NextRequest,
): Promise<NextResponse | null> {
  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  if (!rawCookie) {
    return null;
  }
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);
  if (!sessionId) {
    return null;
  }
  const recoverable = await isSessionRecoverable(sessionId);
  if (!recoverable) {
    return null;
  }
  return setSessionCookie(rawCookie);
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

  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";
  const mode = request.nextUrl.searchParams.get("mode")?.trim() ?? "";
  if (token) {
    const result = await resolveRecoveryToken(token);
    if (!result.ok) {
      logSecurityEvent("invalid_token", {
        remoteIp: clientIp,
        reason: result.reason,
      });
      const existingSession = await redirectWithExistingSession(request);
      if (existingSession) {
        return existingSession;
      }
      return redirectToIntake();
    }
    if (mode === "remeasure") {
      return setRemeasureCookie(result.sessionId);
    }
    return setSessionCookie(result.signedCookie);
  }

  const sid = request.nextUrl.searchParams.get("sid")?.trim() ?? "";
  const sessionId = verifySignedIntakeSessionCookie(sid);
  if (!sessionId) {
    logSecurityEvent("invalid_sid", { remoteIp: clientIp });
    return redirectToIntake();
  }

  const recoverable = await isSessionRecoverable(sessionId);
  if (!recoverable) {
    logSecurityEvent("sid_session_invalid", { remoteIp: clientIp });
    return redirectToIntake();
  }

  logSecurityEvent("legacy_sid_used", { remoteIp: clientIp });
  return setSessionCookie(sid);
}

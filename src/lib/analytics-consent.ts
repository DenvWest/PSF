import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_CONSENT_STATE_COOKIE_NAME } from "@/lib/analytics-consent-constants";

export const ANALYTICS_CONSENT_COOKIE_NAME = "psf_analytics_consent";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;

function getSecret(): string | null {
  const secret = process.env.COOKIE_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

export function signAnalyticsConsentFlag(granted: boolean): string | null {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const payload = granted ? "1" : "0";
  const sig = createHmac("sha256", secret)
    .update(`analytics-consent:${payload}`)
    .digest("hex");
  return `${payload}.${sig}`;
}

/**
 * Verifieert HMAC en retourneert true alleen bij expliciete toestemming (waarde "1").
 */
export function verifyAnalyticsConsentCookie(
  raw: string | undefined,
): boolean {
  if (!raw || typeof raw !== "string") {
    return false;
  }

  const secret = getSecret();
  if (!secret) {
    return false;
  }

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) {
    return false;
  }

  const payload = raw.slice(0, dot);
  const sigHex = raw.slice(dot + 1);

  if ((payload !== "1" && payload !== "0") || sigHex.length !== 64) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`analytics-consent:${payload}`)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sigHex, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return false;
    }
  } catch {
    return false;
  }

  return payload === "1";
}

export function getAnalyticsConsentFromRequest(request: NextRequest): boolean {
  const raw = request.cookies.get(ANALYTICS_CONSENT_COOKIE_NAME)?.value;
  return verifyAnalyticsConsentCookie(raw);
}

export function applyAnalyticsConsentCookie(
  response: NextResponse,
  granted: boolean,
): void {
  const signed = signAnalyticsConsentFlag(granted);
  if (!signed) {
    return;
  }

  response.cookies.set(ANALYTICS_CONSENT_COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
}

export function clearAnalyticsConsentCookie(response: NextResponse): void {
  response.cookies.set(ANALYTICS_CONSENT_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function applyAnalyticsConsentStateCookie(
  response: NextResponse,
  granted: boolean,
): void {
  response.cookies.set(
    ANALYTICS_CONSENT_STATE_COOKIE_NAME,
    granted ? "granted" : "denied",
    {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SEC,
    },
  );
}

export function clearAnalyticsConsentStateCookie(response: NextResponse): void {
  response.cookies.set(ANALYTICS_CONSENT_STATE_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

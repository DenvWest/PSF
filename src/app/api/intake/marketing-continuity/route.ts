import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  normalizeMarketingEmail,
  resolveIntakeMarketingContinuity,
  shouldSteerToDashboard,
} from "@/lib/intake-marketing-continuity";
import { consumeRateLimit, consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const ipRateLimit = await consumeRateLimitForIp(
    "account_login_eligibility",
    clientIp,
    getRateLimitConfig("account_login_eligibility"),
  );

  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        mainNurtureActive: false,
        hasActiveAccount: false,
        steerToDashboard: false,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipRateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      mainNurtureActive: false,
      hasActiveAccount: false,
      steerToDashboard: false,
    });
  }

  const email = normalizeMarketingEmail(
    normalizeSingleLine(
      body && typeof body === "object"
        ? (body as Record<string, unknown>).email
        : undefined,
    ),
  );

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({
      mainNurtureActive: false,
      hasActiveAccount: false,
      steerToDashboard: false,
    });
  }

  const emailRateLimit = await consumeRateLimit(
    `intake_marketing_continuity:email:${sha256Hex(email)}`,
    getRateLimitConfig("account_login_eligibility"),
  );

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      {
        mainNurtureActive: false,
        hasActiveAccount: false,
        steerToDashboard: false,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(emailRateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const continuity = await resolveIntakeMarketingContinuity(email);

  return NextResponse.json({
    mainNurtureActive: continuity.mainNurtureActive,
    hasActiveAccount: continuity.hasActiveAccount,
    steerToDashboard: shouldSteerToDashboard(continuity),
  });
}

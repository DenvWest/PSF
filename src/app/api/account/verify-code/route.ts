import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimit, consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { sha256Hex } from "@/lib/consent-hashing";
import { hashLoginCode } from "@/lib/account-login-token";
import { emitEvent } from "@/lib/events";
import {
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  ACCOUNT_SESSION_COOKIE_NAME,
  signAccountCookie,
} from "@/lib/account-session-cookie";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const CODE_RE = /^\d{6}$/;

const GENERIC_ERROR = "Code klopt niet of is verlopen.";

type AccountRow = {
  id: string;
  status: string | null;
};

type VerifyTokenRow = {
  account_id: string;
};

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const ipRateLimit = await consumeRateLimitForIp(
    "account_verify_code",
    clientIp,
    getRateLimitConfig("account_verify_code"),
  );

  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
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
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const email = normalizeSingleLine(bodyRecord.email).toLowerCase();
  const code = normalizeSingleLine(bodyRecord.code);

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const emailRateLimit = await consumeRateLimit(
    `account_verify_code:email:${sha256Hex(email)}`,
    getRateLimitConfig("account_verify_code"),
  );

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(emailRateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const { data: account, error: accountError } = await admin
    .from("accounts")
    .select("id,status")
    .eq("email", email)
    .maybeSingle<AccountRow>();

  if (accountError) {
    console.error("[api/account/verify-code] account lookup error:", accountError);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!account || account.status === "revoked") {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const nowIso = new Date().toISOString();
  const tokenHash = hashLoginCode(account.id, code);
  const { data: claimedToken, error: claimError } = await admin
    .from("account_login_tokens")
    .update({ used_at: nowIso })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", nowIso)
    .select("account_id")
    .maybeSingle<VerifyTokenRow>();

  if (claimError || !claimedToken) {
    if (claimError) {
      console.error("[api/account/verify-code] token claim error:", claimError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const signed = signAccountCookie(claimedToken.account_id);
  if (!signed) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const intakeSessionId = verifySignedIntakeSessionCookie(
    request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value,
  );
  void emitEvent({
    eventType: "account.logged_in",
    sessionId: intakeSessionId,
    email,
    payload: {
      login_method: "code",
    },
    deliveredTo: ["posthog"],
  });
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: signed,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { sha256Hex } from "@/lib/consent-hashing";
import { verifySignedIntakeSessionCookie } from "@/lib/intake-session-cookie";
import { INTAKE_SESSION_COOKIE_NAME } from "@/lib/intake-session-cookie";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";
import type { LoginPrimaryAction } from "@/lib/login-primary-action";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

type AccountRow = {
  id: string;
  status: string | null;
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
    "account_login_eligibility",
    clientIp,
    getRateLimitConfig("account_login_eligibility"),
  );

  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      { primaryAction: "intake" satisfies LoginPrimaryAction },
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
    return NextResponse.json({ primaryAction: "intake" satisfies LoginPrimaryAction });
  }

  const email = normalizeSingleLine(
    body && typeof body === "object"
      ? (body as Record<string, unknown>).email
      : undefined,
  ).toLowerCase();

  const sessionId = verifySignedIntakeSessionCookie(
    request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value,
  );

  if (sessionId) {
    return NextResponse.json({ primaryAction: "login" satisfies LoginPrimaryAction });
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ primaryAction: "intake" satisfies LoginPrimaryAction });
  }

  const emailRateLimit = await consumeRateLimit(
    `account_login_eligibility:email:${sha256Hex(email)}`,
    getRateLimitConfig("account_login_eligibility"),
  );

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { primaryAction: "intake" satisfies LoginPrimaryAction },
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
    return NextResponse.json({ primaryAction: "intake" satisfies LoginPrimaryAction });
  }

  const { data: account, error } = await admin
    .from("accounts")
    .select("id,status")
    .eq("email", email)
    .maybeSingle<AccountRow>();

  if (error) {
    console.error("[api/account/login-eligibility] account lookup error:", error);
    return NextResponse.json({ primaryAction: "intake" satisfies LoginPrimaryAction });
  }

  const primaryAction: LoginPrimaryAction =
    account && account.status !== "revoked" ? "login" : "intake";

  return NextResponse.json({ primaryAction });
}

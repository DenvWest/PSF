import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { hashLoginCode } from "@/lib/account-login-token";
import { absoluteUrl } from "@/lib/public-site-url";
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE_RE = /^\d{6}$/;

const GENERIC_ERROR = "Deze link werkt niet meer of de code klopt niet.";

type VerifyTokenRow = {
  account_id: string;
};

type AccountStatusRow = {
  status: string | null;
  email: string | null;
};

/**
 * GET authenticeert niet meer direct (dat was het lek: e-mail-linkscanners
 * bezoeken links automatisch en verbruiken zo de eenmalige code). GET doet
 * alleen een format-check en stuurt door naar de pagina, die de code zelf
 * via een POST-fetch verzilvert — dat vereist JS-executie.
 */
export async function GET(request: NextRequest) {
  const aid = request.nextUrl.searchParams.get("aid");
  const code = request.nextUrl.searchParams.get("code");

  if (!aid || !UUID_RE.test(aid) || !code || !CODE_RE.test(code)) {
    return NextResponse.redirect(absoluteUrl("/account/verify"));
  }

  return NextResponse.redirect(
    absoluteUrl(
      `/account/verify?aid=${encodeURIComponent(aid)}&code=${encodeURIComponent(code)}`,
    ),
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "account_verify",
    clientIp,
    getRateLimitConfig("account_verify"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
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
  const aid = typeof bodyRecord.aid === "string" ? bodyRecord.aid : "";
  const code = typeof bodyRecord.code === "string" ? bodyRecord.code : "";

  if (!UUID_RE.test(aid) || !CODE_RE.test(code)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const nowIso = new Date().toISOString();
  const tokenHash = hashLoginCode(aid, code);
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
      console.error("[api/account/verify][POST] token claim error:", claimError);
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const { data: account, error: accountError } = await admin
    .from("accounts")
    .select("status,email")
    .eq("id", claimedToken.account_id)
    .maybeSingle<AccountStatusRow>();

  if (accountError || !account || account.status === "revoked") {
    if (accountError) {
      console.error("[api/account/verify][POST] account lookup error:", accountError);
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
    email: account.email ?? undefined,
    payload: {
      login_method: "magic_link",
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

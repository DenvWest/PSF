import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimit, consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { sha256Hex } from "@/lib/consent-hashing";
import { verifySignedIntakeSessionCookie } from "@/lib/intake-session-cookie";
import { INTAKE_SESSION_COOKIE_NAME } from "@/lib/intake-session-cookie";
import { accountStorageConsentRow } from "@/lib/account-storage-consent";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createRawLoginToken, hashLoginToken, loginTokenExpiryIso } from "@/lib/account-login-token";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { sendAccountLoginEmail } from "@/lib/account-login-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

type AccountRow = {
  id: string;
  status: string | null;
};

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const ipRateLimit = await consumeRateLimitForIp(
    "account_request_link",
    clientIp,
    getRateLimitConfig("account_request_link"),
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
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const website = normalizeSingleLine(bodyRecord.website);
  if (website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = normalizeSingleLine(bodyRecord.email).toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }

  const consent = bodyRecord.consent === true;
  const emailRateLimit = await consumeRateLimit(
    `account_request_link:email:${sha256Hex(email)}`,
    getRateLimitConfig("account_request_link"),
  );

  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het zo opnieuw." },
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

  const sessionId = verifySignedIntakeSessionCookie(
    request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value,
  );

  let account: AccountRow | null = null;
  const { data: existingAccount, error: accountError } = await admin
    .from("accounts")
    .select("id,status")
    .eq("email", email)
    .maybeSingle<AccountRow>();

  if (accountError) {
    console.error("[api/account/request-link] account lookup error:", accountError);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (existingAccount && existingAccount.status !== "revoked") {
    account = existingAccount;
  } else if (!existingAccount && consent && sessionId) {
    const { data: insertedAccount, error: insertAccountError } = await admin
      .from("accounts")
      .insert({ email })
      .select("id,status")
      .single<AccountRow>();

    if (insertAccountError || !insertedAccount) {
      console.error("[api/account/request-link] account insert error:", insertAccountError);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    account = insertedAccount;

    const { error: sessionLinkError } = await admin
      .from("intake_sessions")
      .update({ account_id: account.id })
      .eq("id", sessionId)
      .is("account_id", null);

    if (sessionLinkError) {
      console.error("[api/account/request-link] session link error:", sessionLinkError);
    }

    const consentRow = accountStorageConsentRow({
      sessionId,
      organizationId: getDefaultOrganizationId(),
      ipHash: sha256Hex(clientIp),
      uaHash: sha256Hex(request.headers.get("user-agent") ?? ""),
    });

    const { error: consentInsertError } = await admin
      .from("consent_records")
      .insert(consentRow);
    if (consentInsertError) {
      console.error(
        "[api/account/request-link] account storage consent insert error:",
        consentInsertError,
      );
    }
  }

  if (!account || account.status === "revoked") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const rawToken = createRawLoginToken();
  const { error: tokenInsertError } = await admin.from("account_login_tokens").insert({
    account_id: account.id,
    token_hash: hashLoginToken(rawToken),
    expires_at: loginTokenExpiryIso(),
  });

  if (tokenInsertError) {
    console.error("[api/account/request-link] token insert error:", tokenInsertError);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const verifyUrl = `${getPublicSiteUrl()}/api/account/verify?token=${rawToken}`;
  const sendResult = await sendAccountLoginEmail({ email, verifyUrl });
  if (!sendResult.ok) {
    console.error("[api/account/request-link] email send error:", sendResult.error);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

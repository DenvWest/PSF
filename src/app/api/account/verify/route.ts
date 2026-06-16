import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { hashLoginToken } from "@/lib/account-login-token";
import { absoluteUrl } from "@/lib/public-site-url";
import {
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  ACCOUNT_SESSION_COOKIE_NAME,
  signAccountCookie,
} from "@/lib/account-session-cookie";

type VerifyTokenRow = {
  account_id: string;
};

type AccountStatusRow = {
  status: string | null;
};

function verifyRedirect(): NextResponse {
  return NextResponse.redirect(absoluteUrl("/account/verify"));
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "account_verify",
    clientIp,
    getRateLimitConfig("account_verify"),
  );
  if (!rateLimit.allowed) {
    return verifyRedirect();
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return verifyRedirect();
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return verifyRedirect();
  }

  const nowIso = new Date().toISOString();
  const tokenHash = hashLoginToken(token);
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
      console.error("[api/account/verify] token claim error:", claimError);
    }
    return verifyRedirect();
  }

  const { data: account, error: accountError } = await admin
    .from("accounts")
    .select("status")
    .eq("id", claimedToken.account_id)
    .maybeSingle<AccountStatusRow>();

  if (accountError || !account || account.status === "revoked") {
    if (accountError) {
      console.error("[api/account/verify] account lookup error:", accountError);
    }
    return verifyRedirect();
  }

  const signed = signAccountCookie(claimedToken.account_id);
  if (!signed) {
    return verifyRedirect();
  }

  const response = NextResponse.redirect(absoluteUrl("/dashboard"));
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

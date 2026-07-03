import { NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  INTAKE_REMEASURE_BASELINE_COOKIE_NAME,
  REMEASURE_BASELINE_COOKIE_MAX_AGE_SEC,
  signRemeasureBaselineSessionId,
} from "@/lib/intake-remeasure-cookie";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

function redirectToDashboard(query?: string): NextResponse {
  const path = query ? `/dashboard?${query}` : "/dashboard";
  return NextResponse.redirect(new URL(`${getPublicSiteUrl()}${path}`));
}

function redirectToIntake(): NextResponse {
  return NextResponse.redirect(new URL(`${getPublicSiteUrl()}/intake`));
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

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return redirectToDashboard();
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return redirectToDashboard();
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("id")
    .eq("account_id", account.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error) {
    console.error("[api/account/remeasure/start] session lookup:", error);
    return redirectToDashboard();
  }

  if (!data?.id) {
    return redirectToDashboard("hermeting=geen_baseline");
  }

  return setRemeasureCookie(data.id);
}

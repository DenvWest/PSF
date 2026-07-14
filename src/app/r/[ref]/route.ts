import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/lib/consent-hashing";
import { getClientIp } from "@/lib/client-ip";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getAffiliateDb } from "@/lib/affiliate/db";
import { normalizeRef, resolveAffiliateForRef } from "@/lib/affiliate/attribution";
import {
  AFFILIATE_REF_COOKIE,
  REFERRAL_MAX_AGE_SEC,
} from "@/lib/referral-attribution";

const CLICK_RATE = { limit: 120, windowMs: 60 * 1000 } as const;

/** Alleen interne, relatieve doelen — voorkomt open-redirect. Default: /intake. */
function safeTarget(to: string | null, origin: string): URL {
  if (to && to.startsWith("/") && !to.startsWith("//")) {
    try {
      return new URL(to, origin);
    } catch {
      /* val terug op default */
    }
  }
  return new URL("/intake", origin);
}

/**
 * Trackbare affiliate-redirect: logt een klik (fail-open) en stuurt door.
 * De redirect gebeurt altijd, ook als loggen faalt — een tracking-fout mag
 * de bezoeker nooit blokkeren.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params;
  const origin = request.nextUrl.origin;
  const target = safeTarget(request.nextUrl.searchParams.get("to"), origin);
  const response = NextResponse.redirect(target, 302);

  const norm = normalizeRef(ref);
  if (!norm) return response;

  const alreadyAttributed = request.cookies.get(AFFILIATE_REF_COOKIE)?.value;

  try {
    const ip = getClientIp(request);
    const rl = await consumeRateLimit(`af_click:${ip}`, CLICK_RATE);
    if (!rl.allowed) return response;

    const db = getAffiliateDb();
    const { data } = await db
      .from("af_affiliates")
      .select("id, ref, status, archived_at")
      .eq("ref", norm)
      .maybeSingle();
    const affiliate = resolveAffiliateForRef(norm, data ? [data] : []);
    if (!affiliate) return response;

    await db.from("af_clicks").insert({
      affiliate_id: affiliate.id,
      ref: affiliate.ref,
      ip_hash: sha256Hex(ip),
      ua_hash: sha256Hex(request.headers.get("user-agent") ?? ""),
      landing_path: target.pathname,
    });

    // First-click: bestaande attributie niet overschrijven.
    if (!alreadyAttributed) {
      response.cookies.set(AFFILIATE_REF_COOKIE, affiliate.ref, {
        path: "/",
        maxAge: REFERRAL_MAX_AGE_SEC,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  } catch (e) {
    console.error("[af_click]", e instanceof Error ? e.message : e);
  }

  return response;
}

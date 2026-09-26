import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { unscoped } from "@/lib/db/scoped";
import { backfillOffers } from "@/lib/supplement-catalog-db/offers-backfill";

export const dynamic = "force-dynamic";

/**
 * Eenmalige/herhaalbare admin-actie: schrijft sup_retailers + sup_offers uit de
 * bestaande affiliate-links.ts. Idempotent. Vereist dat de sup-backfill al is
 * gedraaid (POST /api/admin/data/sup-backfill) en dat de pd_partners-rijen voor
 * Vitaminstore/VitalNutrition/Arctic Blue bestaan (migratie
 * 20260926112517_pd_daisycon_en_retailer_partners.sql).
 * Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md, plak 4.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `admin_sup_offers_backfill:${token}`,
    getRateLimitConfig("admin_data"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const admin = unscoped();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const result = await backfillOffers(admin);

  if (result.errors.length > 0) {
    console.error("[api/admin/data/sup-offers-backfill] fouten:", result.errors);
  }

  return NextResponse.json(result, {
    status: result.errors.length > 0 ? 207 : 200,
  });
}

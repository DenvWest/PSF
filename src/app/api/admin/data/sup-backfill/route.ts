import { NextRequest, NextResponse } from "next/server";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { unscoped } from "@/lib/db/scoped";
import { backfillAllComparisonPages } from "@/lib/supplement-catalog-db/backfill";
import type { ComparisonPageData } from "@/types/supplement";

export const dynamic = "force-dynamic";

/**
 * Eenmalige/herhaalbare admin-actie: schrijft de 7 bestaande /beste/*-categorieën
 * (src/data/supplements/*.ts) naar de sup_*-productcatalogus. Idempotent — mag
 * na een wijziging in de bronbestanden opnieuw gedraaid worden.
 * Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md, plak 1.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `admin_sup_backfill:${token}`,
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

  const pages = SUPPLEMENT_SLUGS.map((slug) =>
    getSupplementComparisonData(slug),
  ).filter((page): page is ComparisonPageData => page != null);

  const result = await backfillAllComparisonPages(admin, pages);

  if (result.errors.length > 0) {
    console.error("[api/admin/data/sup-backfill] fouten:", result.errors);
  }

  return NextResponse.json(result, {
    status: result.errors.length > 0 ? 207 : 200,
  });
}

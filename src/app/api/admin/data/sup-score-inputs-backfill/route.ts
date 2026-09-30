import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { unscoped } from "@/lib/db/scoped";
import { backfillScoreInputs } from "@/lib/supplement-catalog-db/score-inputs-backfill";

export const dynamic = "force-dynamic";

/**
 * Eenmalige/herhaalbare admin-actie: zet de statische score-invoer uit
 * score-inputs.ts in sup_products.score_inputs. Idempotent; overschrijft geen
 * bestaande waarden. Vereist migratie 20260930143532_sup_products_score_inputs.sql
 * en dat de product-backfill (POST /api/admin/data/sup-backfill) al is gedraaid.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `admin_sup_score_inputs_backfill:${token}`,
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

  const result = await backfillScoreInputs(admin);

  if (result.errors.length > 0) {
    console.error("[api/admin/data/sup-score-inputs-backfill] fouten:", result.errors);
  }

  return NextResponse.json(result, {
    status: result.errors.length > 0 ? 207 : 200,
  });
}

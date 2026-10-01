import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { unscoped } from "@/lib/db/scoped";
import { backfillPackaging } from "@/lib/supplement-catalog-db/packaging-backfill";

export const dynamic = "force-dynamic";

/**
 * Eenmalige/herhaalbare admin-actie: best-effort parse van de "Inhoud"/
 * "Portie"-specs uit de statische productdata naar sup_products' verpakkings-
 * en portievelden. Idempotent; overschrijft geen bestaande waarden. Wat niet
 * met zekerheid te parsen is komt terug in `unparsed` — dat vul je handmatig
 * in via het productdossier (Etiket-sectie).
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `admin_sup_packaging_backfill:${token}`,
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

  const result = await backfillPackaging(admin);

  if (result.errors.length > 0) {
    console.error("[api/admin/data/sup-packaging-backfill] fouten:", result.errors);
  }

  return NextResponse.json(result, {
    status: result.errors.length > 0 ? 207 : 200,
  });
}

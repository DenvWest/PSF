import { NextRequest, NextResponse } from "next/server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimit } from "@/lib/rate-limit";
import { generateClickToken } from "@/lib/supplement-catalog-db/click-token";

export const dynamic = "force-dynamic";

const CLICK_RATE = { limit: 120, windowMs: 60 * 1000 } as const;

const MAX_FIELD = 200;

function normalizeField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Geeft een click_token uit voor een sup_offers-rij en registreert de klik in
 * sup_clicks. Plak 4 — zie docs/partners/SPEC_CLICK_TOKEN_TRACKING.md §2 en
 * ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C4.
 *
 * Aangeroepen client-side vanuit AffiliateLink vóór de daadwerkelijke
 * navigatie (fire-and-forget met korte timeout aan de client-kant — degradeert
 * naar de kale affiliate-URL zonder token als dit endpoint niet op tijd
 * reageert, zie §L1: geen conversierapportage → alleen kliks, geen crash).
 *
 * Geen PII: alleen affiliateSlug/pagina/positie, geen IP/sessie opgeslagen in
 * sup_clicks zelf (zie §K8).
 */
export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimit(
    `sup_click:${request.headers.get("x-forwarded-for") ?? "unknown"}`,
    CLICK_RATE,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Te veel verzoeken." }, { status: 429 });
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

  const record = body as Record<string, unknown>;
  const affiliateSlug = normalizeField(record.affiliateSlug, MAX_FIELD);
  if (!affiliateSlug) {
    return NextResponse.json({ error: "affiliateSlug ontbreekt" }, { status: 400 });
  }
  const page = normalizeField(record.page, MAX_FIELD);
  const positionRaw = record.position;
  const position =
    typeof positionRaw === "number" && Number.isFinite(positionRaw) ? positionRaw : null;

  const db = unscoped();
  if (!db) {
    return NextResponse.json({ error: "Database niet geconfigureerd." }, { status: 503 });
  }

  // Product opzoeken via raw_legacy_fields.affiliateSlug, met sup_products.slug
  // als terugval — zelfde volgorde als loader.ts (affiliateSlug ?? row.slug).
  const { data: byLegacyField } = await db
    .from("sup_products")
    .select("id")
    .eq("raw_legacy_fields->>affiliateSlug", affiliateSlug)
    .limit(1)
    .maybeSingle();

  let productId = byLegacyField?.id as string | undefined;

  if (!productId) {
    const { data: bySlug } = await db
      .from("sup_products")
      .select("id")
      .eq("slug", affiliateSlug)
      .limit(1)
      .maybeSingle();
    productId = bySlug?.id as string | undefined;
  }

  if (!productId) {
    // Geen sup_products-rij voor deze affiliateSlug — geen fout, alleen geen
    // token. AffiliateLink navigeert dan naar de kale URL zonder token.
    return NextResponse.json({ token: null }, { status: 200 });
  }

  const { data: offer } = await db
    .from("sup_offers")
    .select("id, retailer_id")
    .eq("product_id", productId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!offer) {
    return NextResponse.json({ token: null }, { status: 200 });
  }

  const token = generateClickToken();
  const { error } = await db.from("sup_clicks").insert({
    click_token: token,
    offer_id: offer.id,
    product_id: productId,
    retailer_id: offer.retailer_id,
    page: page.length > 0 ? page : null,
    position,
  });

  if (error) {
    console.error("[api/supplements/click] insert error:", error);
    return NextResponse.json({ token: null }, { status: 200 });
  }

  return NextResponse.json({ token }, { status: 200 });
}

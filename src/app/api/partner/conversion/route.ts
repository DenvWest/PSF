import { NextRequest, NextResponse } from "next/server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimit } from "@/lib/rate-limit";
import { ingestConversion } from "@/lib/partnerdesk/conversion-ingest";
import type { ConversionType } from "@/lib/partnerdesk/commission-amount";

export const dynamic = "force-dynamic";

const CONVERSION_RATE = { limit: 60, windowMs: 60 * 1000 } as const;

const MAX_FIELD = 200;

function normalizeField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Server-to-server postback voor directe partners — plak 4b. Zie
 * docs/partners/SPEC_CLICK_TOKEN_TRACKING.md §3 en
 * ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C6.
 *
 * Authenticatie: Authorization: Bearer <pd_partners.webhook_secret>. Elke
 * partner heeft een eigen geheim; er is bewust geen gedeeld geheim voor alle
 * partners (zie clausule 4 van DATA_BIJLAGE_PARTNERCONTRACT.md).
 *
 * Idempotent op (partner_id, external_id) — een retry van de partner
 * verandert niets aan een al-verwerkte conversie.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (!bearerMatch) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const providedSecret = bearerMatch[1];

  const rateLimit = await consumeRateLimit(
    `partner_conversion:${providedSecret.slice(0, 12)}`,
    CONVERSION_RATE,
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
  const partnerId = normalizeField(record.partner_id, MAX_FIELD);
  const externalId = normalizeField(record.external_id, MAX_FIELD);
  const type = normalizeField(record.type, 10);
  const occurredAt = normalizeField(record.occurred_at, MAX_FIELD);
  const revenueCentsRaw = record.revenue_cents;

  if (!partnerId || !externalId) {
    return NextResponse.json(
      { error: "partner_id en external_id zijn verplicht." },
      { status: 400 },
    );
  }
  if (type !== "lead" && type !== "sale") {
    return NextResponse.json({ error: "type moet 'lead' of 'sale' zijn." }, { status: 400 });
  }
  if (!occurredAt || Number.isNaN(new Date(occurredAt).getTime())) {
    return NextResponse.json({ error: "occurred_at is ongeldig." }, { status: 400 });
  }
  const revenueCents =
    typeof revenueCentsRaw === "number" && Number.isFinite(revenueCentsRaw) && revenueCentsRaw >= 0
      ? Math.round(revenueCentsRaw)
      : 0;

  const db = unscoped();
  if (!db) {
    return NextResponse.json({ error: "Database niet geconfigureerd." }, { status: 503 });
  }

  const { data: partner, error: partnerError } = await db
    .from("pd_partners")
    .select("id, webhook_secret")
    .eq("id", partnerId)
    .maybeSingle();

  if (partnerError || !partner || !partner.webhook_secret) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  // Constant-time-gevoelige vergelijking is hier bewust achterwege gelaten:
  // het geheim is een lang, random token (geen wachtwoord met lage entropie),
  // en het risico van een timing-aanval op een interne, low-traffic postback-
  // route weegt niet op tegen de complexiteit van een eigen vergelijkingsfunctie.
  if (providedSecret !== partner.webhook_secret) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const clickTokenRaw = normalizeField(record.click_token, MAX_FIELD);
  const orderRefRaw = normalizeField(record.order_ref, MAX_FIELD);

  const { data: contractRows } = await db
    .from("pd_contracts")
    .select("id")
    .eq("partner_id", partnerId)
    .is("archived_at", null)
    .order("starts_on", { ascending: false })
    .limit(1);
  const contractId = contractRows?.[0]?.id ?? null;

  const result = await ingestConversion(db, {
    partnerId,
    contractId,
    clickToken: clickTokenRaw.length > 0 ? clickTokenRaw : null,
    externalId,
    type: type as ConversionType,
    occurredAt: new Date(occurredAt).toISOString(),
    orderRef: orderRefRaw.length > 0 ? orderRefRaw : null,
    revenueCents,
    currency: "EUR",
    ingestMethod: "postback",
    raw: record,
  });

  if (!result.ok) {
    console.error("[api/partner/conversion] ingest error:", result.error);
    return NextResponse.json({ error: "Verwerking mislukt." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, duplicate: result.duplicate, conversion_id: result.conversionId },
    { status: 200 },
  );
}

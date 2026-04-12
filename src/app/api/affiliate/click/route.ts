import { NextRequest, NextResponse } from "next/server";
import { getDefaultOrganizationId } from "@/lib/organization";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

const CLICK_RATE = {
  limit: 120,
  windowMs: 60 * 1000,
} as const;

const MAX_FIELD = 500;
const MAX_PAGINA = 2000;

function normalizeField(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimit(`affiliate_click:${clientIp}`, CLICK_RATE);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
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

  const record = body as Record<string, unknown>;
  const product_id = normalizeField(record.product_id, MAX_FIELD);
  if (!product_id) {
    return NextResponse.json({ error: "product_id ontbreekt" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const product_naam = normalizeField(record.product_naam, MAX_FIELD);
  const categorie = normalizeField(record.categorie, MAX_FIELD);
  const pagina = normalizeField(record.pagina, MAX_PAGINA);

  const { error } = await admin.from("affiliate_clicks").insert({
    product_id,
    product_naam: product_naam.length > 0 ? product_naam : null,
    categorie: categorie.length > 0 ? categorie : null,
    pagina: pagina.length > 0 ? pagina : null,
    organization_id: getDefaultOrganizationId(),
  });

  if (error) {
    console.error("[api/affiliate/click] insert error:", error);
    return NextResponse.json(
      { error: "Klik kon niet worden opgeslagen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

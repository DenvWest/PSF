import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { unscoped } from "@/lib/db/scoped";
import { haalNevoFoodsOp, nevoFoodNaarSupermarktProduct, nevoProdId } from "@/lib/nevo-foods";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Eén NEVO-voedingsmiddel op code, voor het portiescherm van een catalogusregel
 * die aan NEVO gekoppeld is. Alleen voor ingelogde accounts, net als de
 * zoekroute: dit is de achterkant van het dagboek, geen publieke dataset.
 */

const CODE_PATROON = /^\d{1,8}$/;

export async function GET(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "supermarkt_zoek",
    getClientIp(request),
    getRateLimitConfig("supermarkt_zoek"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het zo opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const code = new URL(request.url).searchParams.get("code") ?? "";
  if (!CODE_PATROON.test(code)) {
    return NextResponse.json({ error: "Ongeldige code." }, { status: 400 });
  }

  const admin = unscoped();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const food = (await haalNevoFoodsOp(admin, [code])).get(nevoProdId(code));
    if (!food) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
    return NextResponse.json({ product: nevoFoodNaarSupermarktProduct(food) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon het voedingsmiddel niet ophalen." }, { status: 500 });
  }
}

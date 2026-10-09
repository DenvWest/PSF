import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { unscoped } from "@/lib/db/scoped";
import { haalNevoFoodsOp, nevoFoodNaarSupermarktProduct, nevoProdId } from "@/lib/nevo-foods";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * NEVO-voedingsmiddelen op code, voor het portiescherm van een catalogusregel
 * die aan NEVO gekoppeld is (`?code=`) en voor de dagtotalen van het dagboek
 * (`?codes=1,2,3`, één verzoek per dag in plaats van één per product). Alleen
 * voor ingelogde accounts, net als de zoekroute: dit is de achterkant van het
 * dagboek, geen publieke dataset.
 */

const CODE_PATROON = /^\d{1,8}$/;
const MAX_CODES = 60;

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

  const params = new URL(request.url).searchParams;
  const lijst = params.get("codes");
  const code = params.get("code") ?? "";
  const codes = lijst === null ? null : [...new Set(lijst.split(","))];
  if (codes === null ? !CODE_PATROON.test(code) : codes.length > MAX_CODES || !codes.every((c) => CODE_PATROON.test(c))) {
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
    if (codes !== null) {
      const foods = await haalNevoFoodsOp(admin, codes);
      const producten = codes.flatMap((c) => {
        const food = foods.get(nevoProdId(c));
        return food ? [nevoFoodNaarSupermarktProduct(food)] : [];
      });
      return NextResponse.json({ producten }, { status: 200 });
    }
    const food = (await haalNevoFoodsOp(admin, [code])).get(nevoProdId(code));
    if (!food) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
    return NextResponse.json({ product: nevoFoodNaarSupermarktProduct(food) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon het voedingsmiddel niet ophalen." }, { status: 500 });
  }
}

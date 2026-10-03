import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { zoekDagboekProducten } from "@/lib/dagboek-producten";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Zoeken voor het dagboek (Laag A) in `sm_products` (Open Food Facts) én
 * `nevo_foods` (NEVO-online, RIVM), via `zoekDagboekProducten`. Alleen voor ingelogde
 * accounts: de catalogus is geen publieke dataset die we aanbieden, maar de
 * achterkant van het dagboek — zie
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §4.
 *
 * Geeft hooguit {@link MAX_ZOEKRESULTATEN} producten per verzoek en nooit de
 * tabel als geheel: ODbL §4.4.c behandelt een publieke dump als een aparte,
 * bewuste handeling, niet als bijproduct van een zoekroute.
 */

const MAX_QUERY_LENGTE = 100;

export async function GET(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "supermarkt_zoek",
    getClientIp(request),
    getRateLimitConfig("supermarkt_zoek"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel zoekopdrachten. Probeer het zo opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > MAX_QUERY_LENGTE) {
    return NextResponse.json({ error: "Zoekopdracht is te lang." }, { status: 400 });
  }

  const admin = unscoped();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const producten = await zoekDagboekProducten(admin, q);
    return NextResponse.json({ producten }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon producten niet zoeken." }, { status: 500 });
  }
}

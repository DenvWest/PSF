import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { zoekNevoFoods } from "@/lib/nevo-foods";
import { NEVO_CITATION } from "@/lib/nevo-bron";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Zoeken in `nevo_foods` (NEVO-online, RIVM) voor het dagboek. Alleen voor ingelogde
 * accounts: de catalogus is geen publieke dataset die we aanbieden, maar de
 * achterkant van het dagboek. Het antwoord draagt
 * de verplichte bronvermelding (RIVM-voorwaarden 2025/9.0) mee. Gebruik van NEVO
 * blijft gratis voor de gebruiker: deze route zit nooit achter een betaalmuur.
 *
 * Geeft hooguit 20 voedingsmiddelen per verzoek en nooit de tabel als geheel:
 * een zoekroute is geen kanaal om het bestand te verspreiden.
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
    const voedingsmiddelen = await zoekNevoFoods(admin, q);
    return NextResponse.json({ voedingsmiddelen, bron: NEVO_CITATION }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon voedingsmiddelen niet zoeken." }, { status: 500 });
  }
}

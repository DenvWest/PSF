import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORG_ID } from "@/config/org";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  getMacroDoelen,
  isGeldigeCalorieen,
  isGeldigPercentage,
  setMacroDoelen,
  type MacroDoelen,
} from "@/lib/account-macro-doelen";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/**
 * Leest één veld uit de body — zelfde drieweg-patroon als in
 * `api/account/voedingsdoelen/route.ts`: ontbreekt (laat staan), expliciet
 * `null` (wissen), of een waarde (valideren en overnemen).
 */
function leesVeld(
  record: Record<string, unknown>,
  key: string,
  huidig: number | null,
  geldig: (value: unknown) => boolean,
): { ok: true; waarde: number | null } | { ok: false } {
  if (!(key in record)) return { ok: true, waarde: huidig };
  const raw = record[key];
  if (raw === null) return { ok: true, waarde: null };
  if (!geldig(raw)) return { ok: false };
  return { ok: true, waarde: raw as number };
}

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await getMacroDoelen(admin, account.id), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je macro-doel niet laden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
    getRateLimitConfig("intake_session"),
  );
  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  let huidig: MacroDoelen;
  try {
    huidig = await getMacroDoelen(admin, account.id);
  } catch {
    return NextResponse.json({ error: "Kon je macro-doel niet laden." }, { status: 500 });
  }

  const calorieen = leesVeld(record, "calorieenKcal", huidig.calorieenKcal, isGeldigeCalorieen);
  if (!calorieen.ok) {
    return NextResponse.json(
      { error: "Vul een calorierichtlijn tussen 500 en 6000 kcal in." },
      { status: 400 },
    );
  }

  const koolhydraten = leesVeld(
    record,
    "koolhydratenPct",
    huidig.koolhydratenPct,
    isGeldigPercentage,
  );
  if (!koolhydraten.ok) {
    return NextResponse.json(
      { error: "Vul een percentage tussen 0 en 100 in voor koolhydraten." },
      { status: 400 },
    );
  }

  const vet = leesVeld(record, "vetPct", huidig.vetPct, isGeldigPercentage);
  if (!vet.ok) {
    return NextResponse.json(
      { error: "Vul een percentage tussen 0 en 100 in voor vet." },
      { status: 400 },
    );
  }

  const eiwit = leesVeld(record, "eiwitPct", huidig.eiwitPct, isGeldigPercentage);
  if (!eiwit.ok) {
    return NextResponse.json(
      { error: "Vul een percentage tussen 0 en 100 in voor eiwit." },
      { status: 400 },
    );
  }

  const doelen: MacroDoelen = {
    calorieenKcal: calorieen.waarde,
    koolhydratenPct: koolhydraten.waarde,
    vetPct: vet.waarde,
    eiwitPct: eiwit.waarde,
  };

  try {
    await setMacroDoelen(admin, account.id, doelen);
    return NextResponse.json(doelen, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je macro-doel niet opslaan." }, { status: 500 });
  }
}

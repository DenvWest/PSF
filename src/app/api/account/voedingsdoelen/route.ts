import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORG_ID } from "@/config/org";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  getVoedingsdoelen,
  isGeldigEiwitDoel,
  isGeldigGewicht,
  isGeldigeTrainingsbelasting,
  setVoedingsdoelen,
  type Voedingsdoelen,
} from "@/lib/account-voedingsdoelen";
import { laadVoedingsdoelenWeergave } from "@/lib/account-voedingsdoelen-server";
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
 * Leest één veld uit de body.
 *
 * Drie uitkomsten die uit elkaar moeten blijven: het veld ontbreekt (laat
 * staan), het is expliciet null (wissen), of het draagt een waarde. Een
 * ontbrekend veld gelijkstellen aan null zou betekenen dat een scherm dat
 * alleen het gewicht stuurt, stilletjes het eiwitdoel wist.
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

  try {
    // De weergave, niet de ruwe rij: de richtlijn wordt server-side gerekend
    // zodat het gewicht uit de check nooit de client bereikt.
    return NextResponse.json(await laadVoedingsdoelenWeergave(account.id), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je doelen niet laden." }, { status: 500 });
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

  let huidig: Voedingsdoelen;
  try {
    huidig = await getVoedingsdoelen(admin, account.id);
  } catch {
    return NextResponse.json({ error: "Kon je doelen niet laden." }, { status: 500 });
  }

  const gewicht = leesVeld(record, "gewichtKg", huidig.gewichtKg, isGeldigGewicht);
  if (!gewicht.ok) {
    return NextResponse.json(
      { error: "Vul een gewicht tussen 40 en 250 kg in." },
      { status: 400 },
    );
  }

  const belasting = leesVeld(
    record,
    "trainingsbelasting",
    huidig.trainingsbelasting,
    isGeldigeTrainingsbelasting,
  );
  if (!belasting.ok) {
    return NextResponse.json({ error: "Ongeldig activiteitsniveau." }, { status: 400 });
  }

  const eiwit = leesVeld(record, "eiwitDoelG", huidig.eiwitDoelG, isGeldigEiwitDoel);
  if (!eiwit.ok) {
    return NextResponse.json(
      { error: "Vul een eiwitdoel tussen 20 en 400 gram in." },
      { status: 400 },
    );
  }

  const doelen: Voedingsdoelen = {
    gewichtKg: gewicht.waarde,
    trainingsbelasting: belasting.waarde,
    eiwitDoelG: eiwit.waarde,
  };

  try {
    await setVoedingsdoelen(admin, account.id, doelen);
    // Opnieuw laden in plaats van `doelen` terugsturen: de richtlijn hangt
    // ook van de check af, dus alleen de server weet wat er nu geldt.
    return NextResponse.json(await laadVoedingsdoelenWeergave(account.id), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je doelen niet opslaan." }, { status: 500 });
  }
}

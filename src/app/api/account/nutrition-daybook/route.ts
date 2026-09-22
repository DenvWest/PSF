import { NextRequest, NextResponse } from "next/server";
import {
  isValidEntryDate,
  listDaybookDays,
  sanitizeMeals,
  sanitizePortions,
  upsertDaybookDay,
} from "@/lib/account-nutrition-daybook";
import { normaliseerWaterMl } from "@/lib/nutrition-eetmomenten";
import { sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { getAccountFromCookie } from "@/lib/account-server";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { DEFAULT_ORG_ID } from "@/config/org";
import { orgScoped } from "@/lib/db/scoped";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Het 2+2-dagboek: registreren en teruglezen.
 *
 * GET levert de dagen; de analyse (weekendverschil, voortgang) gebeurt in de
 * client op `nutrition-dagboek.ts`, zodat er één implementatie van die regels
 * bestaat en de tests er direct op kunnen draaien.
 */

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
    const days = await listDaybookDays(admin, account.id);
    return NextResponse.json({ days }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je dagboek niet laden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
    getRateLimitConfig("intake_session"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldige dag." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const date = typeof record.date === "string" ? record.date.trim() : "";

  if (!isValidEntryDate(date, todayInAgendaTimezone())) {
    return NextResponse.json(
      { error: "Kies een dag die al geweest is." },
      { status: 400 },
    );
  }

  // Drie invoervormen naast elkaar, van fijn naar grof: `items` is de huidige
  // (product per eetmoment), `meals` blijft geldig voor clients die per groep
  // per moment sturen, en `portions` voor de platte lijst. Welke van de drie
  // de porties bepaalt, beslist `upsertDaybookDay`.
  //
  // Een veld dat de client niet stuurde blijft `undefined` en wordt door
  // `upsertDaybookDay` met rust gelaten; een veld dat wél meekwam overschrijft,
  // ook als het leeg is. Dat onderscheid moet hier overeind blijven: zou de
  // route een ontbrekend veld als `{}` doorgeven, dan is "niets gezegd" niet
  // meer van "maak leeg" te onderscheiden en wist de eerste productinvoer het
  // water van die dag — precies het dataverlies dat de merge moet voorkomen.
  const items = record.items !== undefined ? sanitizeItems(record.items) : undefined;
  const momenten = record.meals !== undefined ? sanitizeMeals(record.meals) : undefined;
  const porties = record.portions !== undefined ? sanitizePortions(record.portions) : undefined;
  const waterMl = record.water_ml !== undefined ? normaliseerWaterMl(record.water_ml) : undefined;

  // Een verzoek moet érgens over gaan: noemt het geen enkele vorm, dan is er
  // niets te registreren en niets te wissen.
  //
  // Een vorm die leeg meekomt telt wél mee. Dat is het verschil tussen "ik zeg
  // hier niets over" en "maak dit leeg", en het is precies wat er gebeurt als
  // je je laatste product van de dag verwijdert: de client stuurt `items: []`.
  // Dat als lege registratie weigeren liet die laatste regel bij een herlaadslag
  // terugkomen — een 400 op een handeling die de gebruiker bewust deed.
  const noemtEenVorm =
    items !== undefined ||
    momenten !== undefined ||
    porties !== undefined ||
    waterMl !== undefined;

  if (!noemtEenVorm) {
    return NextResponse.json(
      { error: "Vul minstens één eetmoment in." },
      { status: 400 },
    );
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const ok = await upsertDaybookDay(admin, account.id, {
    date,
    porties,
    momenten,
    items,
    waterMl,
  });
  if (!ok) {
    return NextResponse.json({ error: "Kon je dag niet opslaan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

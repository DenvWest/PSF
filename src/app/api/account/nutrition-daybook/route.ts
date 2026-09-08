import { NextRequest, NextResponse } from "next/server";
import {
  isValidEntryDate,
  listDaybookDays,
  sanitizeItems,
  sanitizeMeals,
  sanitizePortions,
  upsertDaybookDay,
} from "@/lib/account-nutrition-daybook";
import { normaliseerWaterMl } from "@/lib/nutrition-eetmomenten";
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

  // Drie invoervormen naast elkaar. `items` is de huidige (welk product, per
  // eetmoment); `meals` blijft de groepsvorm voor wie wél weet dát hij groente
  // at maar niet meer welke; `portions` blijft geldig voor clients die de
  // platte lijst nog sturen. Alle drie tellen bij het opslaan naar `portions`
  // toe — zie `upsertDaybookDay`.
  const items = sanitizeItems(record.items);
  const momenten = sanitizeMeals(record.meals);
  const porties = sanitizePortions(record.portions);
  const waterMl = normaliseerWaterMl(record.water_ml);

  const heeftInhoud =
    Object.keys(items).length > 0 ||
    Object.keys(momenten).length > 0 ||
    Object.keys(porties).length > 0 ||
    (waterMl !== null && waterMl > 0);

  if (!heeftInhoud) {
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

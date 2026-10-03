import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { isValidEntryDate } from "@/lib/account-nutrition-daybook";
import {
  deleteSupermarktPortieLog,
  insertSupermarktPortieLog,
  listSupermarktPortieLogs,
} from "@/lib/account-supermarkt-portie-logs";
import { isEetmomentId } from "@/lib/nutrition-eetmomenten";
import { koppelProducten, type SupermarktPortieLog } from "@/lib/nutrition-supermarkt-items";
import { haalSupermarktProductenOp } from "@/lib/supermarkt-products";
import { unscoped } from "@/lib/db/scoped";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { DEFAULT_ORG_ID } from "@/config/org";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Losse portie-logs van supermarktproducten (Laag A) — calorieën/macro's, los
 * van `/api/account/nutrition-daybook`. Zie
 * `src/lib/account-supermarkt-portie-logs.ts` en
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1.
 *
 * Een log bewaart alleen `prodId` + gram. Bij het uitlezen koppelt deze route
 * het product uit `sm_products` eraan — verwijzen, niet kopiëren (zie
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §3).
 */

const MAX_GRAMS = 2000;

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

/**
 * Haalt de producten bij deze logs op. Een databasefout (bijv. de tabel is nog
 * niet aangemaakt) mag het dagboek niet breken: de logs komen dan terug met
 * `product: null` en tellen niet mee, in plaats van dat het hele overzicht faalt.
 */
async function logsMetProduct(logs: readonly SupermarktPortieLog[]) {
  const admin = unscoped();
  if (!admin || logs.length === 0) return koppelProducten(logs, new Map());
  try {
    const producten = await haalSupermarktProductenOp(
      admin,
      logs.map((log) => log.prodId),
    );
    return koppelProducten(logs, producten);
  } catch {
    return koppelProducten(logs, new Map<string, SupermarktProduct>());
  }
}

function parseLogBody(
  body: unknown,
): { moment: string; prodId: string; grams: number } | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const moment = typeof record.moment === "string" ? record.moment.trim() : "";
  const prodId = typeof record.prodId === "string" ? record.prodId.trim() : "";
  const grams = record.grams;

  if (!isEetmomentId(moment)) return null;
  if (!prodId || prodId.length > 200) return null;
  if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) return null;

  return { moment, prodId, grams: Math.min(Math.trunc(grams), MAX_GRAMS) };
}

export async function GET(request: NextRequest) {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isValidEntryDate(date, todayInAgendaTimezone())) {
    return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const logs = await listSupermarktPortieLogs(admin, account.id, date);
    return NextResponse.json({ items: await logsMetProduct(logs) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon portie-logs niet laden." }, { status: 500 });
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

  const record = body as Record<string, unknown> | null;
  const date = typeof record?.date === "string" ? record.date : "";
  if (!isValidEntryDate(date, todayInAgendaTimezone())) {
    return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
  }

  const log = parseLogBody(body);
  if (!log) {
    return NextResponse.json({ error: "Ongeldige portie." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const sm = unscoped();
  if (!sm) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const bestaand = await haalSupermarktProductenOp(sm, [log.prodId]);
    if (!bestaand.has(log.prodId)) {
      return NextResponse.json({ error: "Onbekend product." }, { status: 400 });
    }
    const opgeslagen = await insertSupermarktPortieLog(admin, account.id, date, log);
    const [item] = koppelProducten([opgeslagen], bestaand);
    return NextResponse.json({ ok: true, item }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon portie niet opslaan." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

  const id = (new URL(request.url).searchParams.get("id") ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Ongeldige portie." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await deleteSupermarktPortieLog(admin, account.id, id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon portie niet verwijderen." }, { status: 500 });
  }
}

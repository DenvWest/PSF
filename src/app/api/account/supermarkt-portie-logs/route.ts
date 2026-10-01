import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { isValidEntryDate } from "@/lib/account-nutrition-daybook";
import {
  deleteSupermarktPortieLog,
  insertSupermarktPortieLog,
  listSupermarktPortieLogs,
} from "@/lib/account-supermarkt-portie-logs";
import { supermarktCatalogEntry } from "@/data/nutrition/supermarkt-catalog";
import { isEetmomentId } from "@/lib/nutrition-eetmomenten";
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
 */

const MAX_GRAMS = 2000;

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
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
  if (!prodId || prodId.length > 200 || !supermarktCatalogEntry(prodId)) return null;
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
    const items = await listSupermarktPortieLogs(admin, account.id, date);
    return NextResponse.json({ items }, { status: 200 });
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

  try {
    const item = await insertSupermarktPortieLog(admin, account.id, date, log);
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

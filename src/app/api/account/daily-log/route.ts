import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { getDailyActionState, toggleDailyAction } from "@/lib/daily-action-log";

const DOMAINS = ["slaap", "energie", "stress", "voeding", "beweging", "herstel"] as const;

function isDomain(value: string): boolean {
  return (DOMAINS as readonly string[]).includes(value);
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET(request: NextRequest) {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const domain = (new URL(request.url).searchParams.get("domain") ?? "").trim();
  if (!isDomain(domain)) {
    return NextResponse.json({ error: "Ongeldig domein." }, { status: 400 });
  }
  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }
  const state = await getDailyActionState(admin, account.id, domain);
  return NextResponse.json(state, { status: 200 });
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
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const domain = typeof record.domain === "string" ? record.domain.trim() : "";
  const actionKey = typeof record.actionKey === "string" ? record.actionKey.trim() : "";
  const done = record.done === true;

  if (!isDomain(domain) || !actionKey || actionKey.length > 120) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  await toggleDailyAction(admin, account.id, domain, actionKey, done);
  const state = await getDailyActionState(admin, account.id, domain);
  return NextResponse.json({ ok: true, ...state }, { status: 200 });
}

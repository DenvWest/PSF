import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { isMovementLogEnabled } from "@/lib/feature-flags";
import {
  bandMinutes,
  getMovementWeekSummary,
  insertMovementSession,
  parseMovementSessionInput,
} from "@/lib/movement-session-log";
import { emitEvent } from "@/lib/events";

function notEnabledResponse() {
  return NextResponse.json(
    {
      error: "Bewegingslog is nog niet beschikbaar.",
      code: "movement_log_not_enabled",
    },
    { status: 503 },
  );
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET() {
  if (!isMovementLogEnabled()) {
    return notEnabledResponse();
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const summary = await getMovementWeekSummary(admin, account.id);
  return NextResponse.json(summary, { status: 200 });
}

export async function POST(request: NextRequest) {
  if (!isMovementLogEnabled()) {
    return notEnabledResponse();
  }

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

  const parsed = parseMovementSessionInput(body);
  if (!parsed) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  await insertMovementSession(admin, account.id, account.organization_id, parsed);
  const summary = await getMovementWeekSummary(admin, account.id);

  void emitEvent({
    eventType: "movement.session_logged",
    email: account.email ?? undefined,
    organizationId: account.organization_id,
    payload: {
      modality_id: parsed.modalityId,
      minutes_band: bandMinutes(parsed.minutes),
      surface: "kompas_beweging",
    },
  });

  return NextResponse.json({ ok: true, ...summary }, { status: 200 });
}

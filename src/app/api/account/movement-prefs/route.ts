import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  ANSWER_KEY_MOVEMENT_ANCHOR,
  ANSWER_KEY_START_PATTERN,
  isMovementAnchor,
  isMovementStartPattern,
  parseMovementPrefs,
} from "@/lib/movement-prefs";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Beweeg-voorkeuren (B-1b): startpatroon + anker als string-enums in de
 * answers-jsonb van de laatste geclaimde sessie. Geen nieuwe tabel, geen PII;
 * parseAnswers() (number-only) ziet deze keys nooit — scoring blijft onaangeraakt.
 */

async function resolveLatestSessionId(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("intake_sessions")
    .select("id,created_at,profile_label")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    return null;
  }

  for (const row of data) {
    const sessionId = typeof row.id === "string" ? row.id.trim() : "";
    const profileLabel =
      typeof row.profile_label === "string" ? row.profile_label.trim() : "";
    if (sessionId && profileLabel && profileLabel !== ANON_PROFILE_LABEL) {
      return sessionId;
    }
  }

  return null;
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
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
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
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const hasPattern = record.startPattern !== undefined;
  const hasAnchor = record.anchor !== undefined;

  if (!hasPattern && !hasAnchor) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }
  if (hasPattern && !isMovementStartPattern(record.startPattern)) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }
  if (hasAnchor && !isMovementAnchor(record.anchor)) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const sessionId = await resolveLatestSessionId(admin, account.id);
  if (!sessionId) {
    return NextResponse.json({ error: "Geen sessie gevonden." }, { status: 404 });
  }

  const { data: sessionRow, error: readError } = await admin
    .from("intake_sessions")
    .select("answers")
    .eq("id", sessionId)
    .single();

  if (readError || !sessionRow) {
    return NextResponse.json({ error: "Kon sessie niet laden." }, { status: 500 });
  }

  const currentAnswers =
    sessionRow.answers &&
    typeof sessionRow.answers === "object" &&
    !Array.isArray(sessionRow.answers)
      ? (sessionRow.answers as Record<string, unknown>)
      : {};

  const nextAnswers: Record<string, unknown> = { ...currentAnswers };
  if (hasPattern) {
    nextAnswers[ANSWER_KEY_START_PATTERN] = record.startPattern;
  }
  if (hasAnchor) {
    nextAnswers[ANSWER_KEY_MOVEMENT_ANCHOR] = record.anchor;
  }

  const { error: writeError } = await admin
    .from("intake_sessions")
    .update({ answers: nextAnswers })
    .eq("id", sessionId);

  if (writeError) {
    return NextResponse.json(
      { error: "Kon voorkeuren niet opslaan." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, ...parseMovementPrefs(nextAnswers) },
    { status: 200 },
  );
}

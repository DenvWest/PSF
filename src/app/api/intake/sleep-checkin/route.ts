import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { RULES_VERSION } from "@/lib/intake-engine";
import { loadBaselineSnapshot } from "@/lib/intake-baseline";
import { domainCheckinConsentRow } from "@/lib/domain-checkin-consent";
import { assessSleep } from "@/lib/sleep-assessment";
import {
  sleepScoreFromReport,
  sleepDirection,
  sleepStartStatement,
} from "@/lib/sleep-delta";
import { sleepRegieReflection, SLEEP_DUUR_VALUES } from "@/data/sleep-checkin";
import { emitEvent } from "@/lib/events";

type SleepReport = {
  SLP_ONSET: number;
  SLP_WAKE: number;
  SLP_CONS: number;
  SLP_QUAL: number;
  grip: number | null;
  duur: number | null;
};

function parseIntField(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

function parseDuurField(value: unknown): number | null {
  if (typeof value !== "number" || !SLEEP_DUUR_VALUES.includes(value)) {
    return null;
  }
  return value;
}

function parseReport(raw: unknown): SleepReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const SLP_ONSET = parseIntField(r.SLP_ONSET, 1, 4);
  const SLP_WAKE = parseIntField(r.SLP_WAKE, 1, 4);
  const SLP_CONS = parseIntField(r.SLP_CONS, 1, 3);
  const SLP_QUAL = parseIntField(r.SLP_QUAL, 1, 4);
  if (SLP_ONSET === null || SLP_WAKE === null || SLP_CONS === null || SLP_QUAL === null) {
    return null;
  }

  const gripRaw = r.grip;
  const grip =
    gripRaw === undefined || gripRaw === null
      ? null
      : parseIntField(gripRaw, 1, 5);

  const duurRaw = r.duur;
  const duur =
    duurRaw === undefined || duurRaw === null ? null : parseDuurField(duurRaw);

  return { SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL, grip, duur };
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/sleep-checkin][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;

  if (bodyRecord.consent !== true) {
    return NextResponse.json(
      { error: "Toestemming is vereist." },
      { status: 400 },
    );
  }

  const report = parseReport(bodyRecord.report);
  if (report === null) {
    return NextResponse.json(
      { error: "Ongeldig rapport-formaat." },
      { status: 400 },
    );
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Doe eerst de Leefstijlcheck via /intake." },
      { status: 401 },
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const ua = request.headers.get("user-agent") ?? "";
  const ipHash = sha256Hex(clientIp);
  const uaHash = sha256Hex(ua);
  const organizationId = getDefaultOrganizationId();

  const consentRow = domainCheckinConsentRow({
    sessionId,
    organizationId,
    ipHash,
    uaHash,
  });

  const { error: consentError } = await admin
    .from("consent_records")
    .insert(consentRow);

  if (consentError) {
    console.error("[api/intake/sleep-checkin] consent insert error:", consentError);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  const { SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL, grip, duur } = report;
  const scored = { SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL };
  const currentScore = sleepScoreFromReport(scored);

  const baseline = await loadBaselineSnapshot(sessionId);
  const direction = baseline
    ? sleepDirection(baseline.domainScores.sleep_score, currentScore)
    : null;
  const start = direction
    ? {
        direction,
        statement: sleepStartStatement(direction),
      }
    : null;

  const { error: checkinError } = await admin.from("intake_domain_checkin").insert({
    session_id: sessionId,
    organization_id: organizationId,
    domain_key: "sleep_score",
    raw_inputs: { SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL, grip, duur },
    score: { sleep_score: currentScore },
    rules_version: RULES_VERSION,
  });

  if (checkinError) {
    console.error("[api/intake/sleep-checkin] checkin insert error:", checkinError);
    return NextResponse.json(
      { error: "Kon rapportage niet opslaan." },
      { status: 500 },
    );
  }

  try {
    await emitEvent({
      eventType: "measurement.checkin_completed",
      sessionId,
      payload: {
        domain_key: "sleep_score",
        rules_version: RULES_VERSION,
        grip,
        duur,
      },
      deliveredTo: [],
    });
  } catch (emitErr) {
    console.error("[api/intake/sleep-checkin] checkin_completed emit error:", emitErr);
  }

  if (start) {
    try {
      await emitEvent({
        eventType: "measurement.direction_detected",
        sessionId,
        payload: {
          domain_key: "sleep_score",
          direction: start.direction,
        },
        deliveredTo: [],
      });
    } catch (emitErr) {
      console.error("[api/intake/sleep-checkin] direction_detected emit error:", emitErr);
    }
  }

  return NextResponse.json(
    {
      assessment: assessSleep(scored),
      start,
      regie: grip != null ? { grip, reflection: sleepRegieReflection(grip) } : null,
    },
    { status: 200 },
  );
}

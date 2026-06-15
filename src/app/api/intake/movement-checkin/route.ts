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
import { assessMovement } from "@/lib/movement-assessment";
import {
  movementScoreFromReport,
  movementDirection,
  movementStartStatement,
} from "@/lib/movement-delta";
import { emitEvent } from "@/lib/events";

type MovementReport = {
  MOV_STR: number;
  MOV_CARD: number;
};

function parseIntField(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

function parseReport(raw: unknown): MovementReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const MOV_STR = parseIntField(r.MOV_STR, 1, 4);
  const MOV_CARD = parseIntField(r.MOV_CARD, 1, 4);
  if (MOV_STR === null || MOV_CARD === null) return null;
  return { MOV_STR, MOV_CARD };
}

function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn("[api/intake/movement-checkin][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
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
    return NextResponse.json({ error: "Toestemming is vereist." }, { status: 400 });
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
    console.error("[api/intake/movement-checkin] consent insert error:", consentError);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  const { MOV_STR, MOV_CARD } = report;
  const currentScore = movementScoreFromReport(report);

  const baseline = await loadBaselineSnapshot(sessionId);
  const direction = baseline
    ? movementDirection(baseline.domainScores.movement_score, currentScore)
    : null;
  const start = direction
    ? { direction, statement: movementStartStatement(direction) }
    : null;

  const { error: checkinError } = await admin.from("intake_domain_checkin").insert({
    session_id: sessionId,
    organization_id: organizationId,
    domain_key: "movement_score",
    raw_inputs: { MOV_STR, MOV_CARD },
    score: { movement_score: currentScore },
    rules_version: RULES_VERSION,
  });

  if (checkinError) {
    console.error("[api/intake/movement-checkin] checkin insert error:", checkinError);
    return NextResponse.json(
      { error: "Kon rapportage niet opslaan." },
      { status: 500 },
    );
  }

  try {
    await emitEvent({
      eventType: "measurement.checkin_completed",
      sessionId,
      payload: { domain_key: "movement_score", rules_version: RULES_VERSION },
      deliveredTo: [],
    });
  } catch (emitErr) {
    console.error("[api/intake/movement-checkin] checkin_completed emit error:", emitErr);
  }

  if (start) {
    try {
      await emitEvent({
        eventType: "measurement.direction_detected",
        sessionId,
        payload: { domain_key: "movement_score", direction: start.direction },
        deliveredTo: [],
      });
    } catch (emitErr) {
      console.error("[api/intake/movement-checkin] direction_detected emit error:", emitErr);
    }
  }

  return NextResponse.json(
    { assessment: assessMovement(report), start },
    { status: 200 },
  );
}

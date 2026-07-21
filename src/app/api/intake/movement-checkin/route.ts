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
import { resolveActiveIntakeSessionId } from "@/lib/intake-session-resolve";
import { RULES_VERSION } from "@/lib/intake-engine";
import { loadBaselineSnapshot } from "@/lib/intake-baseline";
import { isMovementScoreDeltaComparable } from "@/lib/rules-version";
import { domainCheckinConsentRow } from "@/lib/domain-checkin-consent";
import { assessMovement } from "@/lib/movement-assessment";
import {
  movementScoreFromReport,
  movementDirection,
  movementStartStatement,
} from "@/lib/movement-delta";
import {
  parseFullMovementReport,
  parseMovementCheckinMode,
  parsePulseMovementReport,
  type MovementCheckinReport,
} from "@/lib/movement-checkin-parse";
import { emitEvent } from "@/lib/events";

function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn("[api/intake/movement-checkin][security]", { event, ...details });
}

async function resolvePreviousMovementScore(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  sessionId: string,
): Promise<number | null> {
  const { data: previousCheckin } = await admin
    .from("intake_domain_checkin")
    .select("score")
    .eq("session_id", sessionId)
    .eq("domain_key", "movement_score")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const previousScoreObj = previousCheckin?.score;
  if (previousScoreObj && typeof previousScoreObj === "object" && !Array.isArray(previousScoreObj)) {
    const raw = (previousScoreObj as Record<string, unknown>).movement_score;
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.round(raw);
    }
  }

  const baseline = await loadBaselineSnapshot(sessionId);
  return baseline ? Math.round(baseline.domainScores.movement_score) : null;
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

  const mode = parseMovementCheckinMode(bodyRecord.mode);
  const pulseReport =
    mode === "pulse" ? parsePulseMovementReport(bodyRecord.report) : null;
  const fullReport =
    mode === "full" ? parseFullMovementReport(bodyRecord.report) : null;

  if (mode === "pulse" && pulseReport === null) {
    return NextResponse.json(
      { error: "Ongeldig pulse-rapport — RCV_FEEL (1–5) is vereist." },
      { status: 400 },
    );
  }

  if (mode === "full" && fullReport === null) {
    return NextResponse.json(
      { error: "Ongeldig rapport-formaat." },
      { status: 400 },
    );
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const cookieSessionId = verifySignedIntakeSessionCookie(rawCookie);
  const sessionId = await resolveActiveIntakeSessionId(cookieSessionId);

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

  const reportForAssessment =
    mode === "pulse" ? pulseReport! : (fullReport as MovementCheckinReport);
  const currentScore =
    mode === "pulse"
      ? await resolvePreviousMovementScore(admin, sessionId)
      : movementScoreFromReport(fullReport!);

  const baseline = await loadBaselineSnapshot(sessionId);
  const movementComparable = baseline
    ? isMovementScoreDeltaComparable(baseline.rulesVersion, RULES_VERSION)
    : false;
  const direction =
    mode === "full" &&
    baseline &&
    movementComparable &&
    currentScore != null
      ? movementDirection(baseline.domainScores.movement_score, currentScore)
      : null;
  const start = direction
    ? { direction, statement: movementStartStatement(direction) }
    : null;

  const { error: checkinError } = await admin.from("intake_domain_checkin").insert({
    session_id: sessionId,
    organization_id: organizationId,
    domain_key: "movement_score",
    raw_inputs: reportForAssessment,
    score:
      currentScore != null ? { movement_score: currentScore } : { movement_score: null },
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
      payload: {
        domain_key: "movement_score",
        rules_version: RULES_VERSION,
        checkin_mode: mode,
      },
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
    { assessment: assessMovement(reportForAssessment), start, mode },
    { status: 200 },
  );
}

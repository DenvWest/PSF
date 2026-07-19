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
import { assessSleep, buildSleepConclusion } from "@/lib/sleep-assessment";
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
  winddown: number | null;
  nightload: number | null;
  morninglight: number | null;
  sleepconfidence: number | null;
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

  const winddownRaw = r.winddown;
  const winddown =
    winddownRaw === undefined || winddownRaw === null
      ? null
      : parseIntField(winddownRaw, 1, 4);
  const nightloadRaw = r.nightload;
  const nightload =
    nightloadRaw === undefined || nightloadRaw === null
      ? null
      : parseIntField(nightloadRaw, 1, 4);
  const morninglightRaw = r.morninglight;
  const morninglight =
    morninglightRaw === undefined || morninglightRaw === null
      ? null
      : parseIntField(morninglightRaw, 1, 4);
  const sleepconfidenceRaw = r.sleepconfidence;
  const sleepconfidence =
    sleepconfidenceRaw === undefined || sleepconfidenceRaw === null
      ? null
      : parseIntField(sleepconfidenceRaw, 1, 4);

  return {
    SLP_ONSET,
    SLP_WAKE,
    SLP_CONS,
    SLP_QUAL,
    grip,
    duur,
    winddown,
    nightload,
    morninglight,
    sleepconfidence,
  };
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/sleep-checkin][security]", { event, ...details });
}

function parseChosenActions(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const actions = raw.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  if (actions.length === 0 || actions.length > 4) {
    return null;
  }
  return actions;
}

export async function PATCH(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    clientIp,
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
  const checkinId =
    typeof bodyRecord.checkin_id === "string" ? bodyRecord.checkin_id.trim() : "";
  const chosenActions = parseChosenActions(bodyRecord.chosen_actions);

  if (!checkinId || chosenActions === null) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
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

  const { data: row, error: fetchError } = await admin
    .from("intake_domain_checkin")
    .select("id,session_id,domain_key,raw_inputs")
    .eq("id", checkinId)
    .maybeSingle();

  if (fetchError) {
    console.error("[api/intake/sleep-checkin] patch fetch error:", fetchError);
    return NextResponse.json({ error: "Kon check-in niet laden." }, { status: 500 });
  }

  if (!row || row.session_id !== sessionId || row.domain_key !== "sleep_score") {
    return NextResponse.json({ error: "Check-in niet gevonden." }, { status: 404 });
  }

  const existingRaw =
    row.raw_inputs && typeof row.raw_inputs === "object" && !Array.isArray(row.raw_inputs)
      ? (row.raw_inputs as Record<string, unknown>)
      : {};

  const { error: updateError } = await admin
    .from("intake_domain_checkin")
    .update({
      raw_inputs: {
        ...existingRaw,
        chosen_actions: chosenActions,
      },
    })
    .eq("id", checkinId);

  if (updateError) {
    console.error("[api/intake/sleep-checkin] patch update error:", updateError);
    return NextResponse.json({ error: "Kon acties niet opslaan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
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

  const {
    SLP_ONSET,
    SLP_WAKE,
    SLP_CONS,
    SLP_QUAL,
    grip,
    duur,
    winddown,
    nightload,
    morninglight,
    sleepconfidence,
  } = report;
  const scored = { SLP_ONSET, SLP_WAKE, SLP_CONS, SLP_QUAL };
  const currentScore = sleepScoreFromReport(scored);
  const assessment = assessSleep(scored);
  const conclusion = buildSleepConclusion(assessment, {
    winddown: winddown ?? undefined,
    nightload: nightload ?? undefined,
  });

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

  const { data: insertedCheckin, error: checkinError } = await admin.from("intake_domain_checkin").insert({
    session_id: sessionId,
    organization_id: organizationId,
    domain_key: "sleep_score",
    raw_inputs: {
      SLP_ONSET,
      SLP_WAKE,
      SLP_CONS,
      SLP_QUAL,
      grip,
      duur,
      winddown,
      nightload,
      morninglight,
      sleepconfidence,
      focus_dimension: conclusion.focusDimension,
      focus_label: conclusion.focusLabel,
      conclusion_text: conclusion.headline,
      conclusion_actions: conclusion.actions,
      chosen_actions: [],
    },
    score: { sleep_score: currentScore },
    rules_version: RULES_VERSION,
  }).select("id").single();

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
        winddown,
        nightload,
        morninglight,
        sleepconfidence,
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
      checkinId: insertedCheckin?.id ?? null,
      assessment,
      conclusion,
      start,
      regie: grip != null ? { grip, reflection: sleepRegieReflection(grip) } : null,
    },
    { status: 200 },
  );
}

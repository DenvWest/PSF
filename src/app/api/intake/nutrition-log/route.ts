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
import {
  estimateNutritionIntake,
  ESTIMATE_VERSION,
  type IntakeEstimate,
} from "@/lib/nutrition-intake-estimate";
import {
  computeNutritionScore,
  nutritionReportFromAnswers,
} from "@/lib/nutrition-score";
import { getVitalityBand } from "@/lib/vitality-gauge";
import {
  NUTRITION_QUESTIONS,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import { intakeStatementFor } from "@/lib/nutrition-intake-statements";
import { buildNutritionAdvice } from "@/lib/nutrition-advice";
import { nutritionLogConsentRow } from "@/lib/nutrition-log-consent";
import { compareNutritionEstimates, type NutrientDelta } from "@/lib/nutrition-delta";
import { emitEvent } from "@/lib/events";

const SLIDER_IDS = new Set(
  NUTRITION_QUESTIONS.filter(
    (question): question is SliderQuestion => question.kind === "slider",
  ).map((question) => question.id),
);

const ALLERGY_QUESTION = NUTRITION_QUESTIONS.find(
  (question) => question.kind === "multi" && question.id === "allergies",
);
const ALLERGY_VALUES = new Set(
  ALLERGY_QUESTION && ALLERGY_QUESTION.kind === "multi"
    ? ALLERGY_QUESTION.options.map((option) => option.value)
    : [],
);

const PREFERENCE_VALUES = new Set(["none", "pescatarian", "vegetarian", "vegan"]);

interface ParsedAnswers {
  sliders: Record<string, number>;
  allergies: string[];
  preference: string;
}

function parseAnswers(raw: unknown): ParsedAnswers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const slidersRaw = r.sliders;
  if (!slidersRaw || typeof slidersRaw !== "object" || Array.isArray(slidersRaw)) {
    return null;
  }

  const sliders: Record<string, number> = {};
  for (const [key, value] of Object.entries(slidersRaw as Record<string, unknown>)) {
    if (!SLIDER_IDS.has(key)) continue;
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 32) {
      sliders[key] = value;
    }
  }

  const allergies = Array.isArray(r.allergies)
    ? (r.allergies as unknown[])
        .filter((item): item is string => typeof item === "string" && ALLERGY_VALUES.has(item))
        .slice(0, 12)
    : [];

  const preference =
    typeof r.preference === "string" && PREFERENCE_VALUES.has(r.preference)
      ? r.preference
      : "none";

  return { sliders, allergies, preference };
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/nutrition-log][security]", { event, ...details });
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

  const answers = parseAnswers(bodyRecord.answers);
  if (answers === null) {
    return NextResponse.json(
      { error: "Ongeldig antwoord-formaat." },
      { status: 400 },
    );
  }

  const report = nutritionReportFromAnswers(answers.sliders);
  const score = computeNutritionScore(answers.sliders);
  const band = getVitalityBand(score);

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

  const consentRow = nutritionLogConsentRow({
    sessionId,
    organizationId,
    ipHash,
    uaHash,
  });

  const { error: consentError } = await admin
    .from("consent_records")
    .insert(consentRow);

  if (consentError) {
    console.error("[api/intake/nutrition-log] consent insert error:", consentError);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  // Haal de vorige log op (voor delta-berekening) — vóór de nieuwe insert.
  let previousEstimate: IntakeEstimate[] | null = null;
  const { data: prevRows } = await admin
    .from("intake_intake_log")
    .select("estimate")
    .eq("session_id", sessionId)
    .order("logged_at", { ascending: false })
    .limit(1);

  if (prevRows && prevRows.length > 0) {
    const raw = prevRows[0].estimate;
    if (Array.isArray(raw) && raw.length > 0) {
      previousEstimate = raw as IntakeEstimate[];
    }
  }

  const estimate = estimateNutritionIntake(report);

  const delta: NutrientDelta[] | null = previousEstimate
    ? compareNutritionEstimates(previousEstimate, estimate)
    : null;

  const { error: logError } = await admin.from("intake_intake_log").insert({
    session_id: sessionId,
    organization_id: organizationId,
    raw_inputs: {
      sliders: answers.sliders,
      allergies: answers.allergies,
      preference: answers.preference,
      report,
    },
    estimate,
    estimate_version: ESTIMATE_VERSION,
    nutrition_score: score,
  });

  if (logError) {
    console.error("[api/intake/nutrition-log] log insert error:", logError);
    return NextResponse.json(
      { error: "Kon rapportage niet opslaan." },
      { status: 500 },
    );
  }

  // Emit anonieme signalen — breken de respons nooit.
  try {
    await emitEvent({
      eventType: "measurement.checkin_completed",
      sessionId,
      payload: {
        domain: "nutrition",
        nutrition_score: score,
        band: band.id,
        estimate_version: ESTIMATE_VERSION,
      },
      deliveredTo: ["posthog", "n8n_webhook"],
    });

    const nutrientsBelow = estimate
      .filter((e) => e.band === "below")
      .map((e) => e.nutrient);
    if (nutrientsBelow.length > 0) {
      await emitEvent({
        eventType: "measurement.gap_detected",
        sessionId,
        payload: { nutrients_below: nutrientsBelow, estimate_version: ESTIMATE_VERSION },
        deliveredTo: [],
      });
    }
  } catch (emitErr) {
    console.error("[api/intake/nutrition-log] emit error:", emitErr);
  }

  const statements = estimate.map(intakeStatementFor);
  const advice = buildNutritionAdvice(estimate);

  return NextResponse.json(
    { estimate, statements, advice, delta, score, band },
    { status: 200 },
  );
}

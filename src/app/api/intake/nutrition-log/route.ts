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
  type NutritionSelfReport,
} from "@/lib/nutrition-intake-estimate";
import { intakeStatementFor } from "@/lib/nutrition-intake-statements";
import { buildNutritionAdvice } from "@/lib/nutrition-advice";
import { nutritionLogConsentRow } from "@/lib/nutrition-log-consent";

const MAX_FIELD_VALUE = 21;

function clampField(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return Math.min(value, MAX_FIELD_VALUE);
}

function parseReport(raw: unknown): NutritionSelfReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  return {
    proteinMealsPerDay: clampField(r.proteinMealsPerDay),
    oilyFishPerWeek: clampField(r.oilyFishPerWeek),
    vegFruitPerDay: clampField(r.vegFruitPerDay),
    dairyServingsPerDay: clampField(r.dairyServingsPerDay),
    meatLegumesPerDay: clampField(r.meatLegumesPerDay),
    sunExposurePerWeek: clampField(r.sunExposurePerWeek),
  };
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/nutrition-log][security]", { event, ...details });
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

  const estimate = estimateNutritionIntake(report);

  const { error: logError } = await admin.from("intake_intake_log").insert({
    session_id: sessionId,
    organization_id: organizationId,
    raw_inputs: report,
    estimate,
    estimate_version: ESTIMATE_VERSION,
  });

  if (logError) {
    console.error("[api/intake/nutrition-log] log insert error:", logError);
    return NextResponse.json(
      { error: "Kon rapportage niet opslaan." },
      { status: 500 },
    );
  }

  const statements = estimate.map(intakeStatementFor);
  const advice = buildNutritionAdvice(estimate);

  return NextResponse.json({ estimate, statements, advice }, { status: 200 });
}

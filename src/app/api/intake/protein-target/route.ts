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
import { bodyMetricsConsentRow } from "@/lib/body-metrics-consent";
import { computeProteinTarget } from "@/lib/protein-target";
import { emitEvent } from "@/lib/events";
import { nutritionSupplementGate } from "@/lib/nutrition-advice";

function parseWeight(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

function parseTrainingLoad(value: unknown): number | undefined {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 4
  ) {
    return undefined;
  }
  return value;
}

function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  console.warn("[api/intake/protein-target][security]", { event, ...details });
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
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
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

  const weightKg = parseWeight(bodyRecord.weightKg);
  if (weightKg === null) {
    return NextResponse.json({ error: "Ongeldig gewicht." }, { status: 400 });
  }
  const trainingLoad = parseTrainingLoad(bodyRecord.trainingLoad);

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);
  if (!sessionId) {
    return NextResponse.json(
      { error: "Doe eerst de Leefstijlcheck via /intake." },
      { status: 401 },
    );
  }

  const target = computeProteinTarget({ weightKg, trainingLoad });
  if (!target) {
    return NextResponse.json(
      { error: "Vul een geldig gewicht in (40–250 kg)." },
      { status: 400 },
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

  const consentRow = bodyMetricsConsentRow({
    sessionId,
    organizationId,
    ipHash,
    uaHash,
  });
  const { error: consentError } = await admin
    .from("consent_records")
    .insert(consentRow);
  if (consentError) {
    console.error("[api/intake/protein-target] consent insert error:", consentError);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  // Gegate vervolgstap (voeding eerst, supplement tweede) — zelfde EFSA-poort als buildNutritionAdvice.
  const gate = nutritionSupplementGate("protein");
  const supplement = gate.allowed
    ? { comparisonPath: gate.comparisonPath, claimText: gate.claimText }
    : null;

  // Anoniem signaal — NOOIT gewicht of grammen (reconstrueerbaar); alleen factor + belasting.
  try {
    await emitEvent({
      eventType: "measurement.protein_target_computed",
      sessionId,
      payload: {
        training_load: trainingLoad ?? null,
        per_kg_low: target.perKgLow,
        per_kg_high: target.perKgHigh,
      },
      deliveredTo: [],
    });
  } catch (emitErr) {
    console.error("[api/intake/protein-target] computed emit error:", emitErr);
  }

  // Bereken-en-vergeet: het gewicht wordt NIET opgeslagen, alleen verwerkt.
  return NextResponse.json({ target, supplement }, { status: 200 });
}

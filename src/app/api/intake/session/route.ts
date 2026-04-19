import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  intakeConsentRows,
  validateIntakeConsent,
} from "@/lib/intake-consent";
import { computeIntakePersistenceFields, validateIntakeSubmission } from "@/lib/intake-compute";
import {
  INTAKE_SESSION_COOKIE_NAME,
  signIntakeSessionId,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { intakeSessionRowToPayload } from "@/lib/intake-session-payload";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getDefaultOrganizationId } from "@/lib/organization";
import { getAdvicePrimaryDomain } from "@/lib/intake-engine";
import { scheduleNurtureSequence } from "@/lib/nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile-verify";

const TURNSTILE_ACTION = "intake_submit";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/session][security]", { event, ...details });
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp("intake_session", clientIp, getRateLimitConfig("intake_session"));

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const secretOk = Boolean(process.env.COOKIE_SECRET?.trim());
  if (!secretOk) {
    return NextResponse.json(
      { error: "Sessie is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("[api/intake/session] GET error:", error);
    return NextResponse.json(
      { error: "Kon sessie niet laden." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  const payload = intakeSessionRowToPayload(data);
  if (!payload) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  return NextResponse.json({ session: payload }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp("intake_session", clientIp, getRateLimitConfig("intake_session"));

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const website = normalizeSingleLine(bodyRecord.website);

  if (website) {
    logSecurityEvent("honeypot_hit", { remoteIp: clientIp });
    return NextResponse.json({ sessionId: null }, { status: 200 });
  }

  const validated = validateIntakeSubmission(bodyRecord);
  if (!validated.ok) {
    logSecurityEvent("input_invalid", {
      message: validated.error,
      remoteIp: clientIp,
    });
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const consentValidated = validateIntakeConsent(bodyRecord);
  if (!consentValidated.ok) {
    logSecurityEvent("input_invalid", {
      message: consentValidated.error,
      remoteIp: clientIp,
    });
    return NextResponse.json({ error: consentValidated.error }, { status: 400 });
  }

  const turnstileToken = normalizeSingleLine(bodyRecord.turnstileToken);
  if (!turnstileToken) {
    logSecurityEvent("input_invalid", {
      message: "missing_turnstile",
      remoteIp: clientIp,
    });
    return NextResponse.json(
      { error: "Bevestig eerst dat je geen bot bent." },
      { status: 400 },
    );
  }

  const turnstileCheck = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp: clientIp,
    expectedAction: TURNSTILE_ACTION,
    logContext: "api/intake/session",
  });

  if (!turnstileCheck.ok) {
    if (turnstileCheck.reason === "config") {
      return NextResponse.json(
        {
          error:
            "Human verification is nog niet geconfigureerd op de server.",
        },
        { status: 503 },
      );
    }

    if (turnstileCheck.reason === "unavailable") {
      return NextResponse.json(
        { error: "Verificatie kon niet worden voltooid. Probeer het opnieuw." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "De human verification is mislukt. Probeer het opnieuw." },
      { status: 403 },
    );
  }

  if (!process.env.COOKIE_SECRET?.trim()) {
    return NextResponse.json(
      { error: "Sessie is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const { ageRange, symptoms, answers } = validated.value;
  const { scores, urgency, profile } = computeIntakePersistenceFields(answers);
  const consent = consentValidated.value;

  const ua = request.headers.get("user-agent") ?? "";
  const ipHash = sha256Hex(clientIp);
  const uaHash = sha256Hex(ua);

  const organizationId = getDefaultOrganizationId();

  const { data: row, error } = await admin
    .from("intake_sessions")
    .insert({
      organization_id: organizationId,
      symptom_profile: symptoms,
      answers,
      domain_scores: scores,
      urgency_level: urgency,
      profile_label: profile,
      age_range: ageRange,
      marketing_email: consent.marketingEmail
        ? consent.marketingEmailAddress
        : null,
    })
    .select("id")
    .single();

  if (error || !row?.id) {
    console.error("[api/intake/session] insert error:", error);
    return NextResponse.json(
      { error: "Kon intake niet opslaan." },
      { status: 500 },
    );
  }

  const consentRows = intakeConsentRows({
    sessionId: row.id,
    organizationId,
    consent,
    ipHash,
    uaHash,
  });

  const { error: consentError } = await admin
    .from("consent_records")
    .insert(consentRows);

  if (consentError) {
    console.error("[api/intake/session] consent insert error:", consentError);
    await admin.from("intake_sessions").delete().eq("id", row.id);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  const marketingAddr = consent.marketingEmailAddress?.trim();
  if (consent.marketingEmail && marketingAddr) {
    try {
      await scheduleNurtureSequence({
        sessionId: row.id,
        email: marketingAddr,
        profileLabel: profile,
        primaryDomain: getAdvicePrimaryDomain(scores),
        domainScores: scores,
      });
    } catch (nurtureErr) {
      console.error(
        "[api/intake/session] scheduleNurtureSequence:",
        nurtureErr,
      );
    }
  }

  const signed = signIntakeSessionId(row.id);
  if (!signed) {
    return NextResponse.json(
      { error: "Kon sessie niet vastleggen." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ sessionId: row.id }, { status: 200 });
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });

  return res;
}

import { NextRequest, NextResponse } from "next/server";
import {
  applyAnalyticsConsentCookie,
  applyAnalyticsConsentStateCookie,
  clearAnalyticsConsentCookie,
} from "@/lib/analytics-consent";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  intakeConsentRows,
  validateIntakeConsent,
} from "@/lib/intake-consent";
import { deleteIntakeSessionForSession } from "@/lib/intake-consent-revoke";
import { rollbackIntakeSession } from "@/lib/intake-session-rollback";
import { computeIntakePersistenceFields, validateIntakeSubmission } from "@/lib/intake-compute";
import {
  buildRemeasureCompletedPayload,
  createBaselineSnapshot,
  loadBaselineSnapshot,
} from "@/lib/intake-baseline";
import { RULES_VERSION, getAdvice, type DomainScores } from "@/lib/intake-engine";
import { gateAdviceSupplements } from "@/lib/intake-strategy";
import {
  INTAKE_REMEASURE_BASELINE_COOKIE_NAME,
  verifyRemeasureBaselineCookie,
} from "@/lib/intake-remeasure-cookie";
import {
  INTAKE_SESSION_COOKIE_NAME,
  signIntakeSessionId,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { hasActiveIntakeMarketingEmailConsent } from "@/lib/intake-marketing-consent-server";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getDefaultOrganizationId } from "@/lib/organization";
import { emitEvent } from "@/lib/events";
import { scheduleMainNurtureIfInactive } from "@/lib/nurture";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile-verify";
import type { IntakeSessionInsert } from "@/types/intake-session-insert";

const TURNSTILE_ACTION = "intake_submit";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;
const HONEYPOT_MIN_RESPONSE_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/session][security]", { event, ...details });
}

function normalizeReferralSource(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const normalized = decoded.replace(/\s+/g, " ").trim().slice(0, 200);
    return normalized.length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp("intake_session", clientIp, getRateLimitConfig("intake_session"));

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
    return NextResponse.json(
      { session: null, hasActiveMarketingEmailConsent: false },
      { status: 200 },
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok) {
    if (loaded.error === "no_admin") {
      return NextResponse.json(
        { error: "Database is nog niet geconfigureerd op de server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Kon sessie niet laden." },
      { status: 500 },
    );
  }

  if (!loaded.session) {
    return NextResponse.json(
      { session: null, hasActiveMarketingEmailConsent: false },
      { status: 200 },
    );
  }

  const hasActiveMarketingEmailConsent =
    await hasActiveIntakeMarketingEmailConsent(admin, sessionId);

  return NextResponse.json(
    { session: loaded.session, hasActiveMarketingEmailConsent },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp("intake_session", clientIp, getRateLimitConfig("intake_session"));

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
    await sleep(HONEYPOT_MIN_RESPONSE_MS);
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
  const primaryTheme = getPrimaryTheme(scores, answers);
  const consent = consentValidated.value;

  const referralSource = normalizeReferralSource(
    request.cookies.get("psf_referral_source")?.value,
  );

  // Snapshot uit getAdvice (gated), niet buildRevealModel — analytics-bron T=0;
  // opgeslagen advies kan afwijken van reveal-framing/volgorde in IntakeResults.
  let recommendations: {
    supplements: string[];
    quick_wins: string[];
    urgency: string;
    profile_label: string;
    rules_version: string;
  } | null = null;
  try {
    const advice = gateAdviceSupplements(
      getAdvice(scores, answers, symptoms),
    );
    recommendations = {
      supplements: advice.supplements.map((s) => s.name),
      quick_wins: advice.quickWins,
      urgency,
      profile_label: profile,
      rules_version: RULES_VERSION,
    };
  } catch (err) {
    // Analytics mag intake-insert nooit breken
    console.error("[api/intake/session] recommendations snapshot failed:", err);
    recommendations = null;
  }

  const ua = request.headers.get("user-agent") ?? "";
  const ipHash = sha256Hex(clientIp);
  const uaHash = sha256Hex(ua);

  const organizationId = getDefaultOrganizationId();

  const remeasureBaselineId = verifyRemeasureBaselineCookie(
    request.cookies.get(INTAKE_REMEASURE_BASELINE_COOKIE_NAME)?.value,
  );
  const isRemeasure = remeasureBaselineId !== null;

  let baselineSnapshot = null;
  if (isRemeasure) {
    baselineSnapshot = await loadBaselineSnapshot(remeasureBaselineId);
    if (!baselineSnapshot) {
      logSecurityEvent("invalid_remeasure_baseline", {
        remoteIp: clientIp,
        baselineSessionId: remeasureBaselineId,
      });
      return NextResponse.json(
        {
          error:
            "Je startpunt kon niet worden gevonden. Open de link uit je e-mail opnieuw.",
        },
        { status: 400 },
      );
    }
  }

  const insert: IntakeSessionInsert = {
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
    first_name: consent.firstName,
    rules_version: RULES_VERSION,
    session_kind: isRemeasure ? "remeasure" : "initial",
    baseline_session_id: isRemeasure ? remeasureBaselineId : null,
    recommendations,
    referral_source: referralSource,
  };

  const { data: row, error } = await admin
    .from("intake_sessions")
    .insert(insert)
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
    await rollbackIntakeSession(admin, row.id);
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  if (isRemeasure && baselineSnapshot) {
    const remeasurePayload = buildRemeasureCompletedPayload({
      baseline: baselineSnapshot,
      currentScores: scores,
      currentRulesVersion: RULES_VERSION,
    });

    void emitEvent({
      eventType: "remeasure.completed",
      sessionId: row.id,
      organizationId: baselineSnapshot.organizationId,
      payload: remeasurePayload,
      deliveredTo: ["nurture"],
    });
  } else {
    const snapshotResult = await createBaselineSnapshot({
      sessionId: row.id,
      organizationId,
      domainScores: scores,
      profileLabel: profile,
      urgencyLevel: urgency,
      rulesVersion: RULES_VERSION,
      primaryTheme,
      symptomProfile: symptoms,
      ageRange,
    });

    if (!snapshotResult.ok) {
      console.error("[api/intake/session] baseline snapshot error:", snapshotResult.error);
      await rollbackIntakeSession(admin, row.id);
      return NextResponse.json(
        { error: "Kon intake niet opslaan." },
        { status: 500 },
      );
    }

    void emitEvent({
      eventType: "intake.completed",
      sessionId: row.id,
      payload: {
        profile_label: profile,
        urgency_level: urgency,
        theme_slug: primaryTheme,
        marketing_opt_in: consent.marketingEmail,
      },
      deliveredTo: ["nurture"],
    });
  }

  const marketingAddr = consent.marketingEmailAddress?.trim();
  let mainNurtureSkipped = false;
  if (!isRemeasure && consent.marketingEmail && marketingAddr) {
    try {
      const nurtureResult = await scheduleMainNurtureIfInactive({
        sessionId: row.id,
        email: marketingAddr,
        profileLabel: profile,
        primaryDomain: primaryTheme,
        domainScores: scores,
        urgencyLevel: urgency,
        firstName: consent.firstName,
      });
      if (nurtureResult === "skipped_active") {
        mainNurtureSkipped = true;
        console.warn("[api/intake/session] main nurture skipped (active day-0)", {
          sessionId: row.id,
          email: marketingAddr,
        });
        void emitEvent({
          eventType: "nurture.skipped",
          sessionId: row.id,
          email: marketingAddr,
          payload: {
            reason: "active_day0",
            source: "intake_session",
          },
          deliveredTo: ["n8n_webhook"],
        });
      } else {
        void emitEvent({
          eventType: "email.opted_in",
          sessionId: row.id,
          email: marketingAddr,
          payload: { source: "intake_session" },
          deliveredTo: ["nurture"],
        });
      }
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

  const responseData: {
    sessionId: string;
    rapportUrl?: string;
    scores: DomainScores;
    primaryTheme: MeasuredPillarId;
    mainNurtureSkipped?: boolean;
  } = {
    sessionId: row.id,
    scores,
    primaryTheme,
  };
  if (mainNurtureSkipped) {
    responseData.mainNurtureSkipped = true;
  }
  if (isRemeasure && remeasureBaselineId) {
    const signedBase = signIntakeSessionId(remeasureBaselineId);
    if (signedBase) {
      responseData.rapportUrl = `/rapport/${encodeURIComponent(signed)}?base=${encodeURIComponent(signedBase)}`;
    }
  }

  const res = NextResponse.json(responseData, { status: 200 });
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
  if (isRemeasure) {
    res.cookies.set(INTAKE_REMEASURE_BASELINE_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  applyAnalyticsConsentCookie(res, consent.anonymousAnalytics);
  applyAnalyticsConsentStateCookie(res, consent.anonymousAnalytics);

  return res;
}

export async function DELETE(request: NextRequest) {
  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  if (!sessionId) {
    logSecurityEvent("missing_session");
    return NextResponse.json(
      { error: "Geen geldige intake-sessie." },
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

  const result = await deleteIntakeSessionForSession(admin, sessionId);
  if (!result.ok) {
    console.error(
      `[api/intake/session] delete failed at ${result.step}:`,
      result.error,
    );
    return NextResponse.json(
      { error: "Sessie kon niet volledig worden verwijderd." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(INTAKE_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  clearAnalyticsConsentCookie(res);
  return res;
}

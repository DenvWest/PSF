import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile-verify";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  INTAKE_SESSION_COOKIE_NAME,
  intakeSessionCookieOptions,
  signIntakeSessionId,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import {
  createNutritionCheckSession,
  isCheckSessionCreateEnabled,
  normalizeReferralSource,
} from "@/lib/intake-session-create";
import { rollbackIntakeSession } from "@/lib/intake-session-rollback";
import { getAccountFromCookie } from "@/lib/account-server";
import { accountStorageConsentRow } from "@/lib/account-storage-consent";
import { attributeIntakeLead } from "@/lib/affiliate/conversions";
import { AFFILIATE_REF_COOKIE } from "@/lib/referral-attribution";
import {
  estimateNutritionIntake,
  ESTIMATE_VERSION,
  type IntakeEstimate,
} from "@/lib/nutrition-intake-estimate";
import {
  NUTRITION_QUESTIONS,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import { emitEvent } from "@/lib/events";
import { nutritionLogConsentRow } from "@/lib/nutrition-log-consent";
import {
  buildNutritionLogResponse,
  type NutritionPreference,
} from "@/lib/nutrition-log-response";
import {
  computeNutritionScore,
  nutritionReportFromAnswers,
  NUTRITION_SCORE_VERSION,
} from "@/lib/nutrition-score";

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

const TURNSTILE_ACTION = "nutrition_check_save";

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/intake/nutrition-log][security]", { event, ...details });
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
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

  const cookieSessionId = verifySignedIntakeSessionCookie(
    request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value,
  );
  const turnstileToken = normalizeSingleLine(bodyRecord.turnstileToken);

  // Zonder token blijft het antwoord een 401: zo toont een oude, gecachte client
  // nog steeds zijn doorverwijzing in plaats van een onbekende fout.
  if (!cookieSessionId && (!isCheckSessionCreateEnabled() || !turnstileToken)) {
    return NextResponse.json(
      { error: "Doe eerst de Leefstijlcheck via /intake." },
      { status: 401 },
    );
  }

  if (!cookieSessionId) {
    if (normalizeSingleLine(bodyRecord.website)) {
      logSecurityEvent("honeypot_hit", { remoteIp: clientIp });
      return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
    }

    const turnstileCheck = await verifyTurnstileToken({
      token: turnstileToken,
      remoteIp: clientIp,
      expectedAction: TURNSTILE_ACTION,
      logContext: "api/intake/nutrition-log",
    });

    if (!turnstileCheck.ok) {
      if (turnstileCheck.reason === "config") {
        return NextResponse.json(
          { error: "Human verification is nog niet geconfigureerd op de server." },
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

  let sessionId: string;
  let newSessionCookie: string | null = null;
  let newSessionAccountId: string | null = null;

  if (cookieSessionId) {
    sessionId = cookieSessionId;
  } else {
    const account = await getAccountFromCookie();
    const created = await createNutritionCheckSession(admin, {
      organizationId,
      accountId: account?.id ?? null,
      referralSource: normalizeReferralSource(
        request.cookies.get("psf_referral_source")?.value,
      ),
    });
    if (!created.ok) {
      return NextResponse.json(
        { error: "Kon je check niet opslaan. Probeer het opnieuw." },
        { status: 500 },
      );
    }
    sessionId = created.sessionId;
    newSessionCookie = signIntakeSessionId(sessionId);
    newSessionAccountId = account?.id ?? null;
    if (!newSessionCookie) {
      await rollbackIntakeSession(admin, sessionId);
      return NextResponse.json(
        { error: "Kon sessie niet vastleggen." },
        { status: 500 },
      );
    }
  }

  const isNewSession = newSessionCookie !== null;

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
    if (isNewSession) {
      await rollbackIntakeSession(admin, sessionId);
    }
    return NextResponse.json(
      { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  // Ingelogd zonder cookie: de nieuwe sessie hangt meteen aan het account, met
  // dezelfde bewaar-toestemming die request-link bij een koppeling vastlegt.
  if (newSessionAccountId) {
    const { error: storageConsentError } = await admin
      .from("consent_records")
      .insert(
        accountStorageConsentRow({ sessionId, organizationId, ipHash, uaHash }),
      );
    if (storageConsentError) {
      console.error(
        "[api/intake/nutrition-log] account storage consent insert error:",
        storageConsentError,
      );
      await rollbackIntakeSession(admin, sessionId);
      return NextResponse.json(
        { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
        { status: 500 },
      );
    }
  }

  // Haal de vorige log op (voor delta-berekening) — vóór de nieuwe insert.
  let previousEstimate: IntakeEstimate[] | null = null;
  let previousLoggedAt: string | null = null;
  if (!isNewSession) {
    const { data: prevRows } = await admin
      .from("intake_intake_log")
      .select("estimate, logged_at")
      .eq("session_id", sessionId)
      .order("logged_at", { ascending: false })
      .limit(1);

    if (prevRows && prevRows.length > 0) {
      const raw = prevRows[0].estimate;
      if (Array.isArray(raw) && raw.length > 0) {
        previousEstimate = raw as IntakeEstimate[];
        previousLoggedAt =
          typeof prevRows[0].logged_at === "string" ? prevRows[0].logged_at : null;
      }
    }
  }

  const estimate = estimateNutritionIntake(report);

  const responsePayload = buildNutritionLogResponse(
    {
      sliders: answers.sliders,
      allergies: answers.allergies,
      preference: answers.preference as NutritionPreference,
    },
    previousEstimate,
  );

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
    nutrition_score_version: NUTRITION_SCORE_VERSION,
  });

  if (logError) {
    console.error("[api/intake/nutrition-log] log insert error:", logError);
    if (isNewSession) {
      await rollbackIntakeSession(admin, sessionId);
    }
    return NextResponse.json(
      { error: "Kon rapportage niet opslaan." },
      { status: 500 },
    );
  }

  if (isNewSession) {
    await attributeIntakeLead(admin, {
      sessionId,
      affRef: request.cookies.get(AFFILIATE_REF_COOKIE)?.value ?? null,
      occurredAt: new Date().toISOString(),
    });
  }

  // Emit anonieme signalen — breken de respons nooit.
  try {
    await emitEvent({
      eventType: "measurement.checkin_completed",
      sessionId,
      payload: {
        domain: "nutrition",
        nutrition_score: score,
        band: responsePayload.band.id,
        estimate_version: ESTIMATE_VERSION,
        session_created: isNewSession,
        ...(isNewSession ? { session_kind: "nutrition" } : {}),
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

  const res = NextResponse.json(
    { ...responsePayload, loggedAt: new Date().toISOString(), previousLoggedAt },
    { status: 200 },
  );
  if (newSessionCookie) {
    res.cookies.set(INTAKE_SESSION_COOKIE_NAME, newSessionCookie, intakeSessionCookieOptions());
  }
  return res;
}

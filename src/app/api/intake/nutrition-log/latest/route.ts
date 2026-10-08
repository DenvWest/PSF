import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { resolveCheckSubject } from "@/lib/intake-session-resolve";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import {
  buildNutritionLogResponse,
  type NutritionAnswers,
  type NutritionPreference,
} from "@/lib/nutrition-log-response";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";
import { isCheckSessionCreateEnabled } from "@/lib/intake-session-create";

const PREFERENCE_VALUES = new Set(["none", "pescatarian", "vegetarian", "vegan"]);

function parseStoredAnswers(raw: unknown): NutritionAnswers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const slidersRaw = record.sliders;
  if (!slidersRaw || typeof slidersRaw !== "object" || Array.isArray(slidersRaw)) {
    return null;
  }

  const sliders: Record<string, number> = {};
  for (const [key, value] of Object.entries(slidersRaw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isInteger(value)) {
      sliders[key] = value;
    }
  }

  const allergies = Array.isArray(record.allergies)
    ? (record.allergies as unknown[]).filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const preferenceRaw = record.preference;
  const preference: NutritionPreference =
    typeof preferenceRaw === "string" && PREFERENCE_VALUES.has(preferenceRaw)
      ? (preferenceRaw as NutritionPreference)
      : "none";

  return { sliders, allergies, preference };
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_log_read",
    clientIp,
    getRateLimitConfig("intake_log_read"),
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

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const cookieSessionId = verifySignedIntakeSessionCookie(rawCookie);

  // Eerst "wie is dit?": ingelogd levert alle sessies van het account op (lost
  // op dat een check op een nieuw apparaat of na cookie-verlies onvindbaar
  // was), anoniem valt terug op de cookie. Zie
  // BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.4 (P4/P5).
  const { sessionIds } = await resolveCheckSubject(cookieSessionId);

  if (sessionIds.length === 0) {
    // `canCreateSession` vertelt de check of hij zelf een sessie mag aanmaken bij
    // het opslaan. Hier en niet als pagina-prop: /intake wordt statisch gebouwd,
    // en dan zou de vlag pas na een nieuwe build omgaan.
    return NextResponse.json(
      {
        error: "Doe eerst de check via /intake.",
        canCreateSession: isCheckSessionCreateEnabled(),
      },
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

  const { data: rows, error } = await admin
    .from("intake_intake_log")
    .select("estimate, raw_inputs, logged_at")
    .in("session_id", sessionIds)
    .order("logged_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("[api/intake/nutrition-log/latest] select error:", error);
    return NextResponse.json(
      { error: "Kon voedingslog niet ophalen." },
      { status: 500 },
    );
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Geen check gevonden." }, { status: 404 });
  }

  const latest = rows[0];
  const answers = parseStoredAnswers(latest.raw_inputs);
  if (!answers) {
    return NextResponse.json(
      { error: "Opgeslagen antwoorden zijn ongeldig." },
      { status: 500 },
    );
  }

  let previousEstimate: IntakeEstimate[] | null = null;
  let previousLoggedAt: string | null = null;
  if (rows.length > 1) {
    const rawPrev = rows[1].estimate;
    if (Array.isArray(rawPrev) && rawPrev.length > 0) {
      previousEstimate = rawPrev as IntakeEstimate[];
      previousLoggedAt =
        typeof rows[1].logged_at === "string" ? rows[1].logged_at : null;
    }
  }

  const response = buildNutritionLogResponse(answers, previousEstimate);
  const report = nutritionReportFromAnswers(answers.sliders);

  return NextResponse.json(
    {
      ...response,
      proteinMealsPerDay: report.proteinMealsPerDay,
      loggedAt: latest.logged_at,
      previousLoggedAt,
      answers,
    },
    { status: 200 },
  );
}

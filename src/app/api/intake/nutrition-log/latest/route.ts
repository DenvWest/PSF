import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import {
  buildNutritionLogResponse,
  type NutritionAnswers,
  type NutritionPreference,
} from "@/lib/nutrition-log-response";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";

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

  const { data: rows, error } = await admin
    .from("intake_intake_log")
    .select("estimate, raw_inputs, logged_at")
    .eq("session_id", sessionId)
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
    return NextResponse.json({ error: "Geen voedingscheck gevonden." }, { status: 404 });
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
  if (rows.length > 1) {
    const rawPrev = rows[1].estimate;
    if (Array.isArray(rawPrev) && rawPrev.length > 0) {
      previousEstimate = rawPrev as IntakeEstimate[];
    }
  }

  const response = buildNutritionLogResponse(answers, previousEstimate);
  const report = nutritionReportFromAnswers(answers.sliders);

  return NextResponse.json(
    {
      ...response,
      proteinMealsPerDay: report.proteinMealsPerDay,
      loggedAt: latest.logged_at,
    },
    { status: 200 },
  );
}

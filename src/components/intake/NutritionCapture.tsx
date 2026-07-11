"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import {
  isYoutubeReferral,
  setReferralCookiesFromSearchParams,
} from "@/lib/referral-attribution";
import { NUTRITION_LOG_CONSENT_TEXT } from "@/lib/consent-texts";
import {
  NUTRITION_BREADTH_SLIDER_IDS,
  NUTRITION_BREADTH_STEP_COUNT,
  NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
  NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET,
  NUTRITION_META_QUESTIONS,
  NUTRITION_REQUIRED_STEP_COUNT,
  nutritionSliderQuestion,
  type NutritionQuestion,
  type NutritionScale,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import {
  firstAfterDietIndex,
  firstBreadthIndex,
  getCurrentlySkippedIds,
  getBreadthSkipReason,
  getSkipReason,
  getSkippedSliderLabels,
  getSliderCopy,
  getVisiblePreferenceOptions,
  hasFishOrSeafoodAllergy,
  isPreferenceDisabled,
  lastAfterDietIndex,
  lastBreadthIndex,
  nextAfterDietIndex,
  nextBreadthIndex,
  syncDietContext,
  type DietContext,
} from "@/lib/nutrition-diet-skip";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import type { LifestyleExtra } from "@/lib/nutrition-lifestyle-extras";
import { type NutrientDelta } from "@/lib/nutrition-delta";
import IntakeSlider from "@/components/intake/IntakeSlider";
import NutritionResultView from "@/components/intake/NutritionResultView";

type Step =
  | { kind: "coreBeforeDiet"; index: number }
  | { kind: "meta"; index: number }
  | { kind: "coreAfterDiet"; index: number }
  | { kind: "breadthIntro" }
  | { kind: "breadth"; index: number }
  | { kind: "consent" }
  | {
      kind: "result";
      estimate: IntakeEstimate[];
      statements: string[];
      advice: NutritionAdviceItem[];
      lifestyleExtras?: LifestyleExtra[];
      delta: NutrientDelta[] | null;
      score: number;
      proteinMealsPerDay?: number;
    }
  | { kind: "error"; message: string };

type QuestionStep = Exclude<
  Step,
  { kind: "result" | "error" | "consent" | "breadthIntro" }
>;

function isQuestionStep(step: Step): step is QuestionStep {
  return (
    step.kind === "coreBeforeDiet" ||
    step.kind === "meta" ||
    step.kind === "coreAfterDiet" ||
    step.kind === "breadth"
  );
}

const CONSENT_PROGRESS_DENOM = NUTRITION_REQUIRED_STEP_COUNT + 1;
const BEFORE_DIET_COUNT = NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET.length;
const META_COUNT = NUTRITION_META_QUESTIONS.length;

function sliderAxisLabels(scale: NutritionScale): { min: string; max: string } {
  switch (scale) {
    case "percentage":
      return { min: "0%", max: "100%" };
    case "perDay":
      return { min: "Nooit", max: "Veel" };
    case "perWeek":
      return { min: "Nooit", max: "Vaak" };
    case "frequency":
    default:
      return { min: "Nooit", max: "Vaak" };
  }
}

function proteinMealsFromSliders(sliders: Record<string, number>): number | undefined {
  const question = nutritionSliderQuestion("proteinMeals");
  if (!question) {
    return undefined;
  }
  const index = sliders.proteinMeals ?? question.defaultIndex;
  const stop = question.stops[Math.min(Math.max(0, index), question.stops.length - 1)];
  return stop.report?.proteinMealsPerDay;
}

function sliderDefaults(): Record<string, number> {
  const defaults: Record<string, number> = {};
  for (const id of [
    ...NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET,
    ...NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
    ...NUTRITION_BREADTH_SLIDER_IDS,
  ]) {
    const question = nutritionSliderQuestion(id);
    if (question) {
      defaults[id] = question.defaultIndex;
    }
  }
  return defaults;
}

function dietContext(preference: string | null, allergies: string[]): DietContext {
  return {
    preference: preference ?? "none",
    allergies,
  };
}

function questionForStep(step: QuestionStep): NutritionQuestion {
  if (step.kind === "coreBeforeDiet") {
    const id = NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET[step.index];
    const slider = nutritionSliderQuestion(id);
    if (!slider) {
      throw new Error(`Missing core slider: ${id}`);
    }
    return slider;
  }
  if (step.kind === "coreAfterDiet") {
    const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[step.index];
    const slider = nutritionSliderQuestion(id);
    if (!slider) {
      throw new Error(`Missing core slider: ${id}`);
    }
    return slider;
  }
  if (step.kind === "meta") {
    return NUTRITION_META_QUESTIONS[step.index];
  }
  const id = NUTRITION_BREADTH_SLIDER_IDS[step.index];
  const slider = nutritionSliderQuestion(id);
  if (!slider) {
    throw new Error(`Missing breadth slider: ${id}`);
  }
  return slider;
}

function requiredStepsCompleted(step: Step, ctx: DietContext): number {
  switch (step.kind) {
    case "coreBeforeDiet":
      return step.index + 1;
    case "meta":
      return BEFORE_DIET_COUNT + step.index + 1;
    case "coreAfterDiet": {
      let count = BEFORE_DIET_COUNT + META_COUNT;
      for (let i = 0; i <= step.index; i++) {
        const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[i];
        if (getSkipReason(id, ctx) === null) {
          count += 1;
        }
      }
      return count;
    }
    case "breadthIntro":
    case "breadth":
      return NUTRITION_REQUIRED_STEP_COUNT;
    case "consent":
      return CONSENT_PROGRESS_DENOM;
    default:
      return 0;
  }
}

function progressForStep(step: Step, ctx: DietContext): number {
  return (requiredStepsCompleted(step, ctx) / CONSENT_PROGRESS_DENOM) * 100;
}

function requiredStepNumber(step: Step, ctx: DietContext): number | null {
  if (step.kind === "breadth" || step.kind === "breadthIntro") {
    return null;
  }
  const completed = requiredStepsCompleted(step, ctx);
  if (step.kind === "consent") {
    return NUTRITION_REQUIRED_STEP_COUNT;
  }
  return completed;
}

function canGoBack(step: Step): boolean {
  if (
    step.kind === "consent" ||
    step.kind === "breadthIntro" ||
    step.kind === "breadth" ||
    step.kind === "meta" ||
    step.kind === "coreAfterDiet"
  ) {
    return true;
  }
  if (step.kind === "coreBeforeDiet") {
    return step.index > 0;
  }
  return false;
}

function trackFrom(
  fromDashboard: boolean,
  fromYoutube: boolean,
): "dashboard" | "youtube" | "direct" {
  if (fromDashboard) return "dashboard";
  if (fromYoutube) return "youtube";
  return "direct";
}

export default function NutritionCapture() {
  const searchParams = useSearchParams();
  const hasResultsParam = searchParams.get("resultaten") === "true";
  const fromDashboard = searchParams.get("from") === "dashboard";
  const kompas = searchParams.get("kompas");
  const validKompas = new Set([
    "slaap",
    "energie",
    "stress",
    "voeding",
    "beweging",
    "herstel",
    "verbinding",
  ]);
  const originDomain = kompas && validKompas.has(kompas) ? kompas : null;
  const [step, setStep] = useState<Step>({ kind: "coreBeforeDiet", index: 0 });
  const [sliders, setSliders] = useState<Record<string, number>>(sliderDefaults);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preference, setPreference] = useState<string | null>(null);
  const [optOutChecked, setOptOutChecked] = useState<Record<string, boolean>>({});
  const [breadthSkipped, setBreadthSkipped] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fromYoutube] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return isYoutubeReferral(new URLSearchParams(window.location.search));
  });
  const [isLoadingResult, setIsLoadingResult] = useState(hasResultsParam);
  const [resultsLoadError, setResultsLoadError] = useState<string | null>(null);
  const trackedSkipsRef = useRef<Set<string>>(new Set());

  const ctx = dietContext(preference, allergies);
  const flowStep =
    step.kind === "coreAfterDiet" || step.kind === "breadth"
      ? (redirectIfCurrentStepSkipped(ctx, step) ?? step)
      : step;

  function trackNewSkips(nextCtx: DietContext) {
    for (const id of getCurrentlySkippedIds(nextCtx)) {
      if (trackedSkipsRef.current.has(id)) {
        continue;
      }
      trackedSkipsRef.current.add(id);
      const reason =
        id === "wholegrain"
          ? getBreadthSkipReason("wholegrain", nextCtx)
          : getSkipReason(id as (typeof NUTRITION_CORE_SLIDER_IDS_AFTER_DIET)[number], nextCtx);
      if (reason) {
        trackEvent(GA4_EVENTS.NUTRITION_DIET_SKIPPED, {
          question_id: id,
          reason,
          from: trackFrom(fromDashboard, fromYoutube),
        });
      }
    }
  }

  function runDietSync(
    nextCtx: DietContext,
    currentSliders: Record<string, number>,
    currentOptOut: Record<string, boolean>,
  ) {
    const synced = syncDietContext(currentSliders, currentOptOut, nextCtx);
    setSliders(synced.sliders);
    setOptOutChecked(synced.optOutChecked);
    trackNewSkips(nextCtx);
    return synced;
  }

  function redirectIfCurrentStepSkipped(
    nextCtx: DietContext,
    currentStep: Step,
  ): Step | null {
    if (currentStep.kind === "coreAfterDiet") {
      const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[currentStep.index];
      if (id && getSkipReason(id, nextCtx)) {
        const first = firstAfterDietIndex(nextCtx);
        if (first >= 0) {
          return { kind: "coreAfterDiet", index: first };
        }
        return { kind: "breadthIntro" };
      }
    }
    if (currentStep.kind === "breadth") {
      const id = NUTRITION_BREADTH_SLIDER_IDS[currentStep.index];
      if (id && getBreadthSkipReason(id, nextCtx)) {
        const next = nextBreadthIndex(currentStep.index, nextCtx, "forward");
        if (next >= 0) {
          return { kind: "breadth", index: next };
        }
        return { kind: "consent" };
      }
    }
    return null;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferralCookiesFromSearchParams(params);
    if (!hasResultsParam) {
      clarityTag("nutrition_flow", "started");
    }
    if (fromYoutube) {
      trackEvent("nutrition_youtube_landing", {
        utm_campaign: params.get("utm_campaign") ?? "",
        utm_content: params.get("utm_content") ?? "",
      });
      clarityTag("nutrition_referral", "youtube");
    }
  }, [fromYoutube, hasResultsParam]);

  useEffect(() => {
    if (!hasResultsParam) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingResult(true);
      setResultsLoadError(null);
      try {
        const res = await fetch("/api/intake/nutrition-log/latest", {
          credentials: "include",
        });
        if (cancelled) {
          return;
        }
        if (res.status === 401) {
          setStep({ kind: "error", message: "401" });
          return;
        }
        if (res.status === 404) {
          setResultsLoadError("Je hebt nog geen voedingscheck afgerond.");
          return;
        }
        if (!res.ok) {
          setResultsLoadError("Kon je resultaat niet laden. Probeer het opnieuw.");
          return;
        }

        const data = (await res.json()) as {
          estimate: IntakeEstimate[];
          statements: string[];
          advice: NutritionAdviceItem[];
          lifestyleExtras?: LifestyleExtra[];
          delta: NutrientDelta[] | null;
          score: number;
          proteinMealsPerDay?: number;
        };

        trackEvent(GA4_EVENTS.NUTRITION_RESULT_REOPEN_CLICK, {
          surface: fromDashboard ? "dashboard_voeding" : "result",
        });
        clarityTag("nutrition_result_reopen", fromDashboard ? "dashboard" : "deeplink");

        setStep({
          kind: "result",
          estimate: data.estimate,
          statements: data.statements,
          advice: data.advice,
          lifestyleExtras: data.lifestyleExtras ?? [],
          delta: data.delta ?? null,
          score: data.score,
          proteinMealsPerDay: data.proteinMealsPerDay,
        });
      } catch {
        if (!cancelled) {
          setResultsLoadError("Kon je resultaat niet laden. Probeer het opnieuw.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResult(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fromDashboard, hasResultsParam]);

  function resetFlow() {
    setStep({ kind: "coreBeforeDiet", index: 0 });
    setSliders(sliderDefaults());
    setAllergies([]);
    setPreference(null);
    setOptOutChecked({});
    setBreadthSkipped(false);
    setConsentChecked(false);
    trackedSkipsRef.current = new Set();
  }

  function goToAfterDietOrBreadth(nextCtx: DietContext) {
    const first = firstAfterDietIndex(nextCtx);
    if (first >= 0) {
      setStep({ kind: "coreAfterDiet", index: first });
      return;
    }
    setStep({ kind: "breadthIntro" });
  }

  function handlePreferenceSelect(value: string) {
    if (isPreferenceDisabled(value, allergies)) {
      return;
    }
    const nextCtx = dietContext(value, allergies);
    setPreference(value);
    runDietSync(nextCtx, sliders, optOutChecked);
    goToAfterDietOrBreadth(nextCtx);
  }

  function goNextFromCoreBeforeDiet(index: number) {
    if (index + 1 < BEFORE_DIET_COUNT) {
      setStep({ kind: "coreBeforeDiet", index: index + 1 });
      return;
    }
    setStep({ kind: "meta", index: 0 });
  }

  function goNextFromMeta(index: number) {
    if (index === 0) {
      const nextCtx = dietContext(preference, allergies);
      runDietSync(nextCtx, sliders, optOutChecked);
      setStep({ kind: "meta", index: 1 });
    }
  }

  function goNextFromCoreAfterDiet(index: number) {
    const next = nextAfterDietIndex(index, ctx, "forward");
    if (next >= 0) {
      setStep({ kind: "coreAfterDiet", index: next });
      return;
    }
    setStep({ kind: "breadthIntro" });
  }

  function goNextFromBreadth(index: number) {
    const next = nextBreadthIndex(index, ctx, "forward");
    if (next >= 0) {
      setStep({ kind: "breadth", index: next });
      return;
    }
    setBreadthSkipped(false);
    setStep({ kind: "consent" });
  }

  function handleSkipBreadth() {
    trackEvent(GA4_EVENTS.NUTRITION_BREADTH_SKIPPED, {
      skipped: true,
      from: trackFrom(fromDashboard, fromYoutube),
    });
    clarityTag("nutrition_breadth", "skipped");
    setBreadthSkipped(true);
    setStep({ kind: "consent" });
  }

  function handleContinueBreadth() {
    setBreadthSkipped(false);
    const first = firstBreadthIndex(ctx);
    if (first >= 0) {
      setStep({ kind: "breadth", index: first });
      return;
    }
    setStep({ kind: "consent" });
  }

  function handleBack() {
    if (flowStep.kind === "consent") {
      if (breadthSkipped) {
        setStep({ kind: "breadthIntro" });
        return;
      }
      const last = lastBreadthIndex(ctx);
      if (last >= 0) {
        setStep({ kind: "breadth", index: last });
        return;
      }
      setStep({ kind: "breadthIntro" });
      return;
    }
    if (flowStep.kind === "breadthIntro") {
      const last = lastAfterDietIndex(ctx);
      if (last >= 0) {
        setStep({ kind: "coreAfterDiet", index: last });
        return;
      }
      setStep({ kind: "meta", index: 1 });
      return;
    }
    if (flowStep.kind === "breadth") {
      const prev = nextBreadthIndex(flowStep.index, ctx, "backward");
      if (prev >= 0) {
        setStep({ kind: "breadth", index: prev });
        return;
      }
      setStep({ kind: "breadthIntro" });
      return;
    }
    if (flowStep.kind === "coreAfterDiet") {
      const prev = nextAfterDietIndex(flowStep.index, ctx, "backward");
      if (prev >= 0) {
        setStep({ kind: "coreAfterDiet", index: prev });
        return;
      }
      setStep({ kind: "meta", index: 1 });
      return;
    }
    if (flowStep.kind === "meta") {
      if (flowStep.index > 0) {
        setStep({ kind: "meta", index: flowStep.index - 1 });
        return;
      }
      setStep({ kind: "coreBeforeDiet", index: BEFORE_DIET_COUNT - 1 });
      return;
    }
    if (flowStep.kind === "coreBeforeDiet" && flowStep.index > 0) {
      setStep({ kind: "coreBeforeDiet", index: flowStep.index - 1 });
    }
  }

  function toggleOptOut(question: SliderQuestion, checked: boolean) {
    setOptOutChecked((current) => ({ ...current, [question.id]: checked }));
    if (checked) {
      setSliders((current) => ({ ...current, [question.id]: 0 }));
      trackEvent(GA4_EVENTS.NUTRITION_SLIDER_OPT_OUT, {
        question_id: question.id,
        from: trackFrom(fromDashboard, fromYoutube),
      });
      return;
    }
    setSliders((current) => ({ ...current, [question.id]: question.defaultIndex }));
  }

  async function handleSubmit() {
    if (!consentChecked || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake/nutrition-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers: { sliders, allergies, preference: preference ?? "none" },
          consent: true,
        }),
      });

      if (res.status === 401) {
        setStep({ kind: "error", message: "401" });
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setStep({
          kind: "error",
          message: data?.error ?? "Er ging iets mis. Probeer het opnieuw.",
        });
        return;
      }

      const data = (await res.json()) as {
        estimate: IntakeEstimate[];
        statements: string[];
        advice: NutritionAdviceItem[];
        lifestyleExtras?: LifestyleExtra[];
        delta: NutrientDelta[] | null;
        score: number;
        band?: { id: string };
        proteinMealsPerDay?: number;
      };

      clarityTag("nutrition_flow", "completed");
      const from = trackFrom(fromDashboard, fromYoutube);
      trackEvent("nutrition_check_completed", {
        nutrition_score: data.score,
        band: data.band?.id ?? "unknown",
        from,
        breadth_skipped: breadthSkipped,
      });
      trackEvent("nutrition_log_completed", {
        nutrition_score: data.score,
        from,
        breadth_skipped: breadthSkipped,
      });
      setStep({
        kind: "result",
        estimate: data.estimate,
        statements: data.statements,
        advice: data.advice,
        lifestyleExtras: data.lifestyleExtras ?? [],
        delta: data.delta ?? null,
        score: data.score,
        proteinMealsPerDay: data.proteinMealsPerDay ?? proteinMealsFromSliders(sliders),
      });
    } catch {
      setStep({ kind: "error", message: "Er ging iets mis. Probeer het opnieuw." });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleAllergy(value: string) {
    const nextAllergies = allergies.includes(value)
      ? allergies.filter((item) => item !== value)
      : [...allergies, value];

    const nextCtx = dietContext(preference, nextAllergies);
    setAllergies(nextAllergies);
    runDietSync(nextCtx, sliders, optOutChecked);

    if (preference && isPreferenceDisabled(preference, nextAllergies)) {
      setPreference(null);
    }

    const redirected = redirectIfCurrentStepSkipped(nextCtx, flowStep);
    if (redirected) {
      setStep(redirected);
    }
  }

  if (step.kind === "result") {
    return (
      <NutritionResultView
        score={step.score}
        estimate={step.estimate}
        statements={step.statements}
        advice={step.advice}
        lifestyleExtras={step.lifestyleExtras}
        delta={step.delta}
        proteinMealsPerDay={
          hasResultsParam ? step.proteinMealsPerDay : proteinMealsFromSliders(sliders)
        }
        fromDashboard={fromDashboard}
        originDomain={originDomain}
      />
    );
  }

  if (hasResultsParam && isLoadingResult) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12 text-center">
          <p className="text-base text-intake-ink">Je resultaat laden…</p>
        </div>
      </div>
    );
  }

  if (hasResultsParam && resultsLoadError) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12 text-center">
          <p className="mb-6 text-base text-intake-ink">{resultsLoadError}</p>
          <Link
            href="/intake/voeding"
            className="inline-block rounded-[12px] bg-intake-terra px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-intake-terra/90"
          >
            Start de voedingscheck →
          </Link>
        </div>
      </div>
    );
  }

  if (step.kind === "error") {
    if (step.message === "401") {
      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
          <div className="w-full max-w-lg px-6 py-12 text-center">
            <p className="mb-6 text-base text-intake-ink">
              Om je voedingsrapport op te slaan, heb je eerst een Leefstijlcheck nodig.
            </p>
            <Link
              href="/intake"
              className="inline-block rounded-[12px] bg-intake-terra px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-intake-terra/90"
            >
              Start de Leefstijlcheck →
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12 text-center">
          <p className="mb-6 text-base text-intake-ink">{step.message}</p>
          <button
            type="button"
            onClick={resetFlow}
            className="rounded-[12px] border border-intake-card-border bg-transparent px-6 py-3 text-sm font-semibold text-intake-ink transition-colors hover:bg-intake-bg-elevated"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  const progressPct = progressForStep(flowStep, ctx);

  if (step.kind === "consent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={CONSENT_PROGRESS_DENOM}
          aria-valuemin={1}
          aria-valuemax={CONSENT_PROGRESS_DENOM}
          aria-label="Voortgang voedingscheck"
        >
          <div
            className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
            style={{ width: "100%" }}
          />
        </div>

        <div className="w-full max-w-lg px-6 py-12">
          <h2 className="mb-6 text-center font-serif text-2xl font-normal text-intake-ink">
            Jouw gegevens veilig opslaan
          </h2>

          <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-intake-terra"
            />
            <span className="text-sm leading-relaxed text-intake-ink-muted">
              {NUTRITION_LOG_CONSENT_TEXT.nutrition_intake_logging}
            </span>
          </label>

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted"
            >
              ← Terug
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!consentChecked || submitting}
              className="min-h-[44px] rounded-[12px] bg-intake-sage px-6 py-3 text-sm font-semibold text-[#0f1c10] transition-all duration-200 hover:opacity-90 disabled:cursor-default disabled:opacity-30"
            >
              {submitting ? "Bezig…" : "Bekijk je score →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step.kind === "breadthIntro") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={NUTRITION_REQUIRED_STEP_COUNT}
          aria-valuemin={1}
          aria-valuemax={CONSENT_PROGRESS_DENOM}
          aria-label="Voortgang voedingscheck"
        >
          <div
            className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="w-full max-w-lg px-6 py-12">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            Optioneel
          </p>
          <h2 className="mb-4 text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl">
            Nog {NUTRITION_BREADTH_STEP_COUNT} vragen voor een verfijnde score
          </h2>
          <p className="mb-10 text-center text-sm leading-relaxed text-intake-ink-subtle">
            Fruit, volkoren en suiker tellen mee in je totaalscore — overslaan mag.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleContinueBreadth}
              className="min-h-[44px] rounded-[12px] bg-intake-sage px-6 py-3 text-sm font-semibold text-[#0f1c10] transition-all duration-200 hover:opacity-90"
            >
              Verder ({NUTRITION_BREADTH_STEP_COUNT} vragen) →
            </button>
            <button
              type="button"
              onClick={handleSkipBreadth}
              className="min-h-[44px] rounded-[12px] border border-intake-card-border bg-transparent px-6 py-3 text-sm font-semibold text-intake-ink transition-colors hover:bg-intake-bg-elevated"
            >
              Overslaan → naar resultaat
            </button>
          </div>

          <div className="mt-10 flex items-center justify-start">
            <button
              type="button"
              onClick={handleBack}
              className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted"
            >
              ← Terug
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isQuestionStep(flowStep)) {
    return null;
  }

  const question = questionForStep(flowStep);
  const stepNumber = requiredStepNumber(flowStep, ctx);
  const isOptionalBreadth = flowStep.kind === "breadth";
  const questionNumber = stepNumber ? String(stepNumber).padStart(2, "0") : null;
  const showYoutubeBanner =
    fromYoutube && flowStep.kind === "coreBeforeDiet" && flowStep.index === 0;

  let displayPrompt = question.prompt;
  let displayHelper = question.helper;
  let displayOptOutLabel: string | undefined;
  if (question.kind === "slider" && flowStep.kind === "coreAfterDiet") {
    const sliderId = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[flowStep.index];
    const copy = getSliderCopy(sliderId, ctx);
    displayPrompt = copy.prompt ?? question.prompt;
    displayHelper = copy.helper ?? question.helper;
    displayOptOutLabel = copy.optOutLabel;
  }

  const allergySkipLabels =
    flowStep.kind === "meta" && flowStep.index === 0 ? getSkippedSliderLabels(ctx) : [];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={stepNumber ?? NUTRITION_REQUIRED_STEP_COUNT}
        aria-valuemin={1}
        aria-valuemax={CONSENT_PROGRESS_DENOM}
        aria-label="Voortgang voedingscheck"
      >
        <div
          className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="w-full max-w-lg px-6 py-12">
        {showYoutubeBanner ? (
          <div className="mb-6 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-intake-terra">
              Vanuit YouTube
            </p>
            <p className="mt-2 text-sm leading-relaxed text-intake-ink-muted">
              Eerst je bord — dan pas supplement. Deze check laat zien waar je
              frequentie tekortschiet. Geen diagnose, wel concrete stappen.
            </p>
          </div>
        ) : null}

        <div className="mb-2 flex items-center justify-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            {questionNumber ? (
              <>
                <span className="text-intake-terra">{questionNumber}</span>
                {" · "}
              </>
            ) : null}
            Voeding
          </p>
        </div>

        <p className="mb-8 text-center text-sm text-intake-ink-subtle">
          {isOptionalBreadth
            ? `Optioneel — ${flowStep.index + 1} van ${NUTRITION_BREADTH_STEP_COUNT}`
            : stepNumber
              ? `Vraag ${stepNumber} van ${NUTRITION_REQUIRED_STEP_COUNT}`
              : null}
        </p>

        <div className="min-h-[400px] animate-[fadeIn_200ms_ease-out]">
          <h2 className="mb-3 text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl">
            {displayPrompt}
          </h2>
          {displayHelper ? (
            <p className="mb-10 text-center text-sm leading-relaxed text-intake-ink-subtle">
              {displayHelper}
            </p>
          ) : (
            <div className="mb-10" />
          )}

          {renderQuestionBody(question)}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack(flowStep)}
            className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted disabled:cursor-default disabled:opacity-30"
            style={{ visibility: canGoBack(flowStep) ? "visible" : "hidden" }}
          >
            ← Terug
          </button>

          {question.kind === "single" ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (flowStep.kind === "coreBeforeDiet") {
                  goNextFromCoreBeforeDiet(flowStep.index);
                } else if (flowStep.kind === "meta") {
                  goNextFromMeta(flowStep.index);
                } else if (flowStep.kind === "coreAfterDiet") {
                  goNextFromCoreAfterDiet(flowStep.index);
                } else if (flowStep.kind === "breadth") {
                  goNextFromBreadth(flowStep.index);
                }
              }}
              className="min-h-[44px] rounded-[12px] bg-intake-sage px-6 py-3 text-sm font-semibold text-[#0f1c10] transition-all duration-200 hover:opacity-90"
            >
              Volgende →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function showOptOut(q: SliderQuestion): boolean {
    if (!q.optOut) {
      return false;
    }
    if (flowStep.kind === "coreAfterDiet") {
      const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[flowStep.index];
      if (id && getSkipReason(id, ctx)) {
        return false;
      }
    }
    if (q.id === "meatLegumes" && preference === "vegan") {
      return false;
    }
    if (q.id === "proteinMeals" && allergies.includes("eieren")) {
      return false;
    }
    return true;
  }

  function renderQuestionBody(q: NutritionQuestion) {
    if (q.kind === "slider") {
      const isAutoOptOut = q.id === "proteinMeals" && allergies.includes("eieren");
      const isOptedOut = Boolean(optOutChecked[q.id]) || isAutoOptOut;
      const current = sliders[q.id] ?? q.defaultIndex;
      const axis = sliderAxisLabels(q.scale);
      return (
        <div className="flex flex-col gap-6">
          {showOptOut(q) ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4">
              <input
                type="checkbox"
                checked={isOptedOut}
                onChange={(e) => toggleOptOut(q, e.target.checked)}
                className="h-4 w-4 shrink-0 accent-intake-sage"
              />
              <span className="text-sm font-medium text-intake-ink">
                {displayOptOutLabel ?? q.optOut!.label}
              </span>
            </label>
          ) : null}
          <div className={isOptedOut ? "pointer-events-none opacity-40" : undefined}>
            <IntakeSlider
              labels={q.stops.map((stop) => stop.label)}
              value={current}
              onChange={(index) => {
                setOptOutChecked((prev) => ({ ...prev, [q.id]: false }));
                setSliders((prev) => ({ ...prev, [q.id]: index }));
              }}
              minLabel={axis.min}
              maxLabel={axis.max}
              ariaLabel={q.prompt}
            />
          </div>
        </div>
      );
    }

    if (q.kind === "multi") {
      return (
        <div className="flex flex-col gap-3">
          {q.options.map((opt) => {
            const selected = allergies.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleAllergy(opt.value)}
                className={`flex w-full min-h-[44px] items-center justify-between rounded-[14px] border px-5 py-4 text-left text-base font-medium leading-snug transition-all duration-200 ease-out ${
                  selected
                    ? "border-intake-sage/60 bg-intake-sage/15 text-intake-ink"
                    : "border-intake-card-border bg-intake-bg-elevated text-intake-ink-muted hover:border-intake-sage/40 hover:text-intake-ink"
                }`}
              >
                <span>{opt.label}</span>
                <span
                  aria-hidden
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    selected
                      ? "border-intake-sage bg-intake-sage text-[#0f1c10]"
                      : "border-intake-card-border text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            );
          })}
          {allergySkipLabels.length > 0 ? (
            <p className="mt-2 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-sm leading-relaxed text-intake-ink-muted">
              Op basis van je keuzes: {allergySkipLabels.join(", ")} worden overgeslagen.
            </p>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {hasFishOrSeafoodAllergy(allergies) ? (
          <p className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-sm leading-relaxed text-intake-ink-muted">
            Met vis- of zeevruchten-allergie kies je vegetariër of veganist.
          </p>
        ) : null}
        {getVisiblePreferenceOptions(allergies).map((opt) => {
          const selected = preference === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => handlePreferenceSelect(opt.value)}
              className={`block w-full min-h-[44px] rounded-[14px] border px-5 py-4 text-left text-base font-medium leading-snug transition-all duration-200 ease-out ${
                selected
                  ? "border-intake-sage/60 bg-intake-sage/15 text-intake-ink"
                  : "border-intake-card-border bg-intake-bg-elevated text-intake-ink-muted hover:border-intake-sage/40 hover:text-intake-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
}

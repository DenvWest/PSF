"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { NUTRITION_LOG_CONSENT_TEXT } from "@/lib/consent-texts";
import {
  NUTRITION_QUESTIONS,
  type NutritionQuestion,
  type NutritionScale,
} from "@/data/nutrition/lifescore-questions";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import { type NutrientDelta } from "@/lib/nutrition-delta";
import IntakeSlider from "@/components/intake/IntakeSlider";
import NutritionResultView from "@/components/intake/NutritionResultView";

type Step =
  | { kind: "question"; index: number }
  | { kind: "consent" }
  | {
      kind: "result";
      estimate: IntakeEstimate[];
      statements: string[];
      advice: NutritionAdviceItem[];
      delta: NutrientDelta[] | null;
      score: number;
    }
  | { kind: "error"; message: string };

const TOTAL = NUTRITION_QUESTIONS.length;

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
  const question = NUTRITION_QUESTIONS.find(
    (item): item is Extract<NutritionQuestion, { kind: "slider" }> =>
      item.kind === "slider" && item.id === "proteinMeals",
  );
  if (!question) {
    return undefined;
  }
  const index = sliders.proteinMeals ?? question.defaultIndex;
  const stop = question.stops[Math.min(Math.max(0, index), question.stops.length - 1)];
  return stop.report?.proteinMealsPerDay;
}

function sliderDefaults(): Record<string, number> {
  const defaults: Record<string, number> = {};
  for (const question of NUTRITION_QUESTIONS) {
    if (question.kind === "slider") {
      defaults[question.id] = question.defaultIndex;
    }
  }
  return defaults;
}

export default function NutritionCapture() {
  const searchParams = useSearchParams();
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
  const [step, setStep] = useState<Step>({ kind: "question", index: 0 });
  const [sliders, setSliders] = useState<Record<string, number>>(sliderDefaults);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preference, setPreference] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clarityTag("nutrition_flow", "started");
  }, []);

  function goNext(index: number) {
    if (index + 1 < TOTAL) {
      setStep({ kind: "question", index: index + 1 });
    } else {
      setStep({ kind: "consent" });
    }
  }

  function handleBack() {
    if (step.kind === "consent") {
      setStep({ kind: "question", index: TOTAL - 1 });
    } else if (step.kind === "question" && step.index > 0) {
      setStep({ kind: "question", index: step.index - 1 });
    }
  }

  function toggleAllergy(value: string) {
    setAllergies((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
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
        delta: NutrientDelta[] | null;
        score: number;
        band?: { id: string };
      };

      clarityTag("nutrition_flow", "completed");
      trackEvent("nutrition_check_completed", {
        nutrition_score: data.score,
        band: data.band?.id ?? "unknown",
        from: fromDashboard ? "dashboard" : "direct",
      });
      setStep({
        kind: "result",
        estimate: data.estimate,
        statements: data.statements,
        advice: data.advice,
        delta: data.delta ?? null,
        score: data.score,
      });
    } catch {
      setStep({ kind: "error", message: "Er ging iets mis. Probeer het opnieuw." });
    } finally {
      setSubmitting(false);
    }
  }

  if (step.kind === "result") {
    return (
      <NutritionResultView
        score={step.score}
        estimate={step.estimate}
        advice={step.advice}
        delta={step.delta}
        proteinMealsPerDay={proteinMealsFromSliders(sliders)}
        fromDashboard={fromDashboard}
        originDomain={originDomain}
      />
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
            onClick={() => {
              setStep({ kind: "question", index: 0 });
              setSliders(sliderDefaults());
              setAllergies([]);
              setPreference(null);
              setConsentChecked(false);
            }}
            className="rounded-[12px] border border-intake-card-border bg-transparent px-6 py-3 text-sm font-semibold text-intake-ink transition-colors hover:bg-intake-bg-elevated"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "consent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={TOTAL + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL + 1}
          aria-label="Voortgang voedingscheck"
        >
          <div className="h-full bg-intake-terra transition-[width] duration-300 ease-out" style={{ width: "100%" }} />
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

  if (step.kind !== "question") {
    return null;
  }

  const questionIndex = step.index;
  const question = NUTRITION_QUESTIONS[questionIndex];
  const progressPct = ((questionIndex + 1) / (TOTAL + 1)) * 100;
  const questionNumber = String(questionIndex + 1).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={questionIndex + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL + 1}
        aria-label="Voortgang voedingscheck"
      >
        <div
          className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="w-full max-w-lg px-6 py-12">
        <div className="mb-2 flex items-center justify-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            <span className="text-intake-terra">{questionNumber}</span>
            {" · "}
            Voeding
          </p>
        </div>

        <p className="mb-8 text-center text-sm text-intake-ink-subtle">
          Vraag {questionIndex + 1} van {TOTAL}
        </p>

        <div className="min-h-[400px] animate-[fadeIn_200ms_ease-out]">
          <h2 className="mb-3 text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl">
            {question.prompt}
          </h2>
          {question.helper ? (
            <p className="mb-10 text-center text-sm leading-relaxed text-intake-ink-subtle">
              {question.helper}
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
            className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted disabled:cursor-default"
            style={{
              cursor: questionIndex > 0 ? "pointer" : "default",
              visibility: questionIndex > 0 ? "visible" : "hidden",
            }}
          >
            ← Terug
          </button>

          {question.kind === "single" ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => goNext(questionIndex)}
              className="min-h-[44px] rounded-[12px] bg-intake-sage px-6 py-3 text-sm font-semibold text-[#0f1c10] transition-all duration-200 hover:opacity-90"
            >
              Volgende →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function renderQuestionBody(q: NutritionQuestion) {
    if (q.kind === "slider") {
      const current = sliders[q.id] ?? q.defaultIndex;
      const axis = sliderAxisLabels(q.scale);
      return (
        <IntakeSlider
          labels={q.stops.map((stop) => stop.label)}
          value={current}
          onChange={(index) => setSliders((prev) => ({ ...prev, [q.id]: index }))}
          minLabel={axis.min}
          maxLabel={axis.max}
          ariaLabel={q.prompt}
        />
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
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {q.options.map((opt) => {
          const selected = preference === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setPreference(opt.value);
                goNext(questionIndex);
              }}
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

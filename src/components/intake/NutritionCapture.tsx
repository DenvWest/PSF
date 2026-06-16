"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { NUTRITION_LOG_CONSENT_TEXT } from "@/lib/consent-texts";
import type { IntakeEstimate, NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import { deltaStatementFor, type NutrientDelta } from "@/lib/nutrition-delta";
import ProteinTargetCard from "@/components/intake/ProteinTargetCard";
import { nutrientReferences } from "@/data/nutrition/intake-reference";

type Step =
  | { kind: "question"; index: number }
  | { kind: "consent" }
  | { kind: "result"; estimate: IntakeEstimate[]; statements: string[]; advice: NutritionAdviceItem[]; delta: NutrientDelta[] | null }
  | { kind: "error"; message: string };

type QuestionDef = {
  field: keyof NutritionSelfReport;
  question: string;
  options: { label: string; value: number }[];
};

const QUESTIONS: QuestionDef[] = [
  {
    field: "oilyFishPerWeek",
    question: "Hoe vaak eet je in een gewone week vette vis?",
    options: [
      { label: "Niet", value: 0 },
      { label: "1×", value: 1 },
      { label: "2×", value: 2 },
      { label: "3× of vaker", value: 3 },
    ],
  },
  {
    field: "proteinMealsPerDay",
    question: "Hoeveel eetmomenten zijn op een gewone dag eiwitrijk?",
    options: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3 of meer", value: 3 },
    ],
  },
  {
    field: "vegFruitPerDay",
    question: "Hoeveel porties bladgroenten, noten of peulvruchten eet je op een gewone dag?",
    options: [
      { label: "0–1 porties", value: 1 },
      { label: "2–3 porties", value: 2 },
      { label: "4–5 porties", value: 4 },
      { label: "5 of meer", value: 5 },
    ],
  },
  {
    field: "dairyServingsPerDay",
    question: "Hoeveel porties zuivel (melk, yoghurt, kaas) eet je op een gewone dag?",
    options: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3 of meer", value: 3 },
    ],
  },
  {
    field: "meatLegumesPerDay",
    question: "Hoeveel porties vlees, vis of peulvruchten eet je op een gewone dag?",
    options: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3 of meer", value: 3 },
    ],
  },
  {
    field: "sunExposurePerWeek",
    question: "Hoe vaak ben je in een gewone week ≥ 15 minuten buiten in daglicht?",
    options: [
      { label: "Zelden of nooit", value: 1 },
      { label: "2–3 keer", value: 3 },
      { label: "4–5 keer", value: 5 },
      { label: "Dagelijks", value: 7 },
    ],
  },
];

const TOTAL = QUESTIONS.length;

export default function NutritionCapture() {
  const [step, setStep] = useState<Step>({ kind: "question", index: 0 });
  const [answers, setAnswers] = useState<Partial<NutritionSelfReport>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { clarityTag("nutrition_flow", "started"); }, []);

  function handleAnswer(field: keyof NutritionSelfReport, value: number, index: number) {
    const next = { ...answers, [field]: value };
    setAnswers(next);
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

  async function handleSubmit() {
    if (!consentChecked || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake/nutrition-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ report: answers, consent: true }),
      });

      if (res.status === 401) {
        setStep({
          kind: "error",
          message: "401",
        });
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
      };

      clarityTag("nutrition_flow", "completed");
      setStep({
        kind: "result",
        estimate: data.estimate,
        statements: data.statements,
        advice: data.advice,
        delta: data.delta ?? null,
      });
    } catch {
      setStep({ kind: "error", message: "Er ging iets mis. Probeer het opnieuw." });
    } finally {
      setSubmitting(false);
    }
  }

  if (step.kind === "result") {
    const lifestyle = step.advice.filter(
      (a): a is Extract<NutritionAdviceItem, { kind: "lifestyle" }> =>
        a.kind === "lifestyle" && a.nutrient !== "protein",
    );
    const supplements = step.advice.filter(
      (a) => a.kind === "supplement" && a.nutrient !== "protein",
    );
    const visibleDeltas = step.delta
      ? step.delta.filter((d) => d.direction !== "unchanged")
      : null;

    const proteinIndex = step.estimate.findIndex((e) => e.nutrient === "protein");
    const proteinStatement =
      proteinIndex >= 0 ? step.statements[proteinIndex] : null;
    const proteinAdvice = step.advice.filter((a) => a.nutrient === "protein");
    const proteinLifestyle = proteinAdvice.find(
      (a): a is Extract<NutritionAdviceItem, { kind: "lifestyle" }> =>
        a.kind === "lifestyle",
    );
    const proteinSupplement = proteinAdvice.find(
      (a): a is Extract<NutritionAdviceItem, { kind: "supplement" }> =>
        a.kind === "supplement",
    );

    const otherEstimates = step.estimate
      .map((e, i) => ({
        nutrient: e.nutrient,
        band: e.band,
        statement: step.statements[i],
      }))
      .filter((e) => e.nutrient !== "protein");
    const otherGaps = otherEstimates.filter((e) => e.band === "below");
    const otherOnTrack = otherEstimates.filter((e) => e.band !== "below");

    const deltaImproved =
      visibleDeltas?.filter((d) => d.direction === "improved") ?? [];
    const deltaWorsened =
      visibleDeltas?.filter((d) => d.direction === "worsened") ?? [];

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12">
          <h1 className="mb-2 text-center font-serif text-3xl font-normal text-intake-ink">
            Jouw inname-overzicht
          </h1>
          <p className="mb-8 text-center text-sm text-intake-ink-subtle">
            Op basis van jouw antwoorden
          </p>

          {proteinStatement ? (
            <section
              aria-labelledby="protein-heading"
              className="mb-8 rounded-[14px] border border-intake-terra/30 bg-intake-terra/5 px-5 py-5"
            >
              <h2
                id="protein-heading"
                className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-intake-terra"
              >
                Eiwit — jouw belangrijkste bouwsteen
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-intake-ink">
                {proteinStatement}
              </p>

              <details className="group rounded-[12px] border border-intake-card-border bg-intake-bg-elevated/40">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
                  Bereken je precieze eiwitdoel
                </summary>
                <div className="border-t border-intake-divider px-2 pb-3 pt-2">
                  <ProteinTargetCard
                    proteinMealsYesterday={answers.proteinMealsPerDay}
                  />
                </div>
              </details>

              {proteinLifestyle ? (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-medium text-intake-ink-subtle">
                    De basis — voeding eerst
                  </p>
                  <p className="rounded-[12px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-sm leading-relaxed text-intake-ink">
                    {proteinLifestyle.text}
                  </p>
                </div>
              ) : null}

              {proteinSupplement ? (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-intake-ink-subtle">
                    Aanvulling — indien gewenst
                  </p>
                  <Link
                    href={proteinSupplement.comparisonPath}
                    className="block rounded-[12px] border border-intake-terra/30 bg-intake-terra/5 px-4 py-3 text-sm leading-relaxed text-intake-ink transition-colors hover:bg-intake-terra/10"
                  >
                    <span className="block font-medium text-intake-terra">
                      Vergelijk eiwitpoeder →
                    </span>
                    <span className="mt-1 block text-intake-ink-muted">
                      {proteinSupplement.claimText}
                    </span>
                  </Link>
                </div>
              ) : null}
            </section>
          ) : null}

          {(otherGaps.length > 0 || otherOnTrack.length > 0) && (
            <section aria-labelledby="statements-heading" className="mb-8">
              <h2
                id="statements-heading"
                className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle"
              >
                Overige nutriënten
              </h2>

              {otherGaps.length > 0 && (
                <ul className="mb-3 flex flex-col gap-3">
                  {otherGaps.map((e) => (
                    <li
                      key={e.nutrient}
                      className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink"
                    >
                      {e.statement}
                    </li>
                  ))}
                </ul>
              )}

              {otherOnTrack.length > 0 && (
                <details className="group rounded-[14px] border border-intake-card-border bg-intake-bg-elevated/40">
                  <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
                    {otherOnTrack.length} nutriënt{otherOnTrack.length === 1 ? "" : "en"} zit{otherOnTrack.length === 1 ? "" : "ten"} op orde ✓
                  </summary>
                  <ul className="flex flex-col gap-3 border-t border-intake-divider px-3 pb-3 pt-3">
                    {otherOnTrack.map((e) => (
                      <li
                        key={e.nutrient}
                        className="rounded-[12px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-sm leading-relaxed text-intake-ink-muted"
                      >
                        {e.statement}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </section>
          )}

          {visibleDeltas && visibleDeltas.length > 0 && (
            <section aria-labelledby="delta-heading" className="mb-8">
              <h2
                id="delta-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle"
              >
                Sinds je vorige check
              </h2>
              <details className="group rounded-[14px] border border-intake-sage/30 bg-intake-sage/10">
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-ink-muted [&::-webkit-details-marker]:hidden">
                  {[
                    deltaImproved.length > 0 ? `${deltaImproved.length} verbeterd` : null,
                    deltaWorsened.length > 0 ? `${deltaWorsened.length} terug` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </summary>
                <ul className="flex flex-col gap-3 border-t border-intake-divider px-3 pb-3 pt-3">
                  {visibleDeltas.map((d, i) => (
                    <li
                      key={i}
                      className="rounded-[12px] border border-intake-sage/30 bg-intake-sage/10 px-4 py-3 text-sm leading-relaxed text-intake-ink-muted"
                    >
                      {deltaStatementFor(d)}
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          )}

          {(lifestyle.length > 0 || supplements.length > 0) && (
            <section aria-labelledby="advice-heading">
              <h2
                id="advice-heading"
                className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle"
              >
                Advies
              </h2>

              {lifestyle.length > 0 && (
                <div className="mb-6">
                  <p className="mb-3 text-xs font-medium text-intake-ink-subtle">
                    De basis — leefstijl
                  </p>
                  <ul className="flex flex-col gap-3">
                    {lifestyle.map((item, i) => (
                      <li
                        key={i}
                        className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink"
                      >
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {supplements.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-medium text-intake-ink-subtle">
                    Aanvulling — indien gewenst
                  </p>
                  <ul className="flex flex-col gap-3">
                    {supplements.map((item, i) => {
                      if (item.kind !== "supplement") return null;
                      return (
                        <li key={i}>
                          <Link
                            href={item.comparisonPath}
                            className="block rounded-[14px] border border-intake-terra/30 bg-intake-terra/5 px-5 py-4 text-sm leading-relaxed text-intake-ink transition-colors hover:bg-intake-terra/10"
                          >
                            <span className="block font-medium text-intake-terra">
                              Vergelijk {nutrientReferences[item.nutrient].label} →
                            </span>
                            <span className="mt-1 block text-intake-ink-muted">
                              {item.claimText}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          )}

          <div className="mt-10 space-y-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-5 text-center">
            <p className="text-sm leading-relaxed text-intake-ink-muted">
              Wil je week voor week begeleid worden? Ontvang het voedings-stappenplan per e-mail.
            </p>
            <Link
              href="/gids/voeding"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-intake-terra px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
            >
              Ontvang je voedings-stappenplan →
            </Link>
            <p className="text-xs leading-relaxed text-intake-ink-subtle">
              Of{" "}
              <Link
                href="/intake"
                className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                doe de volledige Leefstijlcheck
              </Link>{" "}
              voor jouw volgorde over alle pijlers.
            </p>
          </div>
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
            onClick={() => {
              setStep({ kind: "question", index: 0 });
              setAnswers({});
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
          aria-valuenow={TOTAL}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
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
              className="min-h-[44px] rounded-[12px] border border-intake-card-border bg-transparent px-6 py-3 text-sm font-semibold text-intake-ink transition-all duration-200 hover:bg-intake-bg-elevated disabled:cursor-default disabled:opacity-30"
            >
              {submitting ? "Bezig…" : "Bekijk resultaten →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // question step
  const q = QUESTIONS[step.index];
  const progressPct = ((step.index + 1) / (TOTAL + 1)) * 100;
  const questionNumber = String(step.index + 1).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={step.index + 1}
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
          Vraag {step.index + 1} van {TOTAL}
        </p>

        <div className="min-h-[400px] animate-[fadeIn_200ms_ease-out]">
          <h2 className="mb-10 text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl">
            {q.question}
          </h2>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(q.field, opt.value, step.index)}
                className="block w-full min-h-[44px] rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-left text-base font-medium leading-snug text-intake-ink-muted transition-all duration-200 ease-out hover:border-intake-terra/40 hover:bg-intake-bg-elevated/90 hover:text-intake-ink"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="border-none bg-transparent py-3 text-sm text-intake-ink-subtle transition-colors hover:text-intake-ink-muted disabled:cursor-default"
            style={{
              cursor: step.index > 0 ? "pointer" : "default",
              visibility: step.index > 0 ? "visible" : "hidden",
            }}
          >
            ← Terug
          </button>

          <span />
        </div>
      </div>
    </div>
  );
}

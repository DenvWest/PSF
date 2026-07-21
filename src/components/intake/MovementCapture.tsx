"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_CHECKIN_CONSENT_TEXT } from "@/lib/consent-texts";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { MOVEMENT_QUESTIONS } from "@/data/movement-checkin";
import type {
  MovementDimensionResult,
  MovementSelfReport,
} from "@/lib/movement-assessment";
import type { MovementDirection } from "@/lib/movement-delta";

type MovementStart = {
  direction: MovementDirection;
  statement: string;
};

type Step =
  | { kind: "question"; index: number }
  | { kind: "consent" }
  | {
      kind: "result";
      assessment: MovementDimensionResult[];
      start: MovementStart | null;
      pulse?: boolean;
    }
  | { kind: "error"; message: string };

const TOTAL = MOVEMENT_QUESTIONS.length;
const PULSE_QUESTION_INDEX = MOVEMENT_QUESTIONS.findIndex((q) => q.field === "RCV_FEEL");

const DIMENSION_LABELS: Record<MovementDimensionResult["dimension"], string> = {
  kracht: "Kracht",
  conditie: "Cardio",
  intensiteit: "Intensieve inspanning",
  zitten: "Zitten",
  conditie_ervaren: "Ervaren conditie",
  herstel: "Herstel",
  klachten: "Klachten",
  mobiliteit: "Mobiliteit",
  belastbaarheid: "Belastbaarheid",
  consistentie: "Consistentie",
  motivatie: "Motivatie",
};

export default function MovementCapture() {
  const searchParams = useSearchParams();
  const isPulseMode = searchParams.get("mode") === "pulse";
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
  const originDomain =
    kompas && validKompas.has(kompas) ? (kompas as "beweging") : null;
  const dashboardReturnHref = buildDashboardVandaagHref(originDomain ?? "beweging");

  function returnToDashboard() {
    window.location.assign(dashboardReturnHref);
  }

  const pulseStartIndex = PULSE_QUESTION_INDEX >= 0 ? PULSE_QUESTION_INDEX : 0;

  const [step, setStep] = useState<Step>(() =>
    isPulseMode ? { kind: "question", index: pulseStartIndex } : { kind: "question", index: 0 },
  );
  const [answers, setAnswers] = useState<Partial<MovementSelfReport>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    clarityTag("movement_flow", isPulseMode ? "pulse_started" : "started");
  }, [isPulseMode]);

  function handleAnswer(field: keyof MovementSelfReport, value: number, index: number) {
    const next = { ...answers, [field]: value };
    setAnswers(next);
    if (isPulseMode) {
      setStep({ kind: "consent" });
      return;
    }
    if (index + 1 < MOVEMENT_QUESTIONS.length) {
      setStep({ kind: "question", index: index + 1 });
    } else {
      setStep({ kind: "consent" });
    }
  }

  function handleBack() {
    if (step.kind === "consent") {
      setStep({
        kind: "question",
        index: isPulseMode ? pulseStartIndex : MOVEMENT_QUESTIONS.length - 1,
      });
    } else if (step.kind === "question" && step.index > 0 && !isPulseMode) {
      setStep({ kind: "question", index: step.index - 1 });
    }
  }

  async function handleSubmit() {
    if (!consentChecked || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake/movement-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          report: answers,
          consent: true,
          ...(isPulseMode ? { mode: "pulse" } : {}),
        }),
      });

      if (res.status === 401) {
        setStep({ kind: "error", message: "401" });
        return;
      }

      if (!res.ok) {
        setStep({ kind: "error", message: "Opnieuw proberen" });
        return;
      }

      const data = (await res.json()) as {
        assessment: MovementDimensionResult[];
        start: MovementStart | null;
      };

      clarityTag("movement_flow", isPulseMode ? "pulse_completed" : "completed");
      setStep({
        kind: "result",
        assessment: data.assessment,
        start: data.start,
        pulse: isPulseMode,
      });
    } catch {
      setStep({ kind: "error", message: "Opnieuw proberen" });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleChoice(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  if (step.kind === "result") {
    const { assessment, start, pulse } = step;

    if (pulse) {
      const herstelResult = assessment.find((entry) => entry.dimension === "herstel");
      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center">
          <div className="w-full max-w-lg px-6 py-12 text-center">
            <h1 className="mb-2 font-serif text-3xl font-normal text-intake-ink">
              Check-in opgeslagen
            </h1>
            <p className="mb-6 text-sm text-intake-ink-subtle">
              Je herstel-signaal helpt ons vandaag een betere keuze voor te stellen.
            </p>
            {herstelResult ? (
              <div className="mb-8 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-left text-sm leading-relaxed text-intake-ink">
                {herstelResult.statement}
              </div>
            ) : null}
            {fromDashboard ? (
              <button
                type="button"
                onClick={returnToDashboard}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-intake-terra px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Terug naar beweging →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.location.assign("/dashboard?tab=vandaag&kompas=beweging");
                }}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-intake-terra px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Open dashboard →
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12">
          <h1 className="mb-2 text-center font-serif text-3xl font-normal text-intake-ink">
            Jouw beweeg-overzicht
          </h1>
          <p className="mb-8 text-center text-sm text-intake-ink-subtle">
            Op basis van wat je nu doet
          </p>

          {start && (
            <div className="mb-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10 px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-intake-sage">
                Sinds je start
              </p>
              {start.statement}
            </div>
          )}

          <div className="flex flex-col gap-8">
            {assessment.map((result) => (
              <section
                key={result.dimension}
                aria-labelledby={`movement-${result.dimension}-heading`}
              >
                <h2
                  id={`movement-${result.dimension}-heading`}
                  className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle"
                >
                  {DIMENSION_LABELS[result.dimension]}
                </h2>

                <div className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink">
                  {result.statement}
                </div>

                {result.choices.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-3 text-xs font-medium text-intake-ink-subtle">
                      Kies zelf je eerste stap — geen verkeerd antwoord, één is genoeg
                    </p>
                    <ul className="flex flex-col gap-3">
                      {result.choices.map((choice) => {
                        const key = `${result.dimension}:${choice}`;
                        const isSelected = selected.has(key);
                        return (
                          <li key={key}>
                            <button
                              type="button"
                              onClick={() => toggleChoice(key)}
                              className={`block w-full min-h-[44px] rounded-[14px] border px-5 py-4 text-left text-sm leading-relaxed transition-all duration-200 ${
                                isSelected
                                  ? "border-intake-sage/50 bg-intake-sage/15 text-intake-ink"
                                  : "border-intake-card-border bg-intake-bg-elevated text-intake-ink-muted hover:border-intake-sage/30 hover:bg-intake-sage/5"
                              }`}
                            >
                              {choice}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {result.deepen && (
                  <div className="mt-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated/60 px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
                    {result.deepen}
                  </div>
                )}

                {result.supplement && (
                  <div className="mt-4">
                    <Link
                      href={result.supplement.comparisonPath}
                      className="block rounded-[14px] border border-intake-terra/30 bg-intake-terra/5 px-5 py-4 text-sm leading-relaxed text-intake-ink transition-colors hover:bg-intake-terra/10"
                    >
                      <span className="block font-medium text-intake-terra">
                        Past creatine bij je kracht-keuze? Vergelijk →
                      </span>
                      <span className="mt-1 block text-intake-ink-muted">
                        {result.supplement.claimText}
                      </span>
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 space-y-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-5 text-center">
            <p className="text-sm leading-relaxed text-intake-ink-muted">
              Wil je week voor week begeleid worden? Ontvang het beweging-stappenplan per e-mail.
            </p>
            <Link
              href="/gids/beweging"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-intake-terra px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
            >
              Ontvang je beweging-stappenplan →
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
              Om je beweeg-check op te slaan, heb je eerst een Leefstijlcheck nodig.
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
              setStep(
                isPulseMode
                  ? { kind: "question", index: pulseStartIndex }
                  : { kind: "question", index: 0 },
              );
              setAnswers({});
              setConsentChecked(false);
              setSelected(new Set());
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
    const progressMax = isPulseMode ? 1 : TOTAL;
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={progressMax}
          aria-valuemin={1}
          aria-valuemax={progressMax}
          aria-label={isPulseMode ? "Voortgang herstel-check-in" : "Voortgang beweegcheck"}
        >
          <div className="h-full bg-intake-terra" style={{ width: "100%" }} />
        </div>

        <div className="w-full max-w-lg px-6 py-12">
          <h2 className="mb-6 text-center font-serif text-2xl font-normal text-intake-ink">
            {isPulseMode ? "Herstel-check veilig opslaan" : "Jouw gegevens veilig opslaan"}
          </h2>

          <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-intake-terra"
            />
            <span className="text-sm leading-relaxed text-intake-ink-muted">
              {DOMAIN_CHECKIN_CONSENT_TEXT.domain_checkin_logging}
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
              {submitting ? "Bezig…" : isPulseMode ? "Opslaan →" : "Bekijk resultaten →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = MOVEMENT_QUESTIONS[step.index];
  const progressTotal = isPulseMode ? 1 : TOTAL;
  const progressCurrent = isPulseMode ? 1 : step.index + 1;
  const progressPct = (progressCurrent / progressTotal) * 100;
  const questionNumber = String(progressCurrent).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={progressCurrent}
        aria-valuemin={1}
        aria-valuemax={progressTotal}
        aria-label={isPulseMode ? "Voortgang herstel-check-in" : "Voortgang beweegcheck"}
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
            {isPulseMode ? "Herstel-check" : "Beweging"}
          </p>
        </div>

        <p className="mb-8 text-center text-sm text-intake-ink-subtle">
          {isPulseMode
            ? "Eén vraag — ~15 seconden"
            : `Vraag ${step.index + 1} van ${TOTAL}`}
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
              cursor: !isPulseMode && step.index > 0 ? "pointer" : "default",
              visibility: !isPulseMode && step.index > 0 ? "visible" : "hidden",
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

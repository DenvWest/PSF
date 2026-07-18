"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_CHECKIN_CONSENT_TEXT } from "@/lib/consent-texts";
import { MOVEMENT_QUESTIONS, MOVEMENT_RECOVERY_QUESTION } from "@/data/movement-checkin";
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
  | { kind: "recovery" }
  | { kind: "consent" }
  | {
      kind: "result";
      assessment: MovementDimensionResult[];
      start: MovementStart | null;
    }
  | { kind: "error"; message: string };

const TOTAL = MOVEMENT_QUESTIONS.length + 1;

const DIMENSION_LABELS: Record<MovementDimensionResult["dimension"], string> = {
  kracht: "Kracht",
  conditie: "Conditie",
};

export default function MovementCapture() {
  const [step, setStep] = useState<Step>({ kind: "question", index: 0 });
  const [answers, setAnswers] = useState<Partial<MovementSelfReport>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    clarityTag("movement_flow", "started");
  }, []);

  function handleAnswer(field: keyof MovementSelfReport, value: number, index: number) {
    const next = { ...answers, [field]: value };
    setAnswers(next);
    if (index + 1 < MOVEMENT_QUESTIONS.length) {
      setStep({ kind: "question", index: index + 1 });
    } else {
      setStep({ kind: "recovery" });
    }
  }

  function handleRecoveryFeel(value: number) {
    setAnswers((prev) => ({ ...prev, RCV_FEEL: value }));
    setStep({ kind: "consent" });
  }

  function handleBack() {
    if (step.kind === "consent") {
      setStep({ kind: "recovery" });
    } else if (step.kind === "recovery") {
      setStep({ kind: "question", index: MOVEMENT_QUESTIONS.length - 1 });
    } else if (step.kind === "question" && step.index > 0) {
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
          report: {
            MOV_STR: answers.MOV_STR,
            MOV_CARD: answers.MOV_CARD,
            RCV_FEEL: answers.RCV_FEEL,
          },
          consent: true,
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

      clarityTag("movement_flow", "completed");
      setStep({ kind: "result", assessment: data.assessment, start: data.start });
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
    const { assessment, start } = step;

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
              setStep({ kind: "question", index: 0 });
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

  if (step.kind === "recovery") {
    const progressPct = (MOVEMENT_QUESTIONS.length / TOTAL) * 100;
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={MOVEMENT_QUESTIONS.length}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Voortgang beweegcheck"
        >
          <div
            className="h-full bg-intake-terra transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="w-full max-w-lg px-6 py-12">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
            Herstel · Beweging
          </p>
          <h2 className="mb-10 text-center font-serif text-2xl font-normal leading-snug text-intake-ink md:text-3xl">
            {MOVEMENT_RECOVERY_QUESTION.question}
          </h2>
          <div className="flex flex-col gap-3">
            {MOVEMENT_RECOVERY_QUESTION.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRecoveryFeel(opt.value)}
                className="block w-full min-h-[44px] rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-left text-base font-medium leading-snug text-intake-ink-muted transition-all duration-200 ease-out hover:border-intake-terra/40 hover:bg-intake-bg-elevated/90 hover:text-intake-ink"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-10">
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

  if (step.kind === "consent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={TOTAL}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Voortgang beweegcheck"
        >
          <div className="h-full bg-intake-terra" style={{ width: "100%" }} />
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
              {submitting ? "Bezig…" : "Bekijk resultaten →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = MOVEMENT_QUESTIONS[step.index];
  const progressPct = ((step.index + 1) / TOTAL) * 100;
  const questionNumber = String(step.index + 1).padStart(2, "0");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
        role="progressbar"
        aria-valuenow={step.index + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL}
        aria-label="Voortgang beweegcheck"
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
            Beweging
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { MOVEMENT_QUESTIONS } from "@/data/movement-checkin";
import {
  assessMovement,
  type MovementDimensionResult,
  type MovementSelfReport,
} from "@/lib/movement-assessment";

type Step =
  | { kind: "question"; index: number }
  | { kind: "result"; results: MovementDimensionResult[] };

const TOTAL = MOVEMENT_QUESTIONS.length;

const DIMENSION_LABELS: Record<MovementDimensionResult["dimension"], string> = {
  kracht: "Kracht",
  conditie: "Conditie",
};

export default function MovementCapture() {
  const [step, setStep] = useState<Step>({ kind: "question", index: 0 });
  const [answers, setAnswers] = useState<Partial<MovementSelfReport>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    clarityTag("movement_flow", "started");
  }, []);

  function handleAnswer(field: keyof MovementSelfReport, value: number, index: number) {
    const next = { ...answers, [field]: value };
    setAnswers(next);
    if (index + 1 < TOTAL) {
      setStep({ kind: "question", index: index + 1 });
    } else {
      clarityTag("movement_flow", "completed");
      setStep({ kind: "result", results: assessMovement(next) });
    }
  }

  function handleBack() {
    if (step.kind === "question" && step.index > 0) {
      setStep({ kind: "question", index: step.index - 1 });
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
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <Link
          href="/"
          className="fixed right-4 top-4 z-50 px-2 py-1 text-lg leading-none text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
          aria-label="Sluiten"
        >
          ✕
        </Link>

        <div className="w-full max-w-lg px-6 py-12">
          <h1 className="mb-2 text-center font-serif text-3xl font-normal text-intake-ink">
            Jouw beweeg-overzicht
          </h1>
          <p className="mb-8 text-center text-sm text-intake-ink-subtle">
            Op basis van wat je nu doet
          </p>

          <div className="flex flex-col gap-8">
            {step.results.map((result) => (
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

      <Link
        href="/"
        className="fixed right-4 top-4 z-50 px-2 py-1 text-lg leading-none text-intake-ink-subtle no-underline transition-colors hover:text-intake-ink"
        aria-label="Sluiten"
      >
        ✕
      </Link>

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

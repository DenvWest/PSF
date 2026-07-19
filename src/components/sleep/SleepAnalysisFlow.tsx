"use client";

import { useState } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { SLEEP_QUESTIONS } from "@/data/sleep-checkin";
import { assessSleep, buildSleepConclusion } from "@/lib/sleep-assessment";
import { trackEvent } from "@/lib/ga4";
import { emitGuideSleepAnalysisEvent } from "@/lib/guide-sleep-analysis-events";
import SleepDashboardCta from "@/components/sleep/SleepDashboardCta";
import type { SleepBand } from "@/data/sleep-checkin";
import type { SleepConclusion } from "@/lib/sleep-assessment";

type SleepReport = {
  SLP_ONSET?: number;
  SLP_WAKE?: number;
  SLP_CONS?: number;
  SLP_QUAL?: number;
};

type RecognitionPatternId =
  | "long_awake_active_head"
  | "night_waking_substances"
  | "early_waking"
  | "long_sleep_unrested";

type RecognitionPattern = {
  id: RecognitionPatternId;
  label: string;
};

const RECOGNITION_PATTERNS: RecognitionPattern[] = [
  {
    id: "long_awake_active_head",
    label: "Je ligt vaak lang wakker, je hoofd blijft actief en je ritme wisselt.",
  },
  {
    id: "night_waking_substances",
    label:
      "Je wordt 's nachts vaak wakker en merkt dat alcohol of cafeïne dit erger maakt.",
  },
  {
    id: "early_waking",
    label: "Je wordt vroeg (rond 4:30–5:30) wakker en valt niet meer in slaap.",
  },
  {
    id: "long_sleep_unrested",
    label: "Je slaapt vaak lang, maar wordt niet uitgerust wakker.",
  },
];

type Step =
  | { kind: "recognition" }
  | { kind: "question"; index: number }
  | { kind: "result"; conclusion: SleepConclusion; assessmentBands: { label: string; band: SleepBand }[] };

const BAND_LABELS: Record<SleepBand, string> = {
  aandacht: "Aandacht",
  redelijk: "Redelijk",
  sterk: "Sterk",
};

export default function SleepAnalysisFlow({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "recognition" });
  const [answers, setAnswers] = useState<SleepReport>({});
  const [selectedPatterns, setSelectedPatterns] = useState<Set<RecognitionPatternId>>(
    new Set(),
  );
  const [reflectionNote, setReflectionNote] = useState("");

  function togglePattern(id: RecognitionPatternId) {
    setSelectedPatterns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleRecognitionContinue() {
    const patternIds = [...selectedPatterns];
    const hasReflectionNote = reflectionNote.trim().length > 0;

    emitGuideSleepAnalysisEvent("guide.sleep_analysis.started", {
      surface: "gids_slaap",
      recognition_patterns: patternIds.join(","),
      has_reflection_note: hasReflectionNote,
    });
    trackEvent("guide_sleep_recognition_completed", {
      surface: "gids_slaap",
      patterns: patternIds.join(","),
      has_note: hasReflectionNote,
    });
    clarityTag("guide_sleep_recognition", patternIds.length > 0 ? "selected" : "skipped");

    setStep({ kind: "question", index: 0 });
  }

  function handleAnswer(field: keyof SleepReport, value: number, index: number) {
    const next = { ...answers, [field]: value };
    setAnswers(next);
    if (index + 1 < SLEEP_QUESTIONS.length) {
      setStep({ kind: "question", index: index + 1 });
      return;
    }

    const assessment = assessSleep(next);
    const conclusion = buildSleepConclusion(assessment);
    emitGuideSleepAnalysisEvent("guide.sleep_analysis.completed", {
      surface: "gids_slaap",
      focus_pillar: conclusion.focusDimension ?? "maintenance",
    });
    clarityTag("guide_sleep_analysis", "completed");
    trackEvent("guide_sleep_analysis_completed", {
      surface: "gids_slaap",
      focus_pillar: conclusion.focusDimension ?? "maintenance",
    });
    setStep({
      kind: "result",
      conclusion,
      assessmentBands: assessment.statuses.map((status) => ({
        label: status.label,
        band: status.band,
      })),
    });
  }

  function handleBack() {
    if (step.kind === "question" && step.index > 0) {
      setStep({ kind: "question", index: step.index - 1 });
      return;
    }
    if (step.kind === "question" && step.index === 0) {
      setStep({ kind: "recognition" });
    }
  }

  if (step.kind === "recognition") {
    const HeadingTag = embedded ? "h2" : "h1";
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div className={`w-full max-w-lg ${embedded ? "px-0 py-6" : "px-6 py-12"}`}>
          {!embedded ? (
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              Slaapgids · 3 min
            </p>
          ) : null}
          <HeadingTag
            className={`text-center font-serif font-normal text-stone-900 ${
              embedded ? "text-2xl md:text-3xl" : "mt-4 text-3xl"
            }`}
          >
            Waar zou je kunnen beginnen?
          </HeadingTag>
          <p className="mt-4 text-center text-sm leading-relaxed text-stone-600">
            Herken je (een deel van) een van deze patronen? Kies wat past — meerdere mag, en er
            is geen goed of fout antwoord.
          </p>

          <ul className="mt-8 flex flex-col gap-3" aria-label="Herkenbare slaappatronen">
            {RECOGNITION_PATTERNS.map((pattern) => {
              const isSelected = selectedPatterns.has(pattern.id);
              return (
                <li key={pattern.id}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => togglePattern(pattern.id)}
                    className={`block w-full min-h-[44px] rounded-xl border px-5 py-4 text-left text-sm leading-relaxed transition-all duration-200 ${
                      isSelected
                        ? "border-ps-green/50 bg-ps-green/10 text-stone-900"
                        : "border-stone-200 bg-white text-stone-700 hover:border-ps-green/30 hover:bg-stone-50"
                    }`}
                  >
                    {pattern.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <label
              htmlFor="sleep-reflection-note"
              className="mb-2 block text-sm font-medium text-stone-900"
            >
              Herken je jezelf hier niet in, of wil je het anders omschrijven? (optioneel)
            </label>
            <textarea
              id="sleep-reflection-note"
              value={reflectionNote}
              onChange={(event) => setReflectionNote(event.target.value)}
              rows={3}
              placeholder="Bijv. mijn slaap wisselt per week…"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700 placeholder:text-stone-400 focus:border-ps-green/40 focus:outline-none focus:ring-2 focus:ring-ps-green/20"
            />
            <p className="mt-2 text-xs text-stone-500">
              Dit blijft alleen op je scherm — we slaan dit niet op.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRecognitionContinue}
            className="mt-8 block w-full min-h-[48px] rounded-xl bg-ps-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ps-green/90"
          >
            Verder naar de 4 vragen →
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "result") {
    const { conclusion, assessmentBands } = step;
    const ResultHeadingTag = embedded ? "h2" : "h1";
    const resultShellClass = embedded
      ? "relative flex flex-col items-center justify-center"
      : "relative flex min-h-[70vh] flex-col items-center justify-center";
    const resultPadClass = embedded ? "w-full max-w-lg px-0 py-6" : "w-full max-w-lg px-6 py-12";

    return (
      <div className={resultShellClass}>
        <div className={resultPadClass}>
          <ResultHeadingTag
            className={`mb-2 text-center font-serif font-normal text-stone-900 ${
              embedded ? "text-2xl md:text-3xl" : "text-3xl"
            }`}
          >
            Jouw slaapinzicht
          </ResultHeadingTag>
          <p className="mb-8 text-center text-sm text-stone-500">
            Op basis van je antwoorden
          </p>

          <section className="mb-8 rounded-2xl border border-ps-green/20 bg-ps-green/5 px-5 py-5">
            <h2 className="font-serif text-xl font-normal text-stone-900">{conclusion.headline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{conclusion.statement}</p>
            {conclusion.secondaryHint ? (
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {conclusion.secondaryHint}
              </p>
            ) : null}
          </section>

          <section className="mb-8" aria-labelledby="sleep-analysis-actions-heading">
            <h2 id="sleep-analysis-actions-heading" className="mb-3 text-sm font-medium text-stone-900">
              Jouw volgende 3 acties
            </h2>
            <ol className="flex list-decimal flex-col gap-3 pl-5">
              {conclusion.actions.map((action) => (
                <li
                  key={action}
                  className="rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm leading-relaxed text-stone-600 marker:font-semibold marker:text-ps-green"
                >
                  {action}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-stone-600">
              Wil je stappen afvinken?{" "}
              <Link href="/intake/plan/sleep" className="font-semibold text-ps-green hover:underline">
                Open je slaapplan →
              </Link>
            </p>
          </section>

          <section aria-labelledby="sleep-analysis-status-heading">
            <h2
              id="sleep-analysis-status-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400"
            >
              Hoe je nu slaapt
            </h2>
            <div className="flex flex-wrap gap-2">
              {assessmentBands.map((status) => (
                <span
                  key={status.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600"
                >
                  <span className="font-medium text-stone-900">{status.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{BAND_LABELS[status.band]}</span>
                </span>
              ))}
            </div>
          </section>

          <p className="mt-8 text-sm leading-relaxed text-stone-600">
            Dit is een eerste inzicht, geen uitslag — de komende weken ontdek je wat voor jou werkt.
          </p>

          <div className="mt-4 [&_section]:border-stone-200 [&_section]:bg-stone-50 [&_h2]:text-stone-900 [&_p]:text-stone-600 [&_li]:text-stone-600">
            <SleepDashboardCta
              focusLabel={conclusion.focusLabel}
              focusDimension={conclusion.focusDimension}
              source="sleep_analysis"
              eventMode="guide"
            />
          </div>
          <p className="mt-6 text-sm text-stone-600">
            Wil je dieper meten?{" "}
            <Link href="/intake/slaap" className="font-semibold text-ps-green hover:underline">
              Doe de volledige slaap-check →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const q = SLEEP_QUESTIONS[step.index];
  const progressPct = ((step.index + 1) / SLEEP_QUESTIONS.length) * 100;
  const questionShellClass = embedded
    ? "relative flex flex-col items-center justify-center overflow-hidden"
    : "relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden";
  const questionPadClass = embedded ? "w-full max-w-lg px-0 py-6" : "w-full max-w-lg px-6 py-12";

  return (
    <div className={questionShellClass}>
      <div
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-stone-200"
        role="progressbar"
        aria-valuenow={step.index + 1}
        aria-valuemin={1}
        aria-valuemax={SLEEP_QUESTIONS.length}
        aria-label="Voortgang slaapanalyse"
      >
        <div
          className="h-full bg-ps-green transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className={questionPadClass}>
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Vraag {step.index + 1} van {SLEEP_QUESTIONS.length}
        </p>
        <h2 className="mb-10 text-center font-serif text-2xl font-normal leading-snug text-stone-900 md:text-3xl">
          {q.question}
        </h2>
        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(q.field, opt.value, step.index)}
              className="block w-full min-h-[44px] rounded-xl border border-stone-200 bg-white px-5 py-4 text-left text-base font-medium leading-snug text-stone-700 transition-all hover:border-ps-green/40 hover:bg-stone-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-10">
          <button
            type="button"
            onClick={handleBack}
            className="border-none bg-transparent py-3 text-sm text-stone-500 transition-colors hover:text-stone-700"
          >
            ← Terug
          </button>
        </div>
      </div>
    </div>
  );
}

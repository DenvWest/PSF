"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_CHECKIN_CONSENT_TEXT } from "@/lib/consent-texts";
import {
  SLEEP_QUESTIONS,
  SLEEP_CONTEXT_QUESTIONS,
  SLEEP_DUUR_QUESTION,
  SLEEP_REGIE_QUESTION,
  type SleepBand,
} from "@/data/sleep-checkin";
import type { SleepAssessment, SleepConclusion } from "@/lib/sleep-assessment";
import type { SleepDirection } from "@/lib/sleep-delta";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import SleepDashboardCta from "@/components/sleep/SleepDashboardCta";

type SleepReport = {
  SLP_ONSET?: number;
  SLP_WAKE?: number;
  SLP_CONS?: number;
  SLP_QUAL?: number;
  duur?: number;
  grip?: number;
  winddown?: number;
  nightload?: number;
  morninglight?: number;
  sleepconfidence?: number;
};

type SleepStart = {
  direction: SleepDirection;
  statement: string;
};

type SleepRegie = {
  grip: number;
  reflection: string;
};

type Step =
  | { kind: "question"; index: number }
  | { kind: "consent" }
  | {
      kind: "result";
      assessment: SleepAssessment;
      conclusion: SleepConclusion;
      checkinId: string | null;
      start: SleepStart | null;
      regie: SleepRegie | null;
    }
  | { kind: "error"; message: string };

type QuestionDef = {
  field: keyof SleepReport;
  question: string;
  options: { label: string; value: number }[];
};

const ALL_QUESTIONS: QuestionDef[] = [
  ...SLEEP_QUESTIONS,
  SLEEP_DUUR_QUESTION,
  SLEEP_REGIE_QUESTION,
  ...SLEEP_CONTEXT_QUESTIONS,
];

const TOTAL = ALL_QUESTIONS.length;

const BAND_LABELS: Record<SleepBand, string> = {
  aandacht: "Aandacht",
  redelijk: "Redelijk",
  sterk: "Sterk",
};

export default function SleepCheckin() {
  const [step, setStep] = useState<Step>({ kind: "question", index: 0 });
  const [answers, setAnswers] = useState<SleepReport>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checkinId, setCheckinId] = useState<string | null>(null);

  useEffect(() => {
    clarityTag("sleep_flow", "started");
  }, []);

  function handleAnswer(field: keyof SleepReport, value: number, index: number) {
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
      const res = await fetch("/api/intake/sleep-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          report: {
            SLP_ONSET: answers.SLP_ONSET,
            SLP_WAKE: answers.SLP_WAKE,
            SLP_CONS: answers.SLP_CONS,
            SLP_QUAL: answers.SLP_QUAL,
            duur: answers.duur,
            grip: answers.grip,
            winddown: answers.winddown,
            nightload: answers.nightload,
            morninglight: answers.morninglight,
            sleepconfidence: answers.sleepconfidence,
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
        checkinId: string | null;
        assessment: SleepAssessment;
        conclusion: SleepConclusion;
        start: SleepStart | null;
        regie: SleepRegie | null;
      };

      clarityTag("sleep_flow", "completed");
      trackEvent("sleep_checkin_completed", { surface: "intake_slaap" });
      setCheckinId(data.checkinId);
      setStep({
        kind: "result",
        assessment: data.assessment,
        conclusion: data.conclusion,
        checkinId: data.checkinId,
        start: data.start,
        regie: data.regie,
      });
    } catch {
      setStep({ kind: "error", message: "Opnieuw proberen" });
    } finally {
      setSubmitting(false);
    }
  }

  async function persistChosenActions(nextSelected: Set<string>) {
    if (!checkinId || nextSelected.size === 0) {
      return;
    }
    const chosenActions = [...nextSelected].map((key) => key.split(":").slice(1).join(":"));
    try {
      await fetch("/api/intake/sleep-checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          checkin_id: checkinId,
          chosen_actions: chosenActions,
        }),
      });
    } catch {
      /* non-blocking */
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
      void persistChosenActions(next);
      return next;
    });
  }

  if (step.kind === "result") {
    const { assessment, conclusion, start, regie } = step;
    const focus = assessment.focus;
    const contextHints: string[] = [];
    if ((answers.nightload ?? 4) <= 2) {
      contextHints.push("Je hoofd blijft 's avonds nog actief. Een korte afronding vóór bed helpt je zenuwstelsel zakken.");
    }
    if ((answers.morninglight ?? 4) <= 2) {
      contextHints.push("Je ritme mist ochtendankers. Daglicht in de ochtend maakt inslapen later op de dag makkelijker.");
    }
    if ((answers.winddown ?? 4) <= 2) {
      contextHints.push("Je avond schakelt laat terug. Een vaste afbouwvolgorde van 20-30 minuten maakt verschil.");
    }
    if ((answers.sleepconfidence ?? 4) <= 2) {
      contextHints.push("Twijfel is logisch. Focus op 1 kleine stap voor 3 avonden achter elkaar in plaats van alles tegelijk.");
    }

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12">
          <h1 className="mb-2 text-center font-serif text-3xl font-normal text-intake-ink">
            Jouw slaap-overzicht
          </h1>
          <p className="mb-8 text-center text-sm text-intake-ink-subtle">
            Op basis van hoe je nu slaapt
          </p>

          <section
            className="mb-8 rounded-[14px] border border-intake-terra/30 bg-intake-terra/5 px-5 py-5"
            aria-labelledby="sleep-conclusion-heading"
          >
            <h2
              id="sleep-conclusion-heading"
              className="font-serif text-xl font-normal text-intake-ink"
            >
              {conclusion.headline}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-intake-ink-muted">
              {conclusion.statement}
            </p>
            {conclusion.secondaryHint ? (
              <p className="mt-3 text-sm leading-relaxed text-intake-ink-muted">
                {conclusion.secondaryHint}
              </p>
            ) : null}
          </section>

          <section className="mb-8" aria-labelledby="sleep-actions-heading">
            <h2
              id="sleep-actions-heading"
              className="mb-3 text-sm font-medium text-intake-ink"
            >
              Jouw volgende 3 acties
            </h2>
            <ol className="flex list-decimal flex-col gap-3 pl-5">
              {conclusion.actions.map((action) => (
                <li
                  key={action}
                  className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink-muted marker:font-semibold marker:text-intake-terra"
                >
                  {action}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-intake-ink-muted">
              Wil je stappen afvinken?{" "}
              <Link
                href="/intake/plan/sleep"
                onClick={() => {
                  trackEvent("sleep_plan_link_click", { surface: "intake_slaap" });
                  emitIntakeClientEvent("plan.action_clicked", {
                    domain: "sleep",
                    source: "sleep_checkin",
                  });
                }}
                className="font-semibold text-intake-sage hover:underline"
              >
                Open je slaapplan →
              </Link>
            </p>
          </section>

          {start && (
            <div className="mb-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10 px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-intake-sage">
                Sinds je start
              </p>
              {start.statement}
            </div>
          )}

          {focus ? (
            <section className="mb-8" aria-labelledby="sleep-focus-heading">
              <h2
                id="sleep-focus-heading"
                className="mb-3 text-sm font-medium text-intake-ink"
              >
                Je grootste winst zit nu in {focus.label.toLowerCase()}
              </h2>

              <div className="rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink">
                {focus.statement}
              </div>

              <div className="mt-4">
                <p className="mb-3 text-xs font-medium text-intake-ink-subtle">
                  Kies zelf je eerste stap — geen verkeerd antwoord, één is genoeg
                </p>
                <ul className="flex flex-col gap-3">
                  {focus.choices.map((choice) => {
                    const key = `${focus.dimension}:${choice}`;
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

              <div className="mt-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated/60 px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
                {focus.deepen}
              </div>

              {focus.supplement && (
                <div className="mt-4">
                  <Link
                    href={focus.supplement.comparisonPath}
                    className="block rounded-[14px] border border-intake-terra/30 bg-intake-terra/5 px-5 py-4 text-sm leading-relaxed text-intake-ink transition-colors hover:bg-intake-terra/10"
                  >
                    <span className="block font-medium text-intake-terra">
                      Past magnesium glycinaat bij je avondroutine? Vergelijk →
                    </span>
                    <span className="mt-1 block text-intake-ink-muted">
                      {focus.supplement.claimText}
                    </span>
                  </Link>
                </div>
              )}
            </section>
          ) : (
            <p className="mb-8 text-center text-sm leading-relaxed text-intake-ink-muted">
              Je slaap staat er goed voor — houd vast wat voor jou werkt.
            </p>
          )}

          <section aria-labelledby="sleep-status-heading">
            <h2
              id="sleep-status-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle"
            >
              Hoe je nu slaapt
            </h2>
            <div className="flex flex-wrap gap-2">
              {assessment.statuses.map((status) => (
                <span
                  key={status.dimension}
                  className="inline-flex items-center gap-1.5 rounded-full border border-intake-card-border bg-intake-bg-elevated px-3 py-1.5 text-xs text-intake-ink-muted"
                >
                  <span className="font-medium text-intake-ink">{status.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{BAND_LABELS[status.band]}</span>
                </span>
              ))}
            </div>
          </section>

          {regie && (
            <div className="mt-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10 px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
              {regie.reflection}
            </div>
          )}

          {contextHints.length > 0 && (
            <div className="mt-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
                Ritme &amp; herstel
              </p>
              <ul className="list-disc space-y-2 pl-5">
                {contextHints.slice(0, 2).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          <SleepDashboardCta
            focusLabel={conclusion.focusLabel}
            focusDimension={conclusion.focusDimension}
            source="sleep_checkin"
          />
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
              Om je slaap-check op te slaan, heb je eerst een Leefstijlcheck nodig.
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

  if (step.kind === "consent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div
          className="fixed inset-x-0 top-0 z-50 h-[3px] bg-intake-divider"
          role="progressbar"
          aria-valuenow={TOTAL}
          aria-valuemin={1}
          aria-valuemax={TOTAL}
          aria-label="Voortgang slaap-check"
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

  const q = ALL_QUESTIONS[step.index];
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
        aria-label="Voortgang slaap-check"
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
            Slaap
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

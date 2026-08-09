"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import IntakeInBoxExit from "@/components/intake/IntakeInBoxExit";
import MovementCheckinReadout from "@/components/intake/MovementCheckinReadout";
import MovementFactReadout from "@/components/intake/MovementFactReadout";
import MovementFollowupStrip from "@/components/intake/MovementFollowupStrip";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_CHECKIN_CONSENT_TEXT } from "@/lib/consent-texts";
import {
  buildDashboardVandaagHref,
  buildDashboardVoortgangHref,
  buildMovementRoutingHref,
} from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import {
  MOVEMENT_QUESTIONS,
  MOVEMENT_HELP_NO_NORM,
  MOVEMENT_HELP_TRIGGER,
} from "@/data/movement-checkin";
import { resolveMovementRoutingHint } from "@/lib/movement-assessment";
import type {
  MovementCheckinSnapshot,
  MovementConclusion,
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
      pulse: true;
      assessment: MovementDimensionResult[];
      start: MovementStart | null;
    }
  | {
      kind: "result";
      pulse: false;
      assessment: MovementDimensionResult[];
      conclusion: MovementConclusion;
      snapshot: MovementCheckinSnapshot;
      start: MovementStart | null;
    }
  | { kind: "error"; message: string };

const TOTAL = MOVEMENT_QUESTIONS.length;
const PULSE_QUESTION_INDEX = MOVEMENT_QUESTIONS.findIndex((q) => q.field === "RCV_FEEL");

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
    // Volledige page-load na de check-in-mutatie, zodat het dashboard geen
    // verouderde RSC-cache toont — een soft navigate zou de net geschreven staat kunnen missen.
    window.location.assign(dashboardReturnHref);
  }

  const pulseStartIndex = PULSE_QUESTION_INDEX >= 0 ? PULSE_QUESTION_INDEX : 0;

  const [step, setStep] = useState<Step>(() =>
    isPulseMode ? { kind: "question", index: pulseStartIndex } : { kind: "question", index: 0 },
  );
  const [answers, setAnswers] = useState<Partial<MovementSelfReport>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpOpenedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    clarityTag("movement_flow", isPulseMode ? "pulse_started" : "started");
  }, [isPulseMode]);

  useEffect(() => {
    if (step.kind === "question") {
      setHelpOpen(false);
    }
  }, [step]);

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
        conclusion?: MovementConclusion;
        snapshot?: MovementCheckinSnapshot;
        isRecheck?: boolean;
        start: MovementStart | null;
      };

      clarityTag("movement_flow", isPulseMode ? "pulse_completed" : "completed");

      if (isPulseMode) {
        setStep({
          kind: "result",
          pulse: true,
          assessment: data.assessment,
          start: data.start,
        });
        return;
      }

      const conclusion = data.conclusion;
      const snapshot = data.snapshot;
      if (!conclusion || !snapshot) {
        setStep({ kind: "error", message: "Opnieuw proberen" });
        return;
      }

      trackEvent("movement_checkin_completed", {
        surface: "intake_beweging",
        focus_dimension: conclusion.focusDimension ?? "geen",
        has_dimension_delta: snapshot.focusDelta !== null,
        is_recheck: data.isRecheck === true,
        strip_variant: snapshot.stripVariant,
      });
      setStep({
        kind: "result",
        pulse: false,
        assessment: data.assessment,
        conclusion,
        snapshot,
        start: data.start,
      });
    } catch {
      setStep({ kind: "error", message: "Opnieuw proberen" });
    } finally {
      setSubmitting(false);
    }
  }

  if (step.kind === "result") {
    if (step.pulse) {
      const herstelResult = step.assessment.find((entry) => entry.dimension === "herstel");
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
                  // Zelfde reden als returnToDashboard(): volledige page-load na de mutatie.
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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

    const { snapshot, start } = step;
    const startLine = start ? `Sinds je start: ${start.statement}` : null;
    const programHref = buildMovementRoutingHref(snapshot.focusDimension);
    const voortgangHref = buildDashboardVoortgangHref("domein", null, "beweging");

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-lg px-6 py-12">
          <h1 className="mb-2 text-center font-serif text-3xl font-normal text-intake-ink">
            Jouw beweegcheck
          </h1>
          <p className="mb-8 text-center text-sm text-intake-ink-subtle">
            Wat je antwoorden laten zien · gemeten vandaag
          </p>

          <MovementCheckinReadout
            headline={snapshot.headline}
            focusLabel={snapshot.focusLabel}
            answerLabel={snapshot.answerLabel}
            statement={snapshot.focusStatement}
            delta={snapshot.focusDelta}
            implicationLine={snapshot.implicationLine}
            programPreview={null}
            routingHref={programHref}
            routingHint={resolveMovementRoutingHint(snapshot.focusDimension)}
            startLine={startLine}
            variant="checkin"
          />

          <MovementFactReadout
            rows={snapshot.factRows}
            focusDimension={snapshot.focusDimension}
            surface="intake_beweging"
          />

          {snapshot.moderatorHints.length > 0 ? (
            <div className="mt-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink-muted">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
                Herstel &amp; klachten
              </p>
              <ul className="list-disc space-y-2 pl-5">
                {snapshot.moderatorHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <MovementFollowupStrip
            variant={snapshot.stripVariant}
            programHref={programHref}
            voortgangHref={voortgangHref}
            mijnDagHref={fromDashboard ? dashboardReturnHref : null}
          />

          <div className="mt-10 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-5 text-center">
            <p className="text-sm leading-relaxed text-intake-ink-muted">
              Wil je week voor week begeleid worden? Ontvang de beweeggids per e-mail.
            </p>
            <Link
              href="/gids/beweging"
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-intake-card-border bg-transparent px-6 py-3.5 text-sm font-semibold text-intake-ink no-underline transition-colors hover:bg-intake-bg-elevated"
            >
              Ontvang de beweeggids →
            </Link>
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

        <div className="relative w-full max-w-lg px-6 py-12">
          <IntakeInBoxExit className="absolute right-6 top-0" />
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

      <div className="relative w-full max-w-lg px-6 py-12">
        <IntakeInBoxExit className="absolute right-6 top-0" />
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

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                const next = !helpOpen;
                setHelpOpen(next);
                if (next && !helpOpenedRef.current.has(q.field)) {
                  helpOpenedRef.current.add(q.field);
                  trackEvent("movement_checkin_question_help_opened", { field: q.field });
                }
              }}
              aria-expanded={helpOpen}
              aria-controls={`movement-help-${q.field}`}
              className="min-h-[44px] border-none bg-transparent px-0 text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
            >
              {MOVEMENT_HELP_TRIGGER}
            </button>
            {helpOpen ? (
              <div
                id={`movement-help-${q.field}`}
                role="region"
                className="mt-3 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated px-5 py-4 text-sm leading-relaxed text-intake-ink-muted"
              >
                <p className="mb-2 font-semibold text-intake-ink">{q.help.title}</p>
                <p>{q.help.body}</p>
                <p className="mt-2 text-xs text-intake-ink-subtle">
                  {q.help.anchor ?? MOVEMENT_HELP_NO_NORM}
                </p>
              </div>
            ) : null}
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

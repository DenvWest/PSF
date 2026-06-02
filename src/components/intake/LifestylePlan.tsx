"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  buildPlanIntakeContext,
  isPhaseComplete,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import type { DomainScores } from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type {
  LifestylePlanTemplate,
  PlanProgress,
  PlanStep,
  PlanStepLink,
  PlanStepState,
} from "@/types/lifestyle-plan";

type LifestylePlanProps = {
  template: LifestylePlanTemplate;
  scores: DomainScores;
  answers: Record<string, number>;
  sessionId: string | null;
  secondaryTheme?: MeasuredPillarId | null;
};

const HORIZON_LABELS = {
  "deze-week": "Deze week",
  "week-2-4": "Week 2–4",
  "week-4-12": "Week 4–12",
} as const;

function getStepState(
  progress: PlanProgress | null,
  stepId: string,
): PlanStepState {
  const state = progress?.steps[stepId]?.state;
  if (
    state === "todo" ||
    state === "doing" ||
    state === "done" ||
    state === "skipped"
  ) {
    return state;
  }
  return "todo";
}

function getActivePhaseIndex(
  template: LifestylePlanTemplate,
  ctx: ReturnType<typeof buildPlanIntakeContext>,
  progress: PlanProgress | null,
): number {
  for (let index = 0; index < template.phases.length; index += 1) {
    const phase = template.phases[index];
    const stepsRecord = progress?.steps ?? {};
    if (!isPhaseComplete(phase, ctx, stepsRecord)) {
      return index;
    }
  }
  return Math.max(template.phases.length - 1, 0);
}

function getLinkRel(kind: PlanStepLink["kind"]): string {
  if (kind === "comparison") {
    return "nofollow sponsored";
  }
  return "noopener noreferrer";
}

function PlanStepLinkAnchor({
  link,
  onLinkClick,
}: {
  link: PlanStepLink;
  onLinkClick?: () => void;
}) {
  const external = link.kind === "comparison";
  return (
    <Link
      href={link.href}
      className="mt-2 inline-block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
      rel={getLinkRel(link.kind)}
      target={external ? "_blank" : undefined}
      onClick={onLinkClick}
    >
      {link.label} →
    </Link>
  );
}

function PlanStepRow({
  step,
  phaseId,
  state,
  disabled,
  busy,
  onToggleDone,
  onSkip,
  onLinkClick,
}: {
  step: PlanStep;
  phaseId: string;
  state: PlanStepState;
  disabled: boolean;
  busy: boolean;
  onToggleDone: (phaseId: string, stepId: string, next: PlanStepState) => void;
  onSkip: (phaseId: string, stepId: string) => void;
  onLinkClick?: (stepId: string, link: PlanStepLink) => void;
}) {
  const checked = state === "done";
  const skipped = state === "skipped";

  return (
    <li
      className={`rounded-xl border px-4 py-3 ${
        skipped
          ? "border-intake-divider bg-intake-bg/60 opacity-70"
          : "border-intake-card-border bg-intake-bg"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled || busy || skipped}
          onChange={() => {
            onToggleDone(phaseId, step.id, checked ? "todo" : "done");
          }}
          className="mt-1 h-4 w-4 shrink-0 accent-intake-sage"
          aria-label={`Markeer: ${step.title}`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm leading-relaxed ${
              checked || skipped
                ? "text-intake-ink-subtle line-through"
                : "text-intake-ink-muted"
            }`}
          >
            {step.title}
          </p>
          {step.rationale ? (
            <p className="mt-2 text-xs leading-relaxed text-intake-ink-subtle">
              {step.rationale.body}
            </p>
          ) : null}
          {step.link ? (
            <PlanStepLinkAnchor
              link={step.link}
              onLinkClick={() => onLinkClick?.(step.id, step.link!)}
            />
          ) : null}
          {!disabled && !checked && !skipped ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSkip(phaseId, step.id)}
              className="mt-2 text-xs font-medium text-intake-ink-subtle underline decoration-intake-divider underline-offset-2 hover:text-intake-ink-muted"
            >
              Overslaan
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function LifestylePlan({
  template,
  scores,
  answers,
  sessionId,
  secondaryTheme = null,
}: LifestylePlanProps) {
  const ctx = useMemo(
    () => buildPlanIntakeContext(scores, answers, template.domain, secondaryTheme),
    [scores, answers, template.domain, secondaryTheme],
  );

  const loadKey = sessionId ? `${sessionId}:${template.domain}` : null;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const loading = loadKey !== null && loadedKey !== loadKey;
  const displayProgress = loadedKey === loadKey ? progress : null;
  const [busyStepId, setBusyStepId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const planViewedEmittedRef = useRef(false);

  const activePhaseIndex = useMemo(
    () => getActivePhaseIndex(template, ctx, displayProgress),
    [template, ctx, displayProgress],
  );

  useEffect(() => {
    if (!loadKey) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          `/api/intake/plan?domain=${encodeURIComponent(template.domain)}`,
          { credentials: "include", cache: "no-store" },
        );
        const json = (await response.json().catch(() => null)) as
          | { progress?: PlanProgress | null; error?: string }
          | null;

        if (!cancelled && response.ok) {
          setProgress(json?.progress ?? null);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Voortgang kon niet worden geladen.");
        }
      } finally {
        if (!cancelled) {
          setLoadedKey(loadKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadKey, template.domain]);

  useEffect(() => {
    if (loading || planViewedEmittedRef.current) {
      return;
    }
    planViewedEmittedRef.current = true;
    emitIntakeClientEvent("plan.viewed", {
      domain: template.domain,
      template_version: template.version,
    });
  }, [loading, template.domain, template.version]);

  const persistStepState = useCallback(
    async (
      phaseId: string,
      stepId: string,
      toState: PlanStepState,
      previousProgress: PlanProgress | null,
    ): Promise<boolean> => {
      if (!sessionId) {
        return false;
      }

      const fromState = getStepState(previousProgress, stepId);

      const optimistic: PlanProgress = {
        sessionId,
        organizationId: previousProgress?.organizationId ?? "",
        domain: template.domain,
        templateVersion: template.version,
        currentPhaseId: phaseId,
        steps: {
          ...(previousProgress?.steps ?? {}),
          [stepId]: {
            stepId,
            state: toState,
            updatedAt: new Date().toISOString(),
          },
        },
        startedAt: previousProgress?.startedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: previousProgress?.completedAt ?? null,
      };

      setProgress(optimistic);
      setBusyStepId(stepId);
      setError(null);

      try {
        const response = await fetch("/api/intake/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            domain: template.domain,
            phaseId,
            stepId,
            toState,
          }),
        });

        const json = (await response.json().catch(() => null)) as
          | { progress?: PlanProgress; error?: string }
          | null;

        if (!response.ok || !json?.progress) {
          setProgress(previousProgress);
          setError(json?.error ?? "Kon voortgang niet opslaan.");
          return false;
        }

        setProgress(json.progress);
        if (fromState !== toState) {
          emitIntakeClientEvent("plan.step_state_changed", {
            domain: template.domain,
            phase_id: phaseId,
            step_id: stepId,
            from: fromState,
            to: toState,
            template_version: template.version,
          });
        }
        return true;
      } catch {
        setProgress(previousProgress);
        setError("Kon voortgang niet opslaan.");
        return false;
      } finally {
        setBusyStepId(null);
      }
    },
    [sessionId, template.domain, template.version],
  );

  const handleToggleDone = useCallback(
    (phaseId: string, stepId: string, next: PlanStepState) => {
      void persistStepState(phaseId, stepId, next, progress);
    },
    [persistStepState, progress],
  );

  const handleSkip = useCallback(
    (phaseId: string, stepId: string) => {
      void persistStepState(phaseId, stepId, "skipped", progress);
    },
    [persistStepState, progress],
  );

  const handleLinkClick = useCallback(
    (stepId: string, link: PlanStepLink) => {
      emitIntakeClientEvent("plan.step_link_clicked", {
        domain: template.domain,
        step_id: stepId,
        link_kind: link.kind,
      });
    },
    [template.domain],
  );

  return (
    <article className="text-left" aria-label={template.title}>
      <header className="mb-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-terra">
          Jouw leefstijlplan
        </p>
        <h2 className="font-serif text-[22px] font-normal leading-tight text-intake-ink">
          {template.title}
        </h2>
      </header>

      <section className="mb-5 rounded-xl border border-intake-card-border bg-intake-bg-elevated/50 px-4 py-4">
        {template.recognition.heading ? (
          <h3 className="mb-2 text-sm font-semibold text-intake-ink">
            {template.recognition.heading}
          </h3>
        ) : null}
        {template.recognition.body.split("\n\n").map((paragraph, index) => (
          <p
            key={`recognition-${index}`}
            className={`text-sm leading-relaxed text-intake-ink-muted ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mb-5 rounded-xl border border-intake-card-border bg-intake-bg px-4 py-4">
        {template.mechanism.heading ? (
          <h3 className="mb-2 text-sm font-semibold text-intake-ink">
            {template.mechanism.heading}
          </h3>
        ) : null}
        {template.mechanism.body.split("\n\n").map((paragraph, index) => (
          <p
            key={`mechanism-${index}`}
            className={`text-sm leading-relaxed text-intake-ink-muted ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            {paragraph}
          </p>
        ))}
        {template.mechanism.source ? (
          <p className="mt-3 text-xs leading-relaxed text-intake-ink-subtle">
            {template.mechanism.source}
          </p>
        ) : null}
      </section>

      {loading ? (
        <p className="mb-4 text-sm text-intake-ink-subtle">Plan laden…</p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        {template.phases.map((phase, phaseIndex) => {
          const visibleSteps = selectVisibleSteps(phase, ctx);
          const isActive = phaseIndex === activePhaseIndex;
          const isLocked = phaseIndex > activePhaseIndex;
          const isPast = phaseIndex < activePhaseIndex;
          const phaseComplete = isPhaseComplete(phase, ctx, displayProgress?.steps ?? {});

          return (
            <section
              key={phase.id}
              aria-labelledby={`phase-title-${phase.id}`}
              className={`rounded-2xl border px-4 py-4 ${
                isLocked
                  ? "border-intake-divider bg-intake-bg/40 opacity-60"
                  : "border-intake-card-border bg-intake-bg-elevated/40"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
                    {HORIZON_LABELS[phase.horizon]}
                  </p>
                  <h3
                    id={`phase-title-${phase.id}`}
                    className="mt-1 text-base font-semibold text-intake-ink"
                  >
                    {phase.title}
                  </h3>
                </div>
                {isLocked ? (
                  <span
                    className="shrink-0 text-xs font-medium text-intake-ink-subtle"
                    aria-hidden
                  >
                    🔒
                  </span>
                ) : null}
                {isPast && phaseComplete ? (
                  <span className="shrink-0 rounded-full bg-intake-sage/15 px-2 py-0.5 text-xs font-semibold text-intake-sage">
                    Klaar
                  </span>
                ) : null}
              </div>

              {phase.intro ? (
                <p className="mb-4 text-sm leading-relaxed text-intake-ink-muted">
                  {phase.intro.body}
                </p>
              ) : null}

              {isLocked ? (
                <p className="text-sm text-intake-ink-subtle">
                  Rond eerst de vorige fase af om deze stappen te ontgrendelen.
                </p>
              ) : (
                <ul className="space-y-3">
                  {visibleSteps.map((step) => (
                    <PlanStepRow
                      key={step.id}
                      step={step}
                      phaseId={phase.id}
                      state={getStepState(displayProgress, step.id)}
                      disabled={!isActive || !sessionId}
                      busy={busyStepId === step.id}
                      onToggleDone={handleToggleDone}
                      onSkip={handleSkip}
                      onLinkClick={handleLinkClick}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <aside className="mt-6 rounded-xl border border-intake-card-border bg-intake-bg px-4 py-4">
        {template.medicalBoundary.heading ? (
          <h3 className="mb-2 text-sm font-semibold text-intake-ink">
            {template.medicalBoundary.heading}
          </h3>
        ) : null}
        {template.medicalBoundary.body.split("\n\n").map((paragraph, index) => (
          <p
            key={`medical-${index}`}
            className={`text-sm leading-relaxed text-intake-ink-muted ${
              index > 0 ? "mt-3" : ""
            }`}
          >
            {paragraph}
          </p>
        ))}
      </aside>

      {!sessionId ? (
        <p className="mt-4 text-xs text-intake-ink-subtle">
          Sla je voortgang op door de intake af te ronden met een actieve sessie.
        </p>
      ) : null}
    </article>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  buildPlanIntakeContext,
  isPhaseComplete,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import {
  buildMovementNutrientBridge,
  type NutrientBridgeItem,
} from "@/lib/movement-nutrient-bridge";
import { getMovementTrack } from "@/lib/movement-plan-track";
import { getPlanCrossDomainChips } from "@/lib/plan-cross-domain-chips";
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
  headerActions?: ReactNode;
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

function isBridgeStep(step: PlanStep): boolean {
  return step.tags?.includes("nutrient-bridge") ?? false;
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
  className = "mt-2 inline-block text-sm font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage",
}: {
  link: PlanStepLink;
  onLinkClick?: () => void;
  className?: string;
}) {
  const external = link.kind === "comparison";
  return (
    <Link
      href={link.href}
      className={className}
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
            <details className="mt-2 group">
              <summary className="cursor-pointer text-xs font-medium text-intake-ink-subtle underline decoration-intake-divider underline-offset-2 hover:text-intake-ink-muted">
                Waarom?
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-intake-ink-subtle">
                {step.rationale.body}
              </p>
            </details>
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

function MovementTrackBanner({ label, summary }: { label: string; summary: string }) {
  return (
    <div className="mb-5 rounded-xl border border-intake-sage/25 bg-intake-sage/8 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
        Jouw bewegingsspoor
      </p>
      <p className="mt-1 text-sm font-semibold text-intake-ink">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-intake-ink-muted">{summary}</p>
    </div>
  );
}

function NutrientBridgeSection({
  items,
  onItemClick,
}: {
  items: NutrientBridgeItem[];
  onItemClick: (item: NutrientBridgeItem) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="nutrient-bridge-heading"
      className="mt-4 rounded-2xl border border-intake-card-border bg-intake-bg px-4 py-4"
    >
      <h3
        id="nutrient-bridge-heading"
        className="text-sm font-semibold text-intake-ink"
      >
        Ondersteuning — wat dit spoor van je voeding vraagt
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-intake-ink-subtle">
        Eerst tafel, dan potje. Supplementen vullen aan waar leefstijl niet rond komt.
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => {
          const external = item.kind === "comparison";
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                rel={getLinkRel(item.kind)}
                target={external ? "_blank" : undefined}
                onClick={() => onItemClick(item)}
                className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-colors hover:border-intake-sage/40 ${
                  item.emphasis
                    ? "border-intake-sage/30 bg-intake-sage/5"
                    : "border-intake-card-border bg-intake-bg-elevated/50"
                }`}
              >
                <span className="text-sm font-medium text-intake-ink">{item.label}</span>
                <span className="text-xs leading-relaxed text-intake-ink-subtle">
                  {item.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CrossDomainChips({
  domain,
  onChipClick,
}: {
  domain: MeasuredPillarId;
  onChipClick: (pillarId: string) => void;
}) {
  const chips = getPlanCrossDomainChips(domain);
  if (chips.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="cross-domain-heading" className="mt-4">
      <h3
        id="cross-domain-heading"
        className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle"
      >
        Raakt ook andere domeinen
      </h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.pillarId}
            href={chip.href}
            title={chip.hint}
            onClick={() => onChipClick(chip.pillarId)}
            className="inline-flex flex-col rounded-lg border border-intake-card-border bg-intake-bg px-3 py-2 text-left transition-colors hover:border-intake-sage/35 hover:bg-intake-sage/5"
          >
            <span className="text-xs font-semibold text-intake-ink">{chip.label}</span>
            <span className="text-[10px] text-intake-ink-subtle">{chip.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function LifestylePlan({
  template,
  scores,
  answers,
  sessionId,
  secondaryTheme = null,
  headerActions,
}: LifestylePlanProps) {
  const ctx = useMemo(
    () => buildPlanIntakeContext(scores, answers, template.domain, secondaryTheme),
    [scores, answers, template.domain, secondaryTheme],
  );

  const movementTrack = useMemo(
    () => (template.domain === "movement" ? getMovementTrack(ctx) : null),
    [template.domain, ctx],
  );

  const nutrientBridgeItems = useMemo(
    () =>
      template.domain === "movement" ? buildMovementNutrientBridge(ctx) : [],
    [template.domain, ctx],
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
    if (template.domain === "movement" && movementTrack) {
      clarityTag("movement_track", movementTrack.label);
    }
  }, [loading, template.domain, template.version, movementTrack]);

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
    (stepId: string, link: PlanStepLink, surface: "step" | "nutrient_bridge" = "step") => {
      emitIntakeClientEvent("plan.step_link_clicked", {
        domain: template.domain,
        step_id: stepId,
        link_kind: link.kind,
        surface,
      });
    },
    [template.domain],
  );

  const handleBridgeItemClick = useCallback(
    (item: NutrientBridgeItem) => {
      emitIntakeClientEvent("plan.step_link_clicked", {
        domain: template.domain,
        step_id: item.id,
        link_kind: item.kind,
        surface: "nutrient_bridge",
      });
      trackEvent("movement_nutrient_bridge", {
        item_id: item.id,
        link_kind: item.kind,
      });
      clarityTag("movement_nutrient_bridge", item.id);
    },
    [template.domain],
  );

  const handleCrossDomainClick = useCallback(
    (pillarId: string) => {
      trackEvent("plan_cross_domain_click", {
        domain: template.domain,
        target_pillar: pillarId,
      });
      clarityTag("plan_cross_domain", `${template.domain}_${pillarId}`);
    },
    [template.domain],
  );

  return (
    <article className="text-left" aria-label={template.title}>
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-terra">
              Jouw leefstijlplan
            </p>
            <h2 className="font-serif text-[22px] font-normal leading-tight text-intake-ink">
              {template.title}
            </h2>
          </div>
          {headerActions ? (
            <div className="shrink-0 pt-0.5">{headerActions}</div>
          ) : null}
        </div>
      </header>

      {movementTrack ? (
        <MovementTrackBanner
          label={movementTrack.label}
          summary={movementTrack.summary}
        />
      ) : null}

      <section className="mb-4 rounded-xl border border-intake-card-border bg-intake-bg-elevated/50 px-4 py-3">
        {template.recognition.heading ? (
          <h3 className="mb-1.5 text-sm font-semibold text-intake-ink">
            {template.recognition.heading}
          </h3>
        ) : null}
        <p className="text-sm leading-relaxed text-intake-ink-muted">
          {template.recognition.body.split("\n\n")[0]}
        </p>
      </section>

      <details className="group mb-5 rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-intake-ink marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-intake-divider underline-offset-2 group-open:no-underline">
            {template.mechanism.heading ?? "Waarom na 40?"}
          </span>
        </summary>
        <div className="mt-3 border-t border-intake-divider pt-3">
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
        </div>
      </details>

      {loading ? (
        <p className="mb-4 text-sm text-intake-ink-subtle">Plan laden…</p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {template.phases.map((phase, phaseIndex) => {
          const visibleSteps = selectVisibleSteps(phase, ctx).filter(
            (step) => !isBridgeStep(step),
          );
          const isActive = phaseIndex === activePhaseIndex;
          const isLocked = phaseIndex > activePhaseIndex;
          const isPast = phaseIndex < activePhaseIndex;
          const phaseComplete = isPhaseComplete(phase, ctx, displayProgress?.steps ?? {});

          if (!isActive && (isPast || isLocked)) {
            return (
              <section
                key={phase.id}
                aria-labelledby={`phase-title-${phase.id}`}
                className={`rounded-xl border px-4 py-3 ${
                  isLocked
                    ? "border-intake-divider bg-intake-bg/40 opacity-70"
                    : "border-intake-divider bg-intake-bg/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
                      {HORIZON_LABELS[phase.horizon]}
                    </p>
                    <h3
                      id={`phase-title-${phase.id}`}
                      className="mt-0.5 text-sm font-medium text-intake-ink-muted"
                    >
                      {phase.title}
                    </h3>
                  </div>
                  {isLocked ? (
                    <span className="shrink-0 text-xs text-intake-ink-subtle" aria-hidden>
                      🔒
                    </span>
                  ) : null}
                  {isPast && phaseComplete ? (
                    <span className="shrink-0 rounded-full bg-intake-sage/15 px-2 py-0.5 text-xs font-semibold text-intake-sage">
                      Klaar
                    </span>
                  ) : null}
                </div>
                {isLocked ? (
                  <p className="mt-2 text-xs text-intake-ink-subtle">
                    Rond eerst de vorige fase af.
                  </p>
                ) : null}
              </section>
            );
          }

          return (
            <section
              key={phase.id}
              aria-labelledby={`phase-title-${phase.id}`}
              className="rounded-2xl border border-intake-card-border bg-intake-bg-elevated/40 px-4 py-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
                    {HORIZON_LABELS[phase.horizon]}
                  </p>
                  <h3
                    id={`phase-title-${phase.id}`}
                    className="mt-1 text-base font-semibold text-intake-ink"
                  >
                    {phase.title}
                  </h3>
                </div>
              </div>

              {phase.intro ? (
                <p className="mb-4 text-sm leading-relaxed text-intake-ink-muted">
                  {phase.intro.body}
                </p>
              ) : null}

              <ul className="space-y-3">
                {visibleSteps.map((step) => (
                  <PlanStepRow
                    key={step.id}
                    step={step}
                    phaseId={phase.id}
                    state={getStepState(displayProgress, step.id)}
                    disabled={!sessionId}
                    busy={busyStepId === step.id}
                    onToggleDone={handleToggleDone}
                    onSkip={handleSkip}
                    onLinkClick={(stepId, link) => handleLinkClick(stepId, link, "step")}
                  />
                ))}
              </ul>

              {template.domain === "movement" && isActive ? (
                <NutrientBridgeSection
                  items={nutrientBridgeItems}
                  onItemClick={handleBridgeItemClick}
                />
              ) : null}

              {isActive ? (
                <CrossDomainChips
                  domain={template.domain}
                  onChipClick={handleCrossDomainClick}
                />
              ) : null}
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

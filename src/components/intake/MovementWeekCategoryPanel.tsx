"use client";

import { useState, type ReactNode } from "react";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementDailyRhythm } from "@/lib/movement-daily-rhythm";
import {
  DEFAULT_WEEK_CATEGORY,
  filterStepsForCategory,
  getCategoryStatus,
  WEEK_CATEGORY_OPTIONS,
  type WeekCategory,
} from "@/lib/movement-week-categories";
import MovementDailyRhythmContent from "@/components/intake/MovementDailyRhythmContent";
import MovementRecoveryBanner from "@/components/intake/MovementRecoveryBanner";
import type { PlanStep, PlanStepState } from "@/types/lifestyle-plan";
import type { MovementRecoveryHint } from "@/lib/movement-recovery-hint";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";

type MovementWeekCategoryPanelProps = {
  phaseId: string;
  domain: string;
  templateVersion: string;
  visibleSteps: PlanStep[];
  dailyRhythm: MovementDailyRhythm;
  readOnly: boolean;
  recoveryHint?: MovementRecoveryHint | null;
  getStepState: (stepId: string) => PlanStepState;
  renderStepRow: (step: PlanStep) => ReactNode;
};

function CategoryStatusDot({ status }: { status: ReturnType<typeof getCategoryStatus> }) {
  if (status === "na") {
    return null;
  }
  const tone =
    status === "done"
      ? "bg-intake-sage"
      : status === "partial"
        ? "bg-intake-terra/80"
        : "bg-intake-ink-subtle/40";
  return (
    <span
      className={`ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${tone}`}
      aria-hidden
    />
  );
}

export default function MovementWeekCategoryPanel({
  phaseId,
  domain,
  templateVersion,
  visibleSteps,
  dailyRhythm,
  readOnly,
  recoveryHint = null,
  getStepState,
  renderStepRow,
}: MovementWeekCategoryPanelProps) {
  const [category, setCategory] = useState<WeekCategory>(DEFAULT_WEEK_CATEGORY);

  const selectCategory = (next: WeekCategory) => {
    setCategory(next);
    emitIntakeClientEvent("plan.week_category_selected", {
      domain,
      phase_id: phaseId,
      category: next,
      template_version: templateVersion,
    });
    trackEvent("movement_week_category", {
      category: next,
      phase_id: phaseId,
    });
    clarityTag("movement_week_category", next);
  };

  const categorySteps = filterStepsForCategory(visibleSteps, category);
  const orderedKrachtSteps =
    category === "kracht" && recoveryHint?.promoteRustdagStep
      ? [
          ...categorySteps.filter((step) => step.id === REST_DAY_STEP_ID),
          ...categorySteps.filter((step) => step.id !== REST_DAY_STEP_ID),
        ]
      : categorySteps;

  const stepList = (steps: PlanStep[]) => (
    <ul className="space-y-3">
      {steps.map((step) => renderStepRow(step))}
    </ul>
  );

  if (readOnly) {
    const krachtSteps = filterStepsForCategory(visibleSteps, "kracht");
    const conditieSteps = filterStepsForCategory(visibleSteps, "conditie");

    return (
      <div className="space-y-5">
        {krachtSteps.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
              Kracht
            </p>
            {recoveryHint ? <MovementRecoveryBanner hint={recoveryHint} /> : null}
            {stepList(krachtSteps)}
          </div>
        ) : null}
        {conditieSteps.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
              Conditie
            </p>
            {stepList(conditieSteps)}
          </div>
        ) : null}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
            Dagelijks ritme
          </p>
          <MovementDailyRhythmContent
            rhythm={dailyRhythm}
            domain={domain}
            templateVersion={templateVersion}
            embedded
          />
        </div>
        <p className="text-xs text-intake-ink-subtle">
          Preview — afvinken kan zodra deze fase actief is.
        </p>
      </div>
    );
  }

  return (
    <div>
      <nav
        aria-label="Deze week categorieën"
        className="mb-4 flex flex-wrap gap-2"
      >
        {WEEK_CATEGORY_OPTIONS.map((option) => {
          const active = category === option.id;
          const status = getCategoryStatus(visibleSteps, option.id, getStepState);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectCategory(option.id)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-intake-sage bg-intake-sage/10 text-intake-sage"
                  : "border-intake-card-border bg-intake-bg text-intake-ink-muted hover:border-intake-sage/30"
              }`}
            >
              {option.label}
              <CategoryStatusDot status={status} />
            </button>
          );
        })}
      </nav>

      {category === "kracht" && recoveryHint ? (
        <MovementRecoveryBanner hint={recoveryHint} />
      ) : null}

      {category === "dagelijks_ritme" ? (
        <MovementDailyRhythmContent
          rhythm={dailyRhythm}
          domain={domain}
          templateVersion={templateVersion}
          embedded
        />
      ) : categorySteps.length > 0 ? (
        <ul className="space-y-3">
          {(category === "kracht" ? orderedKrachtSteps : categorySteps).map((step) =>
            renderStepRow(step),
          )}
        </ul>
      ) : (
        <p className="text-sm text-intake-ink-subtle">
          Geen acties in deze categorie voor jouw profiel.
        </p>
      )}
    </div>
  );
}

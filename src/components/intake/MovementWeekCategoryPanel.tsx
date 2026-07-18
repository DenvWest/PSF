"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { clarityTag } from "@/lib/clarity";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { trackEvent } from "@/lib/ga4";
import type { MovementDailyRhythm } from "@/lib/movement-daily-rhythm";
import type { NutrientBridgeItem } from "@/lib/movement-nutrient-bridge";
import {
  buildMovementSpoorDetail,
  buildMovementWeekRoadmap,
  parseSpoorFromUrl,
  syncPlanSpoorParam,
} from "@/lib/movement-week-roadmap";
import {
  DEFAULT_WEEK_CATEGORY,
  filterStepsForCategory,
  type WeekCategory,
} from "@/lib/movement-week-categories";
import MovementDailyRhythmContent from "@/components/intake/MovementDailyRhythmContent";
import MovementSpoorDetail from "@/components/intake/MovementSpoorDetail";
import MovementWeekRoadmap from "@/components/intake/MovementWeekRoadmap";
import type { PlanIntakeContext, PlanStep, PlanStepLink, PlanStepState } from "@/types/lifestyle-plan";
import type { MovementRecoveryHint } from "@/lib/movement-recovery-hint";

type MovementWeekCategoryPanelProps = {
  phaseId: string;
  domain: string;
  templateVersion: string;
  ctx: PlanIntakeContext;
  visibleSteps: PlanStep[];
  dailyRhythm: MovementDailyRhythm;
  nutrientBridgeItems: NutrientBridgeItem[];
  readOnly: boolean;
  recoveryHint?: MovementRecoveryHint | null;
  getStepState: (stepId: string) => PlanStepState;
  renderStepRow: (
    step: PlanStep,
    options?: { showRationale?: boolean; variant?: "primary" | "alternative" },
  ) => ReactNode;
  onBridgeItemClick: (item: NutrientBridgeItem) => void;
  onLinkClick: (stepId: string, link: PlanStepLink) => void;
};

function getStepById(steps: readonly PlanStep[], stepId: string): PlanStep | undefined {
  return steps.find((step) => step.id === stepId);
}

export default function MovementWeekCategoryPanel({
  phaseId,
  domain,
  templateVersion,
  ctx,
  visibleSteps,
  dailyRhythm,
  nutrientBridgeItems,
  readOnly,
  recoveryHint = null,
  getStepState,
  renderStepRow,
  onBridgeItemClick,
  onLinkClick,
}: MovementWeekCategoryPanelProps) {
  const [activeSpoor, setActiveSpoor] = useState<WeekCategory | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return parseSpoorFromUrl(window.location.href);
  });

  const roadmap = useMemo(
    () => buildMovementWeekRoadmap(ctx, visibleSteps, getStepState, recoveryHint),
    [ctx, visibleSteps, getStepState, recoveryHint],
  );

  const openSpoor = useCallback(
    (category: WeekCategory) => {
      setActiveSpoor(category);
      syncPlanSpoorParam(category);
      emitIntakeClientEvent("plan.week_category_selected", {
        domain,
        phase_id: phaseId,
        category,
        template_version: templateVersion,
      });
      trackEvent("movement_week_category", {
        category,
        phase_id: phaseId,
      });
      clarityTag("movement_week_category", category);
    },
    [domain, phaseId, templateVersion],
  );

  const closeSpoor = useCallback(() => {
    setActiveSpoor(null);
    syncPlanSpoorParam(null);
  }, []);

  const detail = useMemo(() => {
    if (!activeSpoor) {
      return null;
    }
    return buildMovementSpoorDetail(ctx, visibleSteps, activeSpoor, recoveryHint);
  }, [activeSpoor, ctx, visibleSteps, recoveryHint]);

  const stepList = (steps: PlanStep[]) => (
    <ul className="space-y-3">
      {steps.map((step) => renderStepRow(step, { showRationale: true }))}
    </ul>
  );

  if (readOnly) {
    const krachtSteps = filterStepsForCategory(visibleSteps, "kracht");
    const conditieSteps = filterStepsForCategory(visibleSteps, "conditie");

    return (
      <div className="space-y-5">
        <MovementWeekRoadmap
          roadmap={roadmap}
          readOnly
          onSpoorSelect={() => undefined}
          onOndersteuningSelect={() => undefined}
        />
        {krachtSteps.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-intake-ink-subtle">
              Kracht
            </p>
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

  if (activeSpoor && detail) {
    return (
      <MovementSpoorDetail
        detail={detail}
        domain={domain}
        templateVersion={templateVersion}
        dailyRhythm={dailyRhythm}
        nutrientBridgeItems={nutrientBridgeItems}
        onBack={closeSpoor}
        onBridgeItemClick={onBridgeItemClick}
        onEvidenceClick={onLinkClick}
        renderStepRow={(stepId, variant) => {
          const step = getStepById(visibleSteps, stepId);
          if (!step) {
            return null;
          }
          return renderStepRow(step, { showRationale: true, variant });
        }}
      />
    );
  }

  return (
    <MovementWeekRoadmap
      roadmap={roadmap}
      onSpoorSelect={openSpoor}
      onOndersteuningSelect={() => openSpoor("kracht")}
      onTodaySelect={() => openSpoor(DEFAULT_WEEK_CATEGORY)}
    />
  );
}

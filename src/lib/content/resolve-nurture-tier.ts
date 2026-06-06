import { getPlanTemplate } from "@/data/lifestyle-plans";
import type {
  InterventionBuckets,
  MatchedIntervention,
} from "@/lib/content/match-interventions";
import { isPhaseComplete } from "@/lib/lifestyle-plan-eval";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type {
  LifestylePlanTemplate,
  PlanIntakeContext,
  PlanStepProgress,
} from "@/types/lifestyle-plan";

const NURTURE_SEQUENCE_TIER = {
  3: 1,
  14: 2,
  21: 3,
} as const satisfies Record<number, 1 | 2 | 3>;

export type NurtureSequenceDay = keyof typeof NURTURE_SEQUENCE_TIER;

export function isTierVisible(
  tier: number,
  visibleTiers: readonly number[],
): boolean {
  return visibleTiers.includes(tier);
}

export function filterByVisibleTiers<T extends { tier: number }>(
  items: T[],
  visibleTiers: readonly number[],
): T[] {
  return items.filter((item) => isTierVisible(item.tier, visibleTiers));
}

export function countCompletedPlanPhases(
  template: LifestylePlanTemplate,
  ctx: PlanIntakeContext,
  steps: Record<string, PlanStepProgress>,
): number {
  let count = 0;
  for (const phase of template.phases) {
    if (!isPhaseComplete(phase, ctx, steps)) {
      break;
    }
    count += 1;
  }
  return count;
}

export function resolveCompletedPlanPhases(
  domain: MeasuredPillarId,
  ctx: PlanIntakeContext | null,
  steps: Record<string, PlanStepProgress> | null,
): number {
  if (!ctx || !steps) {
    return 0;
  }

  const template = getPlanTemplate(domain);
  if (!template) {
    return 0;
  }

  return countCompletedPlanPhases(template, ctx, steps);
}

function pickInterventionForTier(
  buckets: InterventionBuckets,
  tier: 1 | 2 | 3,
): MatchedIntervention | null {
  if (tier === 1) {
    return buckets.free_action;
  }
  if (tier === 2) {
    return buckets.measurement;
  }
  return buckets.supplement;
}

export type NurtureTierResolution = {
  requestedTier: 1 | 2 | 3 | null;
  effectiveTier: 1 | 2 | 3 | null;
  intervention: MatchedIntervention | null;
  degraded: boolean;
};

export function resolveNurtureTierAction(
  buckets: InterventionBuckets,
  visibleTiers: readonly number[],
  completedPhaseCount: number,
  sequenceDay: number,
): NurtureTierResolution {
  const requestedTier =
    sequenceDay in NURTURE_SEQUENCE_TIER
      ? NURTURE_SEQUENCE_TIER[sequenceDay as NurtureSequenceDay]
      : null;

  if (!requestedTier) {
    return {
      requestedTier: null,
      effectiveTier: null,
      intervention: null,
      degraded: false,
    };
  }

  const pickVisible = (tier: 1 | 2 | 3): MatchedIntervention | null => {
    if (!isTierVisible(tier, visibleTiers)) {
      return null;
    }
    return pickInterventionForTier(buckets, tier);
  };

  if (sequenceDay === 3) {
    const intervention = pickVisible(1);
    return {
      requestedTier: 1,
      effectiveTier: intervention ? 1 : null,
      intervention,
      degraded: false,
    };
  }

  if (sequenceDay === 14) {
    if (completedPhaseCount >= 1) {
      const tier2 = pickVisible(2);
      if (tier2) {
        return {
          requestedTier: 2,
          effectiveTier: 2,
          intervention: tier2,
          degraded: false,
        };
      }
    }

    const tier1 = pickVisible(1);
    return {
      requestedTier: 2,
      effectiveTier: tier1 ? 1 : null,
      intervention: tier1,
      degraded: true,
    };
  }

  if (sequenceDay === 21) {
    if (completedPhaseCount >= 2) {
      const tier3 = pickVisible(3);
      if (tier3) {
        return {
          requestedTier: 3,
          effectiveTier: 3,
          intervention: tier3,
          degraded: false,
        };
      }
    }

    if (completedPhaseCount >= 1) {
      const tier2 = pickVisible(2);
      if (tier2) {
        return {
          requestedTier: 3,
          effectiveTier: 2,
          intervention: tier2,
          degraded: true,
        };
      }
    }

    const tier1 = pickVisible(1);
    return {
      requestedTier: 3,
      effectiveTier: tier1 ? 1 : null,
      intervention: tier1,
      degraded: true,
    };
  }

  return {
    requestedTier: null,
    effectiveTier: null,
    intervention: null,
    degraded: false,
  };
}

import { PILLAR } from "@/data/dashboard";
import {
  REVEAL_COPY,
  REVEAL_FIRST_STEP_UPCOMING,
} from "@/lib/results-reveal-copy";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import type { RevealModel } from "@/lib/reveal-model";
import type { PillarQuickWin } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

export type RevealFirstStepSupplement = {
  name: string;
  form: string;
  grade: string;
  signal: string;
  qualityRule: string;
  trustLine: string;
  rationale: string;
};

export type RevealUpcomingFeature = {
  label: string;
  detail: string;
};

export type RevealFirstStep = {
  lifestyleTrack: string;
  lifestyle: PillarQuickWin;
  qualifiesForSupplement: boolean;
  supplement: RevealFirstStepSupplement | null;
  upcoming: readonly RevealUpcomingFeature[];
};

function isWeakFirstStep(priority: RevealModel["priority"]): boolean {
  return priority.id === "herstel" || /alcohol/i.test(priority.quickWin.title);
}

function resolveLifestyleQuickWin(model: RevealModel): PillarQuickWin {
  if (!isWeakFirstStep(model.priority)) {
    return model.priority.quickWin;
  }

  const primaryPillar = PILLAR[model.primaryPillarId];
  if (
    primaryPillar &&
    primaryPillar.id !== "herstel" &&
    !/alcohol/i.test(primaryPillar.quickWin.title)
  ) {
    return primaryPillar.quickWin;
  }

  return PILLAR.voeding.quickWin;
}

export function resolveRevealFirstStep(
  model: RevealModel,
  input: RecommendationInput,
): RevealFirstStep {
  const lifestyle = resolveLifestyleQuickWin(model);
  const priorityDisclosure = buildSupplementDisclosure(
    model.priority,
    input,
    "results",
    lifestyle,
  );
  const voedingDisclosure = buildSupplementDisclosure(
    PILLAR.voeding,
    input,
    "results",
    lifestyle,
  );
  const disclosure = priorityDisclosure ?? voedingDisclosure;

  return {
    lifestyleTrack: REVEAL_COPY.firstStepNowLabel,
    lifestyle,
    qualifiesForSupplement: disclosure != null && !disclosure.onHold,
    supplement: disclosure
      ? {
          name: disclosure.name,
          form: disclosure.form,
          grade: disclosure.grade,
          signal: disclosure.signal,
          qualityRule: disclosure.qualityRule,
          trustLine: disclosure.explanation.trustLine,
          rationale: disclosure.explanation.supplementRationale,
        }
      : null,
    upcoming: REVEAL_FIRST_STEP_UPCOMING,
  };
}

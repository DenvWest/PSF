import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import { PILLAR } from "@/data/dashboard";
import {
  REVEAL_COPY,
  REVEAL_FIRST_STEP_UPCOMING,
} from "@/lib/results-reveal-copy";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
import type { RevealModel } from "@/lib/reveal-model";
import type { Pillar, PillarId, PillarQuickWin } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

/**
 * Theme-supplement: leefstijldomeinen zonder eigen supplement koppelen aan het
 * supplement dat hun EFSA-thema dekt. Magnesium (slaap-pijler) dekt zenuwstelsel,
 * spierfunctie, vermindering van vermoeidheid en normale psychologische functie —
 * dus stress/herstel/energie. Voorkomt de voeding/omega-3-fallback die niet bij de
 * leefstijlstap (bv. box-breathing) past. Zie docs/core/COMPLIANCE.md.
 */
const THEME_SUPPLEMENT_PILLAR: Partial<Record<PillarId, PillarId>> = {
  stress: "slaap",
  herstel: "slaap",
  energie: "slaap",
};

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

export type ResolveRevealFirstStepOptions = {
  selectedPillar?: Pillar;
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

function resolveLifestyleForSelection(
  model: RevealModel,
  selectedPillar?: Pillar,
): PillarQuickWin {
  if (!selectedPillar || selectedPillar.id === model.priority.id) {
    return resolveLifestyleQuickWin(model);
  }

  return selectedPillar.quickWin;
}

function resolveSupplementDisclosure(
  selectedPillar: Pillar,
  input: RecommendationInput,
  lifestyle: PillarQuickWin,
): SupplementDisclosureData | null {
  const pillarDisclosure = buildSupplementDisclosure(
    selectedPillar,
    input,
    "results",
    lifestyle,
  );

  const themePillarId = THEME_SUPPLEMENT_PILLAR[selectedPillar.id];
  const themeDisclosure = themePillarId
    ? buildSupplementDisclosure(PILLAR[themePillarId], input, "results", lifestyle)
    : null;

  const voedingDisclosure = buildSupplementDisclosure(
    PILLAR.voeding,
    input,
    "results",
    lifestyle,
  );

  return pillarDisclosure ?? themeDisclosure ?? voedingDisclosure;
}

export function resolveRevealFirstStep(
  model: RevealModel,
  input: RecommendationInput,
  options?: ResolveRevealFirstStepOptions,
): RevealFirstStep {
  const selectedPillar = options?.selectedPillar ?? model.priority;
  const lifestyle = resolveLifestyleForSelection(model, options?.selectedPillar);
  const disclosure = resolveSupplementDisclosure(selectedPillar, input, lifestyle);

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

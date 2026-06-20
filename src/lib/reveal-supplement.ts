import { approvedClaims } from "@/data/approved-claims";
import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import { RULES_VERSION } from "@/lib/intake-engine";
import { explainRecommendation } from "@/lib/recommendation-explainer";
import { getPillarRecommendation } from "@/lib/recommendation-engine";
import type { Pillar } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

const QUALITY_RULE =
  "Kwaliteitskeuze op vorm en bron — niet het goedkoopste schap-potje";

const PILLAR_ENGINE_STUB: RecommendationInput = {
  scores: {
    sleep_score: 0,
    energy_score: 0,
    stress_score: 0,
    nutrition_score: 0,
    movement_score: 0,
    recovery_score: 0,
  },
  signals: {
    omega3_deficiency: false,
    magnesium_signal: false,
    cortisol_risk: false,
    creatine_signal: false,
    melatonine_signal: false,
    protein_gap_signal: false,
    low_recovery_no_load: false,
    sleep_issue_no_stress: false,
    energy_dip_unexplained: false,
  },
  profileLabel: { name: "In Balans", domain: "nutrition", score: 0 },
  answers: {},
  rulesVersion: RULES_VERSION,
};

function isSupplementOnHold(supplementName: string): boolean {
  const key = supplementName.toLowerCase().split(/\s+/)[0];
  const entry = approvedClaims[key as keyof typeof approvedClaims];
  return entry?.status === "on_hold";
}

export function buildSupplementDisclosure(
  priority: Pillar,
  from: "results" | "dashboard" = "results",
): SupplementDisclosureData | null {
  const supplement = priority.supplement;
  if (!supplement) {
    return null;
  }

  const recommendation = getPillarRecommendation(PILLAR_ENGINE_STUB, priority.id);
  if (!recommendation?.available || !recommendation.comparisonPath) {
    return null;
  }

  const explanation = explainRecommendation(recommendation, {
    lifestyleStep: priority.quickWin,
    supplement: {
      name: supplement.name,
      claim: supplement.claim,
      grade: supplement.grade,
    },
  });

  return {
    name: supplement.name,
    form: supplement.form,
    grade: supplement.grade,
    claim: supplement.claim,
    signal: supplement.signal,
    qualityRule: QUALITY_RULE,
    comparisonPath: `${recommendation.comparisonPath}?from=${from}`,
    onHold: isSupplementOnHold(supplement.name),
    explanation,
  };
}

/** @deprecated Use buildSupplementDisclosure */
export function buildRevealSupplementDisclosure(
  priority: Pillar,
): SupplementDisclosureData | null {
  return buildSupplementDisclosure(priority, "results");
}

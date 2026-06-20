import { approvedClaims } from "@/data/approved-claims";
import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import { explainRecommendation } from "@/lib/recommendation-explainer";
import { getPillarRecommendation } from "@/lib/recommendation-engine";
import type { Pillar } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

const QUALITY_RULE =
  "Kwaliteitskeuze op vorm en bron — niet het goedkoopste schap-potje";

function isSupplementOnHold(supplementName: string): boolean {
  const key = supplementName.toLowerCase().split(/\s+/)[0];
  const entry = approvedClaims[key as keyof typeof approvedClaims];
  return entry?.status === "on_hold";
}

export function buildSupplementDisclosure(
  priority: Pillar,
  input: RecommendationInput,
  from: "results" | "dashboard" = "results",
): SupplementDisclosureData | null {
  const supplement = priority.supplement;
  if (!supplement) {
    return null;
  }

  const recommendation = getPillarRecommendation(input, priority.id);
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
  input: RecommendationInput,
): SupplementDisclosureData | null {
  return buildSupplementDisclosure(priority, input, "results");
}

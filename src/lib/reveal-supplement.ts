import { approvedClaims } from "@/data/approved-claims";
import type { SupplementDisclosureData } from "@/components/supplements/SupplementDisclosure";
import { explainRecommendation } from "@/lib/recommendation-explainer";
import {
  getCatalogEntry,
  getPillarRecommendation,
} from "@/lib/recommendation-engine";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import type { Pillar } from "@/types/dashboard";
import type { RecommendationInput } from "@/types/recommendation";

const QUALITY_RULE =
  "Leefstijl eerst — pas daarna een supplement objectief op kwaliteit gekozen";

function isSupplementOnHold(supplementName: string): boolean {
  const key = supplementName.toLowerCase().split(/\s+/)[0];
  const entry = approvedClaims[key as keyof typeof approvedClaims];
  return entry?.status === "on_hold";
}

export function buildSupplementDisclosure(
  priority: Pillar,
  input: RecommendationInput,
  from: "results" | "dashboard" = "results",
  lifestyleStepOverride?: Pillar["quickWin"],
): SupplementDisclosureData | null {
  const supplement = priority.supplement;
  if (!supplement) {
    return null;
  }

  const recommendation = getPillarRecommendation(input, priority.id);
  if (!recommendation?.available) {
    return null;
  }

  const entry = getCatalogEntry(recommendation.supplementId);
  const gatedPath = entry ? resolveGatedComparisonPath(entry.claimKey) : null;
  if (!gatedPath) {
    return null;
  }

  const explanation = explainRecommendation(recommendation, {
    lifestyleStep: lifestyleStepOverride ?? priority.quickWin,
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
    comparisonPath: `${gatedPath}?from=${from}`,
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

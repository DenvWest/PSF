import { getCatalogEntryById } from "@/data/supplement-catalog";
import type { SupplementRecommendation } from "@/data/supplement-routes";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import { RULES_VERSION } from "@/lib/intake-engine";
import { getRecommendations, matchesOvertrainerAnswers } from "@/lib/recommendation-engine";

export { matchesOvertrainerAnswers };

const ROUTE_NAMES: Record<string, { name: string; reason: string }> = {
  "omega-3": {
    name: "Omega-3 (EPA/DHA)",
    reason:
      "Je visinname is laag of je voedingsscore vraagt om een brede basis. EPA en DHA dragen bij tot de normale werking van het hart; DHA bovendien tot instandhouding van hersenfunctie en gezichtsvermogen (bij voldoende dagdosis volgens claimvoorwaarden).",
  },
  "magnesium-glycinaat": {
    name: "Magnesium glycinaat",
    reason:
      "Je routine of energie-indicator vraagt om ondersteuning via mineralen. Magnesium draagt o.a. bij tot vermindering van vermoeidheid en tot normale psychologische functie; bisglycinaat is een veelgekozen vorm.",
  },
  zink: {
    name: "Zink",
    reason:
      "Zink draagt onder meer bij tot normale eiwitsynthese en een normaal functionerend immuunsysteem — een logische optie als je profiel hierop stuurt.",
  },
  creatine: {
    name: "Creatine",
    reason:
      "Creatine ondersteunt fosfaat‑buffering voor korte bursts; onder EU‑claims kan het bij langdurige adequate inname (minimaal 3 g/dag) onder voorwaarden iets bijdragen aan ultrakorte spiertaken — geen belofte op algemene energie.",
  },
  "vitamine-d3": {
    name: "Vitamine D3",
    reason:
      "Een praktische basis voor bijna elk profiel: vitamine D speelt mee bij botten, spieren en immuunfunctie — zeker als er weinig zon is.",
  },
};

export function getSupplementRoute(
  domainScores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): SupplementRecommendation[] {
  const recommendations = getRecommendations(
    {
      scores: domainScores,
      signals: deficiencySignals,
      profileLabel,
      answers,
      rulesVersion: RULES_VERSION,
    },
    { source: "route" },
  );

  const routes: SupplementRecommendation[] = [];

  for (const recommendation of recommendations) {
    const catalogEntry = getCatalogEntryById(recommendation.supplementId);
    if (!catalogEntry) {
      continue;
    }

    const copy = ROUTE_NAMES[recommendation.supplementId];
    routes.push({
      id: catalogEntry.id,
      name: copy?.name ?? catalogEntry.id,
      reason: copy?.reason ?? "",
      priority: catalogEntry.priority,
      domains: catalogEntry.domains,
      hasComparison: catalogEntry.hasComparison,
      affiliateUrl: catalogEntry.comparisonPath ?? "",
      triggers: catalogEntry.routeTriggers ?? { anyOf: [] },
      ...(catalogEntry.fallbackOnly ? { fallbackOnly: true } : {}),
    });
  }

  return routes;
}

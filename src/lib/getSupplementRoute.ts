import {
  SUPPLEMENT_ROUTE_DEFINITIONS,
  type SupplementRecommendation,
  type SupplementTriggerClause,
} from "@/data/supplement-routes";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";

function intAnswer(answers: Record<string, number>, key: string): number {
  const v = answers[key];
  return typeof v === "number" ? v : 0;
}

function matchesZink(scores: DomainScores, profileLabel: ProfileLabel): boolean {
  return (
    scores.recovery_score < 40 ||
    scores.nutrition_score < 40 ||
    profileLabel.name === "Stille Slijter"
  );
}

/** Overtrainer-patroon uit intake-spec: veel bewegen, weinig fysiek herstel (geen apart profiellabel in engine). */
function matchesOvertrainerAnswers(answers: Record<string, number>): boolean {
  return intAnswer(answers, "MOV_FREQ") >= 3 && intAnswer(answers, "RCV_PHYS") <= 1;
}

function matchesCreatine(
  scores: DomainScores,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): boolean {
  const movementFrequency = intAnswer(answers, "MOV_FREQ");
  return (
    (scores.recovery_score < 50 && movementFrequency >= 3) ||
    profileLabel.name === "Stille Slijter" ||
    matchesOvertrainerAnswers(answers)
  );
}

function clauseMatches(
  clause: SupplementTriggerClause,
  scores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
): boolean {
  const checks: boolean[] = [];

  if (clause.deficiencySignal !== undefined) {
    checks.push(deficiencySignals[clause.deficiencySignal]);
  }

  if (clause.domainBelow) {
    const { domain, threshold } = clause.domainBelow;
    checks.push(scores[domain] < threshold);
  }

  if (clause.domainAbove) {
    const { domain, threshold } = clause.domainAbove;
    checks.push(scores[domain] > threshold);
  }

  if (clause.profileLabel !== undefined) {
    checks.push(profileLabel.name === clause.profileLabel);
  }

  return checks.length > 0 && checks.every(Boolean);
}

function definitionMatches(
  def: SupplementRecommendation,
  scores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): boolean {
  if (def.fallbackOnly) {
    return false;
  }

  if (def.id === "zink") {
    return matchesZink(scores, profileLabel);
  }

  if (def.id === "creatine") {
    return matchesCreatine(scores, profileLabel, answers);
  }

  return def.triggers.anyOf.some((clause) =>
    clauseMatches(clause, scores, deficiencySignals, profileLabel),
  );
}

export function getSupplementRoute(
  domainScores: DomainScores,
  deficiencySignals: DeficiencySignals,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): SupplementRecommendation[] {
  const matched: SupplementRecommendation[] = [];

  for (const def of SUPPLEMENT_ROUTE_DEFINITIONS) {
    if (
      definitionMatches(
        def,
        domainScores,
        deficiencySignals,
        profileLabel,
        answers,
      )
    ) {
      matched.push(def);
    }
  }

  if (matched.length === 0) {
    const fallback = SUPPLEMENT_ROUTE_DEFINITIONS.find((d) => d.fallbackOnly);
    if (fallback) {
      matched.push(fallback);
    }
  }

  const byId = new Map<string, SupplementRecommendation>();
  for (const item of matched.sort((a, b) => a.priority - b.priority)) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()].slice(0, 3);
}

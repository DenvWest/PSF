import { approvedClaims, ON_HOLD_DISCLAIMER } from "@/data/approved-claims";
import {
  getCatalogEntryById,
  getCatalogEntryForPillar,
  SUPPLEMENT_CATALOG,
  type CatalogTriggerClause,
  type HubLegacyRule,
  type SupplementCatalogEntry,
} from "@/data/supplement-catalog";
import type { DomainKey } from "@/data/nurture-content";
import { DOMAIN_SUPPLEMENT_CANDIDATES } from "@/data/domain-supplement-candidates";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import { getSortedDomains } from "@/lib/intake-engine";
import { isComparisonAllowed } from "@/lib/comparison-availability";
import { isSupplementAvailable } from "@/lib/supplement-availability";
import type {
  RankedRecommendation,
  RecommendationInput,
  RecommendationReason,
  RecommendationSource,
  RecommendationTriggerReason,
} from "@/types/recommendation";
import type { PillarId } from "@/types/dashboard";

function intAnswer(answers: Record<string, number>, key: string): number {
  const value = answers[key];
  return typeof value === "number" ? value : 0;
}

function getMovementLoad(answers: Record<string, number>): number {
  return Math.max(intAnswer(answers, "MOV_CARD"), intAnswer(answers, "MOV_STR"));
}

export function matchesOvertrainerAnswers(answers: Record<string, number>): boolean {
  return getMovementLoad(answers) >= 3 && intAnswer(answers, "RCV_PHYS") <= 1;
}

function matchesZink(scores: DomainScores): boolean {
  return (
    scores.recovery_score < 40 ||
    scores.nutrition_score < 40 ||
    getSortedDomains(scores)[0].domain === "recovery"
  );
}

function matchesCreatine(
  scores: DomainScores,
  profileLabel: ProfileLabel,
  answers: Record<string, number>,
): boolean {
  const movementLoad = getMovementLoad(answers);
  const strengthTraining = intAnswer(answers, "MOV_STR");
  const activeExerciser = movementLoad >= 2 || strengthTraining >= 3;
  const poorRecovery = scores.recovery_score < 50;
  const cognitiveLoad = scores.energy_score < 50 && scores.stress_score < 50;
  const relevantProfile =
    getSortedDomains(scores)[0].domain === "recovery" ||
    profileLabel.name === "Lage Batterij";

  return (
    activeExerciser ||
    poorRecovery ||
    cognitiveLoad ||
    relevantProfile ||
    matchesOvertrainerAnswers(answers)
  );
}

function clauseMatches(
  clause: CatalogTriggerClause,
  scores: DomainScores,
  signals: DeficiencySignals,
  profileLabel: ProfileLabel,
): RecommendationTriggerReason[] | null {
  const triggered: RecommendationTriggerReason[] = [];

  if (clause.deficiencySignal !== undefined) {
    if (!signals[clause.deficiencySignal]) {
      return null;
    }
    triggered.push({ type: "signal", signal: clause.deficiencySignal });
  }

  if (clause.domainBelow) {
    const { domain, threshold } = clause.domainBelow;
    if (scores[domain] >= threshold) {
      return null;
    }
    triggered.push({
      type: "domain_below",
      domain,
      score: scores[domain],
      threshold,
    });
  }

  if (clause.domainAbove) {
    const { domain, threshold } = clause.domainAbove;
    if (scores[domain] <= threshold) {
      return null;
    }
    triggered.push({
      type: "domain_below",
      domain,
      score: scores[domain],
      threshold,
    });
  }

  if (clause.profileLabel !== undefined) {
    if (profileLabel.name !== clause.profileLabel) {
      return null;
    }
    triggered.push({ type: "profile", label: profileLabel.name });
  }

  return triggered.length > 0 ? triggered : null;
}

function routeEntryMatches(
  entry: SupplementCatalogEntry,
  input: RecommendationInput,
): RecommendationTriggerReason[] {
  if (entry.fallbackOnly) {
    return [];
  }

  if (entry.customMatcher === "zink") {
    return matchesZink(input.scores)
      ? [{ type: "domain_below", domain: "recovery_score", score: input.scores.recovery_score, threshold: 40 }]
      : [];
  }

  if (entry.customMatcher === "creatine") {
    return matchesCreatine(input.scores, input.profileLabel, input.answers)
      ? [{ type: "hub_legacy", rule: "creatine_custom_matcher" }]
      : [];
  }

  const clauses = entry.routeTriggers?.anyOf ?? [];
  for (const clause of clauses) {
    const reasons = clauseMatches(
      clause,
      input.scores,
      input.signals,
      input.profileLabel,
    );
    if (reasons) {
      return reasons;
    }
  }

  return [];
}

function hubRuleMatches(
  rule: HubLegacyRule,
  input: RecommendationInput,
  selectedHubSlugs: Set<string>,
): RecommendationTriggerReason | null {
  const { scores, signals, answers } = input;

  switch (rule) {
    case "sleep_or_stress_below_50":
      if (scores.sleep_score < 50 || scores.stress_score < 50) {
        return { type: "hub_legacy", rule };
      }
      return null;
    case "recovery_below_40_no_magnesium":
      if (scores.recovery_score < 40 && !selectedHubSlugs.has("magnesium")) {
        return { type: "hub_legacy", rule };
      }
      return null;
    case "omega3_answer_low_or_nutrition_below_40": {
      const omega3Answer = answers.NUT_O3 ?? 0;
      if (omega3Answer <= 1 || scores.nutrition_score < 40) {
        return { type: "hub_legacy", rule };
      }
      return null;
    }
    case "protein_gap_signal":
      return signals.protein_gap_signal
        ? { type: "signal", signal: "protein_gap_signal" }
        : null;
    case "energy_below_40":
      return scores.energy_score < 40
        ? {
            type: "domain_below",
            domain: "energy_score",
            score: scores.energy_score,
            threshold: 40,
          }
        : null;
    case "vitamin_d_fallback":
      return { type: "hub_legacy", rule };
    default:
      return null;
  }
}

function isEntryAvailable(entry: SupplementCatalogEntry): boolean {
  if (!isSupplementAvailable(entry.availabilitySlug)) {
    return false;
  }
  if (entry.hasComparison && !isComparisonAllowed(entry.availabilitySlug)) {
    return false;
  }
  return entry.comparisonPath !== null;
}

function buildReason(
  triggeredBy: RecommendationTriggerReason[],
  claimKey: SupplementCatalogEntry["claimKey"],
): RecommendationReason {
  const entry = approvedClaims[claimKey];
  return {
    triggeredBy,
    efsaNote: entry.status === "on_hold" ? ON_HOLD_DISCLAIMER : undefined,
  };
}

function toRankedRecommendation(
  entry: SupplementCatalogEntry,
  rank: number,
  reason: RecommendationReason,
): RankedRecommendation {
  const claimEntry = approvedClaims[entry.claimKey];
  const available = isEntryAvailable(entry);

  return {
    supplementId: entry.id,
    comparisonPath: entry.comparisonPath ?? "",
    efsaStatus: claimEntry.status,
    domains: entry.domains,
    rank,
    reason,
    available,
    hubSlug: entry.hubSlug,
  };
}

function collectRouteRecommendations(input: RecommendationInput): RankedRecommendation[] {
  const matched: RankedRecommendation[] = [];

  for (const entry of SUPPLEMENT_CATALOG) {
    const triggeredBy = routeEntryMatches(entry, input);
    if (triggeredBy.length === 0) {
      continue;
    }
    matched.push(toRankedRecommendation(entry, entry.priority, buildReason(triggeredBy, entry.claimKey)));
  }

  if (matched.length === 0) {
    const fallback = SUPPLEMENT_CATALOG.find((entry) => entry.fallbackOnly && isEntryAvailable(entry));
    if (fallback) {
      matched.push(
        toRankedRecommendation(
          fallback,
          fallback.priority,
          buildReason([{ type: "hub_legacy", rule: "fallback_only" }], fallback.claimKey),
        ),
      );
    }
  }

  const byId = new Map<string, RankedRecommendation>();
  for (const item of matched.sort((left, right) => left.rank - right.rank)) {
    if (!byId.has(item.supplementId)) {
      byId.set(item.supplementId, item);
    }
  }

  return [...byId.values()].slice(0, 3);
}

function collectHubRecommendations(input: RecommendationInput): RankedRecommendation[] {
  const matched: RankedRecommendation[] = [];
  const selectedHubSlugs = new Set<string>();

  for (const entry of SUPPLEMENT_CATALOG) {
    if (!entry.hubRules?.length) {
      continue;
    }

    for (const rule of entry.hubRules) {
      if (rule === "vitamin_d_fallback") {
        continue;
      }

      const trigger = hubRuleMatches(rule, input, selectedHubSlugs);
      if (!trigger || !entry.hubSlug) {
        continue;
      }

      if (selectedHubSlugs.has(entry.hubSlug)) {
        break;
      }

      matched.push(
        toRankedRecommendation(entry, matched.length + 1, buildReason([trigger], entry.claimKey)),
      );
      selectedHubSlugs.add(entry.hubSlug);
      break;
    }
  }

  if (matched.length < 2) {
    const fallback = SUPPLEMENT_CATALOG.find((entry) =>
      entry.hubRules?.includes("vitamin_d_fallback"),
    );
    if (fallback && fallback.hubSlug && !selectedHubSlugs.has(fallback.hubSlug)) {
      matched.push(
        toRankedRecommendation(
          fallback,
          matched.length + 1,
          buildReason([{ type: "hub_legacy", rule: "vitamin_d_fallback" }], fallback.claimKey),
        ),
      );
    }
  }

  return matched.slice(0, 3);
}

function collectNurtureRecommendation(
  input: RecommendationInput,
  domain: DomainKey,
): RankedRecommendation | null {
  const candidates = DOMAIN_SUPPLEMENT_CANDIDATES[domain];

  for (const claimKey of candidates) {
    const entry = SUPPLEMENT_CATALOG.find((item) => item.claimKey === claimKey);
    if (!entry || !isEntryAvailable(entry) || !entry.comparisonPath?.startsWith("/beste/")) {
      continue;
    }

    return toRankedRecommendation(
      entry,
      1,
      buildReason([{ type: "hub_legacy", rule: `nurture_domain_${domain}` }], entry.claimKey),
    );
  }

  return null;
}

export function getRecommendations(
  input: RecommendationInput,
  options: { source?: RecommendationSource; domain?: DomainKey } = {},
): RankedRecommendation[] {
  const source = options.source ?? "route";

  if (source === "hub") {
    return collectHubRecommendations(input);
  }

  if (source === "nurture" && options.domain) {
    const recommendation = collectNurtureRecommendation(input, options.domain);
    return recommendation ? [recommendation] : [];
  }

  return collectRouteRecommendations(input);
}

export function getPillarRecommendation(
  input: RecommendationInput,
  pillarId: PillarId,
): RankedRecommendation | null {
  const entry = getCatalogEntryForPillar(pillarId);
  if (!entry || !entry.comparisonPath) {
    return null;
  }

  if (!isEntryAvailable(entry)) {
    return null;
  }

  return toRankedRecommendation(
    entry,
    1,
    buildReason([{ type: "pillar", pillarId }], entry.claimKey),
  );
}

export function getCatalogEntry(id: string): SupplementCatalogEntry | undefined {
  return getCatalogEntryById(id);
}

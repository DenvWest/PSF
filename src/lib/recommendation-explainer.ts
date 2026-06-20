import {
  domainBelowTemplate,
  EFSA_ON_HOLD_NOTE,
  getHubRuleCopy,
  getSignalCopy,
  DOMAIN_LABELS,
  LIFESTYLE_FIRST_GENERIC,
  PILLAR_CONTEXT_COPY,
  PROFILE_COPY,
  supplementRationaleTemplate,
  TRUST_LINE,
} from "@/data/explanation-copy";
import type {
  ExplanationContext,
  ExplanationFactor,
  RecommendationExplanation,
} from "@/types/recommendation-explanation";
import type {
  RankedRecommendation,
  RecommendationTriggerReason,
} from "@/types/recommendation";

function triggerToKind(
  raw: RecommendationTriggerReason,
): ExplanationFactor["kind"] {
  switch (raw.type) {
    case "domain_below":
    case "hub_legacy":
      return "measurement";
    case "signal":
      return "signal";
    case "profile":
      return "profile";
    case "pillar":
      return "context";
  }
}

function triggerToText(raw: RecommendationTriggerReason): string {
  switch (raw.type) {
    case "signal":
      return getSignalCopy(raw.signal);
    case "domain_below":
      return domainBelowTemplate(DOMAIN_LABELS[raw.domain]);
    case "profile":
      return PROFILE_COPY[raw.label] ?? "";
    case "hub_legacy":
      return getHubRuleCopy(raw.rule);
    case "pillar":
      return PILLAR_CONTEXT_COPY[raw.pillarId] ?? "";
  }
}

function triggerToDebugToken(raw: RecommendationTriggerReason): string {
  switch (raw.type) {
    case "signal":
      return `signal:${raw.signal}`;
    case "domain_below":
      return `domain_below:${raw.domain}<${raw.threshold}`;
    case "profile":
      return `profile:${raw.label}`;
    case "hub_legacy":
      return `hub_legacy:${raw.rule}`;
    case "pillar":
      return `pillar:${raw.pillarId}`;
  }
}

function buildDebugPrefix(triggeredBy: RecommendationTriggerReason[]): string {
  if (
    triggeredBy.length === 1 &&
    triggeredBy[0].type === "pillar"
  ) {
    return "pillar";
  }
  return "route";
}

export function explainRecommendation(
  recommendation: RankedRecommendation,
  context: ExplanationContext,
): RecommendationExplanation {
  const triggeredBy = recommendation.reason.triggeredBy;

  const factors: ExplanationFactor[] = triggeredBy
    .map((raw) => ({
      kind: triggerToKind(raw),
      text: triggerToText(raw),
      raw,
    }))
    .filter((factor) => factor.text.length > 0);

  const lifestyleFirst = context.lifestyleStep
    ? `Leefstijl eerst: ${context.lifestyleStep.title}. ${context.lifestyleStep.detail}`
    : LIFESTYLE_FIRST_GENERIC;

  const supplementRationale = supplementRationaleTemplate(
    context.supplement.name,
  );

  const isApproved = recommendation.efsaStatus === "approved";

  const debugPrefix = buildDebugPrefix(triggeredBy);
  const triggerTokens = triggeredBy.map(triggerToDebugToken).join("|");
  const debug = `${debugPrefix}|${triggerTokens}|grade:${context.supplement.grade}`;

  return {
    factors,
    lifestyleFirst,
    supplementRationale,
    efsaClaim: isApproved ? context.supplement.claim : undefined,
    efsaNote: isApproved ? undefined : EFSA_ON_HOLD_NOTE,
    evidenceGrade: context.supplement.grade,
    trustLine: TRUST_LINE,
    debug,
  };
}

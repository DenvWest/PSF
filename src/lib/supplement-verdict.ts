import { approvedClaims, type IngredientClaimKey } from "@/data/approved-claims";
import { SUPPLEMENT_CATALOG } from "@/data/supplement-catalog";
import { collectVerdictTriggers } from "@/lib/recommendation-engine";
import { isSupplementAvailable } from "@/lib/supplement-availability";
import {
  canShowSupplementStrip,
  type SupplementEligibilityOptions,
} from "@/lib/supplement-eligibility";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import type { RecommendationInput, RecommendationTriggerReason } from "@/types/recommendation";
import type {
  SupplementVerdict,
  VerdictEvidence,
  VerdictReasonKey,
  VerdictValue,
} from "@/types/verdict";

/**
 * Hoe lang een oordeel meegaat voordat het opnieuw getoetst wordt.
 *
 * 30 dagen bij eerst_leefstijl volgt de bestaande hermeet-cyclus; 90 dagen bij
 * kopen valt samen met een gangbare pothorizon; nooit vervalt niet op
 * gebruikersdata, alleen op regelgeving.
 */
export const VERDICT_REVIEW_DAYS: Record<VerdictValue, number | null> = {
  kopen: 90,
  niet_nodig: 180,
  eerst_leefstijl: 30,
  nooit: null,
};

const INGREDIENT_KEYS = Object.keys(approvedClaims) as IngredientClaimKey[];

function catalogEntryFor(ingredientKey: IngredientClaimKey) {
  return SUPPLEMENT_CATALOG.find((entry) => entry.claimKey === ingredientKey);
}

function buildEvidence(
  input: RecommendationInput,
  triggeredBy: RecommendationTriggerReason[],
  nutritionLogCompleted: boolean,
): VerdictEvidence {
  return {
    scores: input.scores,
    signals: input.signals,
    profileLabel: input.profileLabel.name,
    triggeredBy,
    nutritionLogCompleted,
  };
}

function resolve(
  ingredientKey: IngredientClaimKey,
  triggeredBy: RecommendationTriggerReason[],
  eligibility: SupplementEligibilityOptions | undefined,
): { verdict: VerdictValue; reasonKey: VerdictReasonKey; comparisonPath: string | null } {
  const claim = approvedClaims[ingredientKey];

  if (claim.status === "forbidden") {
    return { verdict: "nooit", reasonKey: "claim_forbidden", comparisonPath: null };
  }

  if (claim.status === "on_hold") {
    return { verdict: "eerst_leefstijl", reasonKey: "claim_on_hold", comparisonPath: null };
  }

  const entry = catalogEntryFor(ingredientKey);
  const comparisonPath = resolveGatedComparisonPath(ingredientKey);
  if (!comparisonPath || (entry && !isSupplementAvailable(entry.availabilitySlug))) {
    return {
      verdict: "eerst_leefstijl",
      reasonKey: "comparison_unavailable",
      comparisonPath: null,
    };
  }

  if (!canShowSupplementStrip(eligibility)) {
    return {
      verdict: "eerst_leefstijl",
      reasonKey: "nutrition_log_incomplete",
      comparisonPath,
    };
  }

  if (triggeredBy.length === 0) {
    return { verdict: "niet_nodig", reasonKey: "no_trigger_matched", comparisonPath };
  }

  return { verdict: "kopen", reasonKey: "trigger_matched", comparisonPath };
}

/**
 * Het oordeel voor één ingrediënt.
 *
 * Volgorde is bewust: een verboden claim wint altijd, daarna on-hold, daarna de
 * beschikbaarheid van een vergelijking, daarna of we überhaupt genoeg weten om
 * "niet nodig" te mogen zeggen. Pas als dat allemaal klopt, kijken we of er een
 * reden is om het wél aan te raden.
 */
export function deriveSupplementVerdict(
  ingredientKey: IngredientClaimKey,
  input: RecommendationInput,
  eligibility?: SupplementEligibilityOptions,
): SupplementVerdict {
  const entry = catalogEntryFor(ingredientKey);
  const triggeredBy = entry ? collectVerdictTriggers(entry, input) : [];
  const { verdict, reasonKey, comparisonPath } = resolve(
    ingredientKey,
    triggeredBy,
    eligibility,
  );

  return {
    ingredientKey,
    verdict,
    reasonKey,
    comparisonPath,
    nextReviewInDays: VERDICT_REVIEW_DAYS[verdict],
    rulesVersion: input.rulesVersion,
    evidence: buildEvidence(input, triggeredBy, canShowSupplementStrip(eligibility)),
  };
}

/** Oordeel over het volledige ingrediëntenveld — ook de ingrediënten die op "nee" uitkomen. */
export function deriveSupplementVerdicts(
  input: RecommendationInput,
  eligibility?: SupplementEligibilityOptions,
): SupplementVerdict[] {
  return INGREDIENT_KEYS.map((ingredientKey) =>
    deriveSupplementVerdict(ingredientKey, input, eligibility),
  );
}

export function resolveNextReviewDate(
  verdict: SupplementVerdict,
  from: Date = new Date(),
): string | null {
  if (verdict.nextReviewInDays === null) {
    return null;
  }
  const due = new Date(from.getTime());
  due.setUTCDate(due.getUTCDate() + verdict.nextReviewInDays);
  return due.toISOString().slice(0, 10);
}

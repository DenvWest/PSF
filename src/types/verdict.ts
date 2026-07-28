import type { IngredientClaimKey } from "@/data/approved-claims";
import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import type { RecommendationTriggerReason } from "@/types/recommendation";

/** Wat wij van dit ingrediënt vinden voor dit account, nu. */
export type VerdictValue = "kopen" | "niet_nodig" | "eerst_leefstijl" | "nooit";

export type VerdictReasonKey =
  | "claim_forbidden"
  | "claim_on_hold"
  | "comparison_unavailable"
  | "nutrition_log_incomplete"
  | "no_trigger_matched"
  | "trigger_matched";

/** Reproduceerbaarheids-snapshot: waarop rustte dit oordeel? */
export interface VerdictEvidence {
  scores: DomainScores;
  signals: DeficiencySignals;
  profileLabel: ProfileLabel["name"];
  triggeredBy: RecommendationTriggerReason[];
  nutritionLogCompleted: boolean;
}

export interface SupplementVerdict {
  ingredientKey: IngredientClaimKey;
  verdict: VerdictValue;
  reasonKey: VerdictReasonKey;
  comparisonPath: string | null;
  nextReviewInDays: number | null;
  rulesVersion: string;
  evidence: VerdictEvidence;
}

/** Zoals opgeslagen: alleen de velden die het ritme en de historie nodig hebben. */
export interface StoredSupplementVerdict {
  id: string;
  ingredientKey: string;
  verdict: VerdictValue;
  reasonKey: string;
  rulesVersion: string;
  nextReviewAt: string | null;
  createdAt: string;
  supersededAt: string | null;
  /** Reproduceerbaarheids-snapshot uit `based_on`; null bij oudere rijen zonder snapshot. */
  basedOn: VerdictEvidence | null;
}

import type { DeficiencySignals, DomainScores, ProfileLabel } from "@/lib/intake-engine";
import type { ClaimStatus } from "@/data/approved-claims";
import type { PillarId } from "@/types/dashboard";

export interface RecommendationInput {
  scores: DomainScores;
  signals: DeficiencySignals;
  profileLabel: ProfileLabel;
  answers: Record<string, number>;
  rulesVersion: string;
}

export type RecommendationTriggerReason =
  | { type: "domain_below"; domain: keyof DomainScores; score: number; threshold: number }
  | { type: "signal"; signal: keyof DeficiencySignals }
  | { type: "profile"; label: ProfileLabel["name"] }
  | { type: "hub_legacy"; rule: string }
  | { type: "pillar"; pillarId: PillarId };

export interface RecommendationReason {
  triggeredBy: RecommendationTriggerReason[];
  efsaNote?: string;
}

export interface RankedRecommendation {
  supplementId: string;
  comparisonPath: string;
  efsaStatus: ClaimStatus;
  domains: string[];
  rank: number;
  reason: RecommendationReason;
  available: boolean;
  hubSlug?: string;
  tier?: number;
}

export type RecommendationSource = "route" | "hub" | "nurture";

import type { RecommendationTriggerReason } from "@/types/recommendation";

export interface ExplanationFactor {
  kind: "measurement" | "signal" | "profile" | "context";
  text: string;
  raw: RecommendationTriggerReason;
}

export interface RecommendationExplanation {
  factors: ExplanationFactor[];
  lifestyleFirst: string;
  supplementRationale: string;
  efsaClaim?: string;
  efsaNote?: string;
  evidenceGrade?: string;
  trustLine: string;
  debug: string;
}

export interface ExplanationContext {
  lifestyleStep?: { title: string; detail: string };
  supplement: { name: string; claim: string; grade: string };
}

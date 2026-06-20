import {
  getDeficiencySignals,
  getProfileLabel,
  RULES_VERSION,
  type DeficiencySignals,
  type DomainScores,
} from "@/lib/intake-engine";
import type { RecommendationInput } from "@/types/recommendation";

const EMPTY_DEFICIENCY_SIGNALS: DeficiencySignals = {
  omega3_deficiency: false,
  magnesium_signal: false,
  cortisol_risk: false,
  creatine_signal: false,
  melatonine_signal: false,
  protein_gap_signal: false,
  low_recovery_no_load: false,
  sleep_issue_no_stress: false,
  energy_dip_unexplained: false,
};

// Adaptive input seam — extend here for check-ins, dashboard answers, and remeasurement deltas.
export function buildRecommendationInput(ctx: {
  scores: DomainScores;
  answers?: Record<string, number>;
}): RecommendationInput {
  return {
    scores: ctx.scores,
    signals: ctx.answers ? getDeficiencySignals(ctx.answers) : EMPTY_DEFICIENCY_SIGNALS,
    profileLabel: getProfileLabel(ctx.scores),
    answers: ctx.answers ?? {},
    rulesVersion: RULES_VERSION,
  };
}

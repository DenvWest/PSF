export type InterventionScoreInput = {
  scoreMoeite: number;
  scoreMechanisme: number;
  scoreOnderbouwing: number;
  scoreVeiligheid: number;
};

const MIN_SCORE = 1;
const MAX_SCORE = 5;
const SAFETY_THRESHOLD = 4;

export function isValidInterventionScore(value: number): boolean {
  return (
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= MIN_SCORE &&
    value <= MAX_SCORE
  );
}

export function passesSafetyFilter(scores: InterventionScoreInput): boolean {
  return (
    isValidInterventionScore(scores.scoreVeiligheid) &&
    scores.scoreVeiligheid >= SAFETY_THRESHOLD
  );
}

export function computeCompositeScore(scores: InterventionScoreInput): number {
  if (!passesSafetyFilter(scores)) {
    return 0;
  }
  if (
    !isValidInterventionScore(scores.scoreMoeite) ||
    !isValidInterventionScore(scores.scoreMechanisme) ||
    !isValidInterventionScore(scores.scoreOnderbouwing)
  ) {
    return 0;
  }
  return (
    (scores.scoreMechanisme * scores.scoreOnderbouwing * scores.scoreVeiligheid) /
    scores.scoreMoeite
  );
}

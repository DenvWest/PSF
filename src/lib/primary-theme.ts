import {
  PILLAR_SCORE_KEYS,
  type PillarId,
} from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import { matchesOvertrainerAnswers } from "@/lib/getSupplementRoute";

export type MeasuredPillarId = Exclude<PillarId, "connection">;

const TIEBREAK_ORDER: readonly MeasuredPillarId[] = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
];

const MEASURED_PILLARS: readonly MeasuredPillarId[] = TIEBREAK_ORDER;

function getPillarScore(
  scores: DomainScores,
  pillar: MeasuredPillarId,
): number {
  const key = PILLAR_SCORE_KEYS[pillar];
  if (!key) {
    return Number.POSITIVE_INFINITY;
  }
  const score = scores[key];
  return Number.isFinite(score) ? score : Number.POSITIVE_INFINITY;
}

function pickLowestPillar(scores: DomainScores): MeasuredPillarId {
  let lowest: MeasuredPillarId = TIEBREAK_ORDER[0];
  let lowestScore = getPillarScore(scores, lowest);

  for (const pillar of MEASURED_PILLARS) {
    const score = getPillarScore(scores, pillar);
    if (score < lowestScore) {
      lowest = pillar;
      lowestScore = score;
      continue;
    }
    if (score === lowestScore) {
      const currentIndex = TIEBREAK_ORDER.indexOf(lowest);
      const candidateIndex = TIEBREAK_ORDER.indexOf(pillar);
      if (candidateIndex < currentIndex) {
        lowest = pillar;
      }
    }
  }

  return lowest;
}

export function getPrimaryTheme(
  scores: DomainScores,
  answers: Record<string, number>,
): MeasuredPillarId {
  if (matchesOvertrainerAnswers(answers)) {
    return "movement";
  }

  return pickLowestPillar(scores);
}

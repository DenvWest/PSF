import {
  PILLAR_SCORE_KEYS,
  type PillarId,
} from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import { matchesOvertrainerAnswers } from "@/lib/recommendation-engine";

export type MeasuredPillarId = PillarId;

const TIEBREAK_ORDER: readonly MeasuredPillarId[] = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
  "connection",
];

const MEASURED_PILLARS: readonly MeasuredPillarId[] = TIEBREAK_ORDER;

/** Drempel waaronder een pijler als "prioriteit" geldt (sluit aan op getDisplayStatus < 40). */
const PRIORITY_THRESHOLD = 40;

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

/** Pijlers op oplopende score (tiebreak: sleep > stress > nutrition > movement). */
function getPillarsByScoreAscending(scores: DomainScores): MeasuredPillarId[] {
  return [...MEASURED_PILLARS].sort((a, b) => {
    const diff = getPillarScore(scores, a) - getPillarScore(scores, b);
    if (diff !== 0) {
      return diff;
    }
    return TIEBREAK_ORDER.indexOf(a) - TIEBREAK_ORDER.indexOf(b);
  });
}

/** Beweging telt als "staat er goed voor" vanaf Voldoende (>= 60, zie getDisplayStatus). */
const MOVEMENT_OK_THRESHOLD = 60;

/** Laagste gemeten pijler, met de bestaande movement->nutrition/stress verfijning. */
function resolveBaseTheme(scores: DomainScores): MeasuredPillarId {
  const base = pickLowestPillar(scores);

  if (
    base === "movement" &&
    Number.isFinite(scores.movement_score) &&
    scores.movement_score < 50
  ) {
    if (
      Number.isFinite(scores.nutrition_score) &&
      scores.nutrition_score < 45
    ) {
      return "nutrition";
    }
    if (Number.isFinite(scores.stress_score) && scores.stress_score < 40) {
      return "stress";
    }
  }

  return base;
}

/**
 * Primair thema = laagste gemeten gebied.
 *
 * - Overtrainer-patroon -> alleen "movement" wanneer beweging ZELF zwak is (< 60).
 *   Staat beweging er goed voor, dan zou "beweging is je grootste prioriteit" de
 *   vitaliteit-strengthLine ("je beweging staat er goed voor") tegenspreken; dan wint
 *   de echt zwakste pijler en is de overtrainer-nuance een herstel-note (prompt 2).
 * - Anders argmin over {sleep, stress, nutrition, movement} met vaste tiebreak.
 * - Status (Sterk/Voldoende/Aandacht/Prioriteit) is alleen display, geen input.
 * - Ontbrekende/niet-finite scores -> alle gelijk -> tiebreak-winnaar "sleep",
 *   met monitoring-log zodat we hydratie-gaten zien.
 */
export function getPrimaryTheme(
  scores: DomainScores,
  answers: Record<string, number>,
): MeasuredPillarId {
  const allMissing = MEASURED_PILLARS.every(
    (pillar) => !Number.isFinite(getPillarScore(scores, pillar)),
  );
  if (allMissing) {
    console.error(
      "[getPrimaryTheme] geen finite scores; fallback naar tiebreak-winnaar 'sleep'",
    );
    return TIEBREAK_ORDER[0];
  }

  if (
    matchesOvertrainerAnswers(answers) &&
    Number.isFinite(scores.movement_score) &&
    scores.movement_score < MOVEMENT_OK_THRESHOLD
  ) {
    return "movement";
  }

  return resolveBaseTheme(scores);
}

/**
 * Tweede prioriteit: het op-een-na laagste gemeten gebied, maar alleen wanneer
 * minstens twee pijlers onder de prioriteitsdrempel (< 40) zitten. Anders null.
 * Sluit aan op randgeval B: één primaire CTA blijft de regel, het tweede thema
 * is een optionele micro-link op REVEAL.
 */
export function getSecondaryTheme(
  scores: DomainScores,
  answers: Record<string, number>,
  primary: MeasuredPillarId,
): MeasuredPillarId | null {
  const belowThreshold = MEASURED_PILLARS.filter(
    (pillar) => getPillarScore(scores, pillar) < PRIORITY_THRESHOLD,
  );
  if (belowThreshold.length < 2) {
    return null;
  }

  const ordered = getPillarsByScoreAscending(scores).filter(
    (pillar) => pillar !== primary,
  );
  const secondary = ordered[0];
  return secondary && getPillarScore(scores, secondary) < PRIORITY_THRESHOLD
    ? secondary
    : null;
}

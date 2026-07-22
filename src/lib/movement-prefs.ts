import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import type { QuestionId } from "@/data/intake-questions";
import {
  buildPlanIntakeContext,
  selectVisibleSteps,
} from "@/lib/lifestyle-plan-eval";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";
import {
  filterStepsForCategory,
  MOVEMENT_WEEK_PHASE_ID,
  WEEK_CATEGORY_OPTIONS,
  type WeekCategory,
} from "@/lib/movement-week-categories";
import type { DomainScores } from "@/lib/intake-engine";

/**
 * Beweeg-voorkeuren (B-1b): startpatroon + anker. Opslag als string-enums in
 * de answers-jsonb van de laatste geclaimde intake-sessie — parseAnswers()
 * blijft number-only, dus deze keys raken scoring/antwoorden nooit.
 * Score blijft engine-only; het anker kleurt uitsluitend copy.
 */

export const ANSWER_KEY_START_PATTERN = "preferredStartPattern";
export const ANSWER_KEY_MOVEMENT_ANCHOR = "movementAnchor";

export type MovementStartPattern = WeekCategory;

export type MovementAnchor =
  | "zelfstandigheid"
  | "meedoen"
  | "energie"
  | "kracht";

export type MovementPrefs = {
  startPattern: MovementStartPattern | null;
  anchor: MovementAnchor | null;
};

export const EMPTY_MOVEMENT_PREFS: MovementPrefs = {
  startPattern: null,
  anchor: null,
};

/** Startpatroon-opties = de bestaande week-categorieën (geen squat-default). */
export const MOVEMENT_START_PATTERN_OPTIONS = WEEK_CATEGORY_OPTIONS;

const START_PATTERN_IDS = new Set<string>(
  WEEK_CATEGORY_OPTIONS.map((option) => option.id),
);

/** Anker-opties §5a BEWEEG_COCKPIT_FUTURE_YOU.md — 1:1, 40+ default-toon. */
export const MOVEMENT_ANCHOR_OPTIONS: readonly {
  id: MovementAnchor;
  label: string;
  whySuffix: string;
}[] = [
  {
    id: "zelfstandigheid",
    label: "Zelf blijven doen wat ik wil — niemand nodig hebben",
    whySuffix:
      "Want jij wilt zelf blijven doen wat je wilt, zonder iemand nodig te hebben.",
  },
  {
    id: "meedoen",
    label: "Fit genoeg voor de mensen om me heen",
    whySuffix: "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
  },
  {
    id: "energie",
    label: "Aan het eind van de dag nog energie over",
    whySuffix:
      "Want jij wilt 's avonds nog energie overhouden, niet op wilskracht draaien.",
  },
  {
    id: "kracht",
    label: "Me sterk en capabel blijven voelen",
    whySuffix: "Want jij wilt je sterk en capabel blijven voelen.",
  },
] as const;

const ANCHOR_IDS = new Set<string>(
  MOVEMENT_ANCHOR_OPTIONS.map((option) => option.id),
);

export function isMovementStartPattern(
  value: unknown,
): value is MovementStartPattern {
  return typeof value === "string" && START_PATTERN_IDS.has(value);
}

export function isMovementAnchor(value: unknown): value is MovementAnchor {
  return typeof value === "string" && ANCHOR_IDS.has(value);
}

/** Leest de prefs uit een ruwe answers-jsonb (naast de numerieke antwoorden). */
export function parseMovementPrefs(raw: unknown): MovementPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return EMPTY_MOVEMENT_PREFS;
  }
  const record = raw as Record<string, unknown>;
  const pattern = record[ANSWER_KEY_START_PATTERN];
  const anchor = record[ANSWER_KEY_MOVEMENT_ANCHOR];
  return {
    startPattern: isMovementStartPattern(pattern) ? pattern : null,
    anchor: isMovementAnchor(anchor) ? anchor : null,
  };
}

export function buildAnchorWhySuffix(anchor: MovementAnchor | null): string | null {
  if (!anchor) {
    return null;
  }
  return (
    MOVEMENT_ANCHOR_OPTIONS.find((option) => option.id === anchor)?.whySuffix ??
    null
  );
}

export function startPatternLabel(pattern: MovementStartPattern): string {
  return (
    MOVEMENT_START_PATTERN_OPTIONS.find((option) => option.id === pattern)
      ?.label ?? pattern
  );
}

/**
 * Trainen-stap volgt het startpatroon: eerste zichtbare week-fase-stap in de
 * gekozen categorie (rustdag uitgesloten — die is de Herstel-keuze). Geen
 * match of `dagelijks_ritme` → day-model-stap (fallback blijft de SSOT-stap).
 */
export function resolvePatternTrainingStepId(
  domainScores: DomainScores,
  answers: Record<string, number>,
  pattern: MovementStartPattern | null,
  fallbackStepId: string,
): string {
  if (!pattern || pattern === "dagelijks_ritme") {
    return fallbackStepId;
  }

  const phase = movementPlanTemplate.phases.find(
    (entry) => entry.id === MOVEMENT_WEEK_PHASE_ID,
  );
  if (!phase) {
    return fallbackStepId;
  }

  const ctx = buildPlanIntakeContext(
    domainScores,
    answers as Record<QuestionId, number>,
    "movement",
  );
  const visible = selectVisibleSteps(phase, ctx);
  const match = filterStepsForCategory(visible, pattern).find(
    (step) => step.id !== REST_DAY_STEP_ID,
  );
  return match?.id ?? fallbackStepId;
}

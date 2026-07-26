import {
  ANSWER_KEY_MOVEMENT_ANCHOR,
  ANSWER_KEY_START_PATTERN,
  isMovementAnchor,
  isMovementStartPattern,
  parseMovementPrefs,
  type MovementAnchor,
  type MovementPrefs,
  type MovementStartPattern,
} from "@/lib/movement-prefs";
import type {
  MovementSport,
  MovementWeeklyFrequency,
} from "@/data/movement/session-catalog";
import type { StoredIntakeAnswers } from "@/types/intake-answers";

export const ANSWER_KEY_PREFERRED_SPORT = "preferredSport";
export const ANSWER_KEY_WEEKLY_FREQUENCY = "weeklyAvailability";

const SPORT_IDS = new Set<string>([
  "thuis",
  "sportschool",
  "wandelen",
  "fietsen",
  "zwemmen",
]);

const FREQUENCY_IDS = new Set<string>(["1x", "2x", "3x"]);

export function isMovementSport(value: unknown): value is MovementSport {
  return typeof value === "string" && SPORT_IDS.has(value);
}

export function isMovementWeeklyFrequency(
  value: unknown,
): value is MovementWeeklyFrequency {
  return typeof value === "string" && FREQUENCY_IDS.has(value);
}

export type MovementPlanProfile = MovementPrefs & {
  preferredSport: MovementSport | null;
  weeklyFrequency: MovementWeeklyFrequency | null;
};

export const EMPTY_MOVEMENT_PLAN_PROFILE: MovementPlanProfile = {
  startPattern: null,
  anchor: null,
  preferredSport: null,
  weeklyFrequency: null,
};

export function parseMovementPlanProfile(raw: unknown): MovementPlanProfile {
  const base = parseMovementPrefs(raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_MOVEMENT_PLAN_PROFILE, ...base };
  }
  const record = raw as Record<string, unknown>;
  const sport = record[ANSWER_KEY_PREFERRED_SPORT];
  const frequency = record[ANSWER_KEY_WEEKLY_FREQUENCY];
  return {
    ...base,
    preferredSport: isMovementSport(sport) ? sport : null,
    weeklyFrequency: isMovementWeeklyFrequency(frequency) ? frequency : null,
  };
}

/** Bevat deze answers-jsonb überhaupt een gezet plan-profiel? */
export function hasMovementPlanProfileValues(raw: unknown): boolean {
  const profile = parseMovementPlanProfile(raw);
  return (
    profile.startPattern !== null ||
    profile.anchor !== null ||
    profile.preferredSport !== null ||
    profile.weeklyFrequency !== null
  );
}

/**
 * Het plan-profiel leeft in de answers-jsonb van een sessie, niet in een eigen
 * tabel. Een hermeting maakt een nieuwe sessie met alleen verse antwoorden —
 * zonder deze overdracht is het anker (en daarmee de "waarom"-copy) na elke
 * cyclus weg. Alleen ontbrekende keys worden gevuld: wat de nieuwe check zelf
 * meestuurt wint altijd.
 */
export function carryOverMovementPlanProfile(
  previousAnswers: unknown,
  nextAnswers: StoredIntakeAnswers,
): StoredIntakeAnswers {
  const previous = parseMovementPlanProfile(previousAnswers);
  const next = parseMovementPlanProfile(nextAnswers);
  const carried: StoredIntakeAnswers = { ...nextAnswers };

  if (next.startPattern === null && previous.startPattern !== null) {
    carried[ANSWER_KEY_START_PATTERN] = previous.startPattern;
  }
  if (next.anchor === null && previous.anchor !== null) {
    carried[ANSWER_KEY_MOVEMENT_ANCHOR] = previous.anchor;
  }
  if (next.preferredSport === null && previous.preferredSport !== null) {
    carried[ANSWER_KEY_PREFERRED_SPORT] = previous.preferredSport;
  }
  if (next.weeklyFrequency === null && previous.weeklyFrequency !== null) {
    carried[ANSWER_KEY_WEEKLY_FREQUENCY] = previous.weeklyFrequency;
  }

  return carried;
}

export function defaultSportForPattern(
  pattern: MovementStartPattern | null,
): MovementSport | null {
  if (pattern === "kracht") {
    return "thuis";
  }
  if (pattern === "conditie") {
    return "wandelen";
  }
  return null;
}

export function defaultFrequencyForPattern(
  pattern: MovementStartPattern | null,
  movStr: number | undefined,
): MovementWeeklyFrequency {
  if (pattern === "dagelijks_ritme") {
    return "3x";
  }
  if (pattern === "conditie") {
    return "2x";
  }
  return movStr != null && movStr >= 3 ? "2x" : "1x";
}

export function resolveEffectivePlanProfile(
  profile: MovementPlanProfile,
  movStr: number | undefined,
): MovementPlanProfile {
  const startPattern = profile.startPattern;
  return {
    ...profile,
    preferredSport:
      profile.preferredSport ?? defaultSportForPattern(startPattern),
    weeklyFrequency:
      profile.weeklyFrequency ??
      defaultFrequencyForPattern(startPattern, movStr),
  };
}

export type MovementPlanProfilePatch = {
  startPattern?: MovementStartPattern;
  anchor?: MovementAnchor | null;
  preferredSport?: MovementSport;
  weeklyFrequency?: MovementWeeklyFrequency;
};

export function mergeMovementPlanProfilePatch(
  current: unknown,
  patch: MovementPlanProfilePatch,
): Record<string, unknown> {
  const record =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};

  if (patch.startPattern !== undefined && isMovementStartPattern(patch.startPattern)) {
    record.preferredStartPattern = patch.startPattern;
  }
  if (patch.anchor !== undefined) {
    if (patch.anchor === null) {
      delete record.movementAnchor;
    } else if (isMovementAnchor(patch.anchor)) {
      record.movementAnchor = patch.anchor;
    }
  }
  if (patch.preferredSport !== undefined && isMovementSport(patch.preferredSport)) {
    record[ANSWER_KEY_PREFERRED_SPORT] = patch.preferredSport;
  }
  if (
    patch.weeklyFrequency !== undefined &&
    isMovementWeeklyFrequency(patch.weeklyFrequency)
  ) {
    record[ANSWER_KEY_WEEKLY_FREQUENCY] = patch.weeklyFrequency;
  }

  return record;
}

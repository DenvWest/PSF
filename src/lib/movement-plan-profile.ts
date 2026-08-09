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
  MovementTrainingGuidance,
  MovementTrainingLocation,
  MovementWeeklyFrequency,
} from "@/data/movement/session-catalog";
import {
  ANSWER_KEY_TARGET_DAYS,
  ANSWER_KEY_TARGET_MINUTES,
  ANSWER_KEY_TARGET_STRENGTH,
  isMovementTargetDays,
  isMovementTargetMinutes,
  isMovementTargetStrength,
  type MovementTargetDays,
  type MovementTargetMinutes,
  type MovementTargetStrength,
} from "@/data/movement/targets";
import type { StoredIntakeAnswers } from "@/types/intake-answers";

export const ANSWER_KEY_PREFERRED_SPORT = "preferredSport";
export const ANSWER_KEY_WEEKLY_FREQUENCY = "weeklyAvailability";
export const ANSWER_KEY_TRAINING_LOCATION = "trainingLocation";
export const ANSWER_KEY_TRAINING_GUIDANCE = "trainingGuidance";
export const ANSWER_KEY_SPORTS = "sports";

const LOCATION_IDS = new Set<string>(["thuis", "sportschool"]);
const GUIDANCE_IDS = new Set<string>(["zelf", "groep", "coach", "onbekend"]);
const LEGACY_SPORT_TO_LOCATION: Record<string, MovementTrainingLocation> = {
  thuis: "thuis",
  sportschool: "sportschool",
};
const LEGACY_SPORT_TO_LENS: Record<string, string> = {
  wandelen: "hardlopen",
  fietsen: "wielrennen",
  zwemmen: "zwemmen",
};

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

export function isMovementTrainingLocation(
  value: unknown,
): value is MovementTrainingLocation {
  return typeof value === "string" && LOCATION_IDS.has(value);
}

export function isMovementTrainingGuidance(
  value: unknown,
): value is MovementTrainingGuidance {
  return typeof value === "string" && GUIDANCE_IDS.has(value);
}

export type MovementPlanProfile = MovementPrefs & {
  preferredSport: MovementSport | null;
  weeklyFrequency: MovementWeeklyFrequency | null;
  trainingLocation: MovementTrainingLocation | null;
  /** Met wie — los van waar. `onbekend` is een expliciet antwoord, geen ontbrekende waarde. */
  trainingGuidance: MovementTrainingGuidance | null;
  sports: string[];
  /** Zelf gezet doel — stuurt de programma-dosis. Zie `movement-target.ts`. */
  targetMinutes: MovementTargetMinutes | null;
  targetDays: MovementTargetDays | null;
  targetStrength: MovementTargetStrength | null;
};

export const EMPTY_MOVEMENT_PLAN_PROFILE: MovementPlanProfile = {
  startPattern: null,
  anchor: null,
  preferredSport: null,
  weeklyFrequency: null,
  trainingLocation: null,
  trainingGuidance: null,
  sports: [],
  targetMinutes: null,
  targetDays: null,
  targetStrength: null,
};

function parseSportsArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is string => typeof item === "string").slice(0, 3);
}

function migrateLegacyPreferredSport(
  sport: MovementSport | null,
  existingLocation: MovementTrainingLocation | null,
  existingSports: string[],
): { trainingLocation: MovementTrainingLocation | null; sports: string[] } {
  if (!sport) {
    return { trainingLocation: existingLocation, sports: existingSports };
  }
  const mappedLocation = LEGACY_SPORT_TO_LOCATION[sport];
  const mappedSport = LEGACY_SPORT_TO_LENS[sport];
  return {
    trainingLocation: existingLocation ?? mappedLocation ?? null,
    sports:
      existingSports.length > 0
        ? existingSports
        : mappedSport
          ? [mappedSport]
          : [],
  };
}

export function parseMovementPlanProfile(raw: unknown): MovementPlanProfile {
  const base = parseMovementPrefs(raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_MOVEMENT_PLAN_PROFILE, ...base };
  }
  const record = raw as Record<string, unknown>;
  const sport = record[ANSWER_KEY_PREFERRED_SPORT];
  const frequency = record[ANSWER_KEY_WEEKLY_FREQUENCY];
  const locationRaw = record[ANSWER_KEY_TRAINING_LOCATION];
  const guidanceRaw = record[ANSWER_KEY_TRAINING_GUIDANCE];
  const sportsRaw = record[ANSWER_KEY_SPORTS];
  const preferredSport = isMovementSport(sport) ? sport : null;
  let trainingLocation = isMovementTrainingLocation(locationRaw) ? locationRaw : null;
  let sports = parseSportsArray(sportsRaw);
  const migrated = migrateLegacyPreferredSport(preferredSport, trainingLocation, sports);
  trainingLocation = migrated.trainingLocation;
  sports = migrated.sports;

  const targetMinutes = record[ANSWER_KEY_TARGET_MINUTES];
  const targetDays = record[ANSWER_KEY_TARGET_DAYS];
  const targetStrength = record[ANSWER_KEY_TARGET_STRENGTH];

  return {
    ...base,
    preferredSport,
    weeklyFrequency: isMovementWeeklyFrequency(frequency) ? frequency : null,
    trainingLocation,
    trainingGuidance: isMovementTrainingGuidance(guidanceRaw) ? guidanceRaw : null,
    sports,
    targetMinutes: isMovementTargetMinutes(targetMinutes) ? targetMinutes : null,
    targetDays: isMovementTargetDays(targetDays) ? targetDays : null,
    targetStrength: isMovementTargetStrength(targetStrength) ? targetStrength : null,
  };
}

/** Bevat deze answers-jsonb überhaupt een gezet plan-profiel? */
export function hasMovementPlanProfileValues(raw: unknown): boolean {
  const profile = parseMovementPlanProfile(raw);
  return (
    profile.startPattern !== null ||
    profile.anchor !== null ||
    profile.preferredSport !== null ||
    profile.weeklyFrequency !== null ||
    profile.trainingLocation !== null ||
    profile.trainingGuidance !== null ||
    profile.sports.length > 0 ||
    profile.targetMinutes !== null ||
    profile.targetDays !== null ||
    profile.targetStrength !== null
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
  if (next.trainingLocation === null && previous.trainingLocation !== null) {
    carried[ANSWER_KEY_TRAINING_LOCATION] = previous.trainingLocation;
  }
  if (next.trainingGuidance === null && previous.trainingGuidance !== null) {
    carried[ANSWER_KEY_TRAINING_GUIDANCE] = previous.trainingGuidance;
  }
  if (next.sports.length === 0 && previous.sports.length > 0) {
    carried[ANSWER_KEY_SPORTS] = previous.sports;
  }
  if (next.weeklyFrequency === null && previous.weeklyFrequency !== null) {
    carried[ANSWER_KEY_WEEKLY_FREQUENCY] = previous.weeklyFrequency;
  }
  if (next.targetMinutes === null && previous.targetMinutes !== null) {
    carried[ANSWER_KEY_TARGET_MINUTES] = previous.targetMinutes;
  }
  if (next.targetDays === null && previous.targetDays !== null) {
    carried[ANSWER_KEY_TARGET_DAYS] = previous.targetDays;
  }
  if (next.targetStrength === null && previous.targetStrength !== null) {
    carried[ANSWER_KEY_TARGET_STRENGTH] = previous.targetStrength;
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

const WEEKLY_FREQUENCY_LABEL: Record<MovementWeeklyFrequency, string> = {
  "1x": "1× per week",
  "2x": "2× per week",
  "3x": "3× per week",
};

const TRAINING_LOCATION_LABEL: Record<MovementTrainingLocation, string> = {
  thuis: "thuis",
  sportschool: "sportschool",
};

/** `onbekend` heeft bewust geen label — die waarde valt weg uit de preview (zie hieronder). */
const TRAINING_GUIDANCE_LABEL: Partial<Record<MovementTrainingGuidance, string>> = {
  zelf: "zelf",
  groep: "groep",
  coach: "coach",
};

/**
 * "{frequency} · {locationLabel} · {guidanceLabel}" voor de readout (M2/M3).
 * Alleen de RAUWE, onopgeloste profielwaarden — nooit `resolveEffectivePlanProfile`'s
 * pattern-default. Frequentie en locatie blijven verplicht: ontbreekt één van
 * beide, dan valt de hele regel weg. Guidance is optioneel bovenop die twee —
 * `onbekend` toont geen segment (het is een echt antwoord voor de sheet, geen
 * feit om in een samenvattingsregel te herhalen).
 */
export function buildMovementProgramPreview(
  weeklyFrequency: MovementWeeklyFrequency | null,
  trainingLocation: MovementTrainingLocation | null,
  trainingGuidance?: MovementTrainingGuidance | null,
): string | null {
  if (!weeklyFrequency || !trainingLocation) return null;
  const base = `${WEEKLY_FREQUENCY_LABEL[weeklyFrequency]} · ${TRAINING_LOCATION_LABEL[trainingLocation]}`;
  const guidanceLabel = trainingGuidance ? TRAINING_GUIDANCE_LABEL[trainingGuidance] : undefined;
  return guidanceLabel ? `${base} · ${guidanceLabel}` : base;
}

export function resolveEffectivePlanProfile(
  profile: MovementPlanProfile,
  movStr: number | undefined,
): MovementPlanProfile {
  const startPattern = profile.startPattern;
  return {
    ...profile,
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
  trainingLocation?: MovementTrainingLocation;
  trainingGuidance?: MovementTrainingGuidance;
  sports?: string[];
  targetMinutes?: MovementTargetMinutes;
  targetDays?: MovementTargetDays;
  targetStrength?: MovementTargetStrength;
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
    patch.trainingLocation !== undefined &&
    isMovementTrainingLocation(patch.trainingLocation)
  ) {
    record[ANSWER_KEY_TRAINING_LOCATION] = patch.trainingLocation;
  }
  if (
    patch.trainingGuidance !== undefined &&
    isMovementTrainingGuidance(patch.trainingGuidance)
  ) {
    record[ANSWER_KEY_TRAINING_GUIDANCE] = patch.trainingGuidance;
  }
  if (patch.sports !== undefined) {
    record[ANSWER_KEY_SPORTS] = patch.sports.slice(0, 3);
  }
  if (
    patch.weeklyFrequency !== undefined &&
    isMovementWeeklyFrequency(patch.weeklyFrequency)
  ) {
    record[ANSWER_KEY_WEEKLY_FREQUENCY] = patch.weeklyFrequency;
  }
  if (
    patch.targetMinutes !== undefined &&
    isMovementTargetMinutes(patch.targetMinutes)
  ) {
    record[ANSWER_KEY_TARGET_MINUTES] = patch.targetMinutes;
  }
  if (patch.targetDays !== undefined && isMovementTargetDays(patch.targetDays)) {
    record[ANSWER_KEY_TARGET_DAYS] = patch.targetDays;
  }
  if (
    patch.targetStrength !== undefined &&
    isMovementTargetStrength(patch.targetStrength)
  ) {
    record[ANSWER_KEY_TARGET_STRENGTH] = patch.targetStrength;
  }

  return record;
}

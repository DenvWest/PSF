/**
 * SSOT voor het beweegdoel dat de gebruiker zelf zet: minuten, dagen en
 * krachtsessies per week.
 *
 * De beweegtest (`MOVEMENT_QUESTIONS`) meet wat iemand *doet* — banden, geen
 * exacte waarden. Dit bestand levert de andere helft: wat iemand *wil*. Het
 * verschil tussen die twee stuurt het programma (`resolveMovementProgramDose`)
 * en is de enige plek waar de gebruiker de dosis zet.
 *
 * Invoer: 4 presets + "anders" (vrij getal binnen de grenzen). Geen lange
 * rijen losse knoppen — minuten en dagen zijn daarom een open range met een
 * kleine preset-set, geen gesloten enum.
 *
 * Opslag: answers-jsonb via `/api/account/movement-prefs`. Geen nieuwe tabel.
 */

export const ANSWER_KEY_TARGET_MINUTES = "movementTargetMinutes";
export const ANSWER_KEY_TARGET_DAYS = "movementTargetDays";
export const ANSWER_KEY_TARGET_STRENGTH = "movementTargetStrength";

export const MOVEMENT_TARGET_MINUTES_MIN = 20;
export const MOVEMENT_TARGET_MINUTES_MAX = 400;
export const MOVEMENT_TARGET_DAYS_MIN = 1;
export const MOVEMENT_TARGET_DAYS_MAX = 7;

export type MovementTargetMinutes = number;
export type MovementTargetDays = number;
export type MovementTargetStrength = 0 | 1 | 2 | 3;

/** De 4 presets in de knoppenrij — "anders" opent een vrij invoerveld. */
export const MOVEMENT_TARGET_MINUTES_PRESETS: readonly MovementTargetMinutes[] = [
  60, 100, 150, 200,
];

export const MOVEMENT_TARGET_DAYS_PRESETS: readonly MovementTargetDays[] = [
  2, 3, 4, 5,
];

export const MOVEMENT_TARGET_STRENGTH_OPTIONS: readonly {
  id: MovementTargetStrength;
  label: string;
}[] = [
  { id: 0, label: "Geen" },
  { id: 1, label: "1×" },
  { id: 2, label: "2×" },
  { id: 3, label: "3×" },
] as const;

/** De richtlijn-referentie: 150 min matig per week. Geen norm die we opleggen. */
export const MOVEMENT_GUIDELINE_MINUTES = 150;

const STRENGTH_IDS = new Set<number>(
  MOVEMENT_TARGET_STRENGTH_OPTIONS.map((option) => option.id),
);

export function isMovementTargetMinutes(
  value: unknown,
): value is MovementTargetMinutes {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MOVEMENT_TARGET_MINUTES_MIN &&
    value <= MOVEMENT_TARGET_MINUTES_MAX
  );
}

export function isMovementTargetDays(
  value: unknown,
): value is MovementTargetDays {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MOVEMENT_TARGET_DAYS_MIN &&
    value <= MOVEMENT_TARGET_DAYS_MAX
  );
}

export function isMovementTargetStrength(
  value: unknown,
): value is MovementTargetStrength {
  return typeof value === "number" && STRENGTH_IDS.has(value);
}

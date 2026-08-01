import { MOVEMENT_QUESTIONS } from "@/data/movement-checkin";
import {
  ANSWER_KEY_TARGET_DAYS,
  ANSWER_KEY_TARGET_MINUTES,
  ANSWER_KEY_TARGET_STRENGTH,
  MOVEMENT_GUIDELINE_MINUTES,
  MOVEMENT_TARGET_MINUTES_MAX,
  MOVEMENT_TARGET_MINUTES_PRESETS,
  isMovementTargetDays,
  isMovementTargetMinutes,
  isMovementTargetStrength,
  type MovementTargetDays,
  type MovementTargetMinutes,
  type MovementTargetStrength,
} from "@/data/movement/targets";

/**
 * Twee helften van hetzelfde beweegbeeld.
 *
 * - **Wat je doet** komt uit de beweegcheck (`MOV2_*`). Dat zijn banden, geen
 *   exacte waarden: het bandlabel is het feit, het middelpunt gebruiken we
 *   alleen om een verschil te kunnen benoemen ("ongeveer +30").
 * - **Wat je wil** zet de gebruiker zelf (`movementTarget*` in de answers-jsonb).
 *
 * Het verschil stuurt het programma. De basis-intake (`MOV_CARD`) kent alleen
 * frequentie, geen minuten — dan zeggen we dat eerlijk en wijzen naar de
 * beweegcheck in plaats van minuten te verzinnen.
 */

export type MovementCurrentSource = "beweegcheck" | "basischeck" | "onbekend";

export type MovementCurrent = {
  source: MovementCurrentSource;
  /** Representatief midden van de gekozen banden (matig + intensief). Null als onbekend. */
  weeklyMinutes: number | null;
  /** Letterlijke labels uit de test — nooit herschreven. */
  moderateLabel: string | null;
  vigorousLabel: string | null;
  strengthLabel: string | null;
  sittingLabel: string | null;
  /** Krachtsessies per week zoals de test die uitvraagt. */
  strengthSessions: number | null;
};

export type MovementTarget = {
  minutes: MovementTargetMinutes | null;
  days: MovementTargetDays | null;
  strength: MovementTargetStrength | null;
};

export type MovementProgramDose = {
  sessionsPerWeek: number;
  minutesPerSession: number;
  strengthSessions: number;
};

export type MovementTargetGap = {
  /** Positief = je wil meer dan je nu doet. Null als het huidige beeld onbekend is. */
  minutesDelta: number | null;
  /** Waarschuwt bij een grote sprong. Blokkeert nooit. */
  stretch: boolean;
};

export const EMPTY_MOVEMENT_TARGET: MovementTarget = {
  minutes: null,
  days: null,
  strength: null,
};

/** Middelpunt per band — alleen voor het benoemen van een verschil. */
const MODERATE_MINUTES: Record<number, number> = {
  5: 330,
  4: 225,
  3: 120,
  2: 60,
  1: 15,
};

const VIGOROUS_MINUTES: Record<number, number> = {
  5: 165,
  4: 110,
  3: 50,
  2: 15,
  1: 0,
};

const STRENGTH_SESSIONS: Record<number, number> = {
  5: 3,
  4: 2,
  3: 1,
  2: 0,
  1: 0,
};

function optionLabel(field: string, value: number | undefined): string | null {
  if (typeof value !== "number") {
    return null;
  }
  const question = MOVEMENT_QUESTIONS.find((item) => item.field === field);
  return question?.options.find((option) => option.value === value)?.label ?? null;
}

/**
 * Leest het huidige beeld uit de antwoorden. Prefereert de diepe beweegcheck
 * (`MOV2_*`, kent minuten) boven de basis-intake (`MOV_*`, kent alleen
 * frequentie).
 */
export function deriveMovementCurrent(
  answers: Record<string, number>,
): MovementCurrent {
  const card = answers.MOV2_CARD;
  const vig = answers.MOV2_VIG;
  const str = answers.MOV2_STR;

  if (typeof card === "number") {
    const moderate = MODERATE_MINUTES[card] ?? null;
    const vigorous = typeof vig === "number" ? (VIGOROUS_MINUTES[vig] ?? 0) : 0;
    return {
      source: "beweegcheck",
      weeklyMinutes: moderate === null ? null : moderate + vigorous,
      moderateLabel: optionLabel("MOV2_CARD", card),
      vigorousLabel: optionLabel("MOV2_VIG", vig),
      strengthLabel: optionLabel("MOV2_STR", str),
      sittingLabel: optionLabel("MOV2_SIT", answers.MOV2_SIT),
      strengthSessions:
        typeof str === "number" ? (STRENGTH_SESSIONS[str] ?? null) : null,
    };
  }

  if (typeof answers.MOV_CARD === "number" || typeof answers.MOV_STR === "number") {
    return {
      source: "basischeck",
      weeklyMinutes: null,
      moderateLabel: null,
      vigorousLabel: null,
      strengthLabel: null,
      sittingLabel: null,
      strengthSessions: null,
    };
  }

  return {
    source: "onbekend",
    weeklyMinutes: null,
    moderateLabel: null,
    vigorousLabel: null,
    strengthLabel: null,
    sittingLabel: null,
    strengthSessions: null,
  };
}

export function parseMovementTarget(raw: unknown): MovementTarget {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_MOVEMENT_TARGET };
  }
  const record = raw as Record<string, unknown>;
  const minutes = record[ANSWER_KEY_TARGET_MINUTES];
  const days = record[ANSWER_KEY_TARGET_DAYS];
  const strength = record[ANSWER_KEY_TARGET_STRENGTH];
  return {
    minutes: isMovementTargetMinutes(minutes) ? minutes : null,
    days: isMovementTargetDays(days) ? days : null,
    strength: isMovementTargetStrength(strength) ? strength : null,
  };
}

/**
 * Vult ontbrekende doelen met een voorstel uit het huidige beeld. Het voorstel
 * is bewust dichtbij: één stap boven wat iemand nu doet, nooit een sprong naar
 * de richtlijn.
 */
export function resolveEffectiveMovementTarget(
  target: MovementTarget,
  current: MovementCurrent,
): MovementTarget {
  return {
    minutes: target.minutes ?? suggestTargetMinutes(current),
    days: target.days ?? 3,
    strength: target.strength ?? suggestTargetStrength(current),
  };
}

/** Eerste preset boven het huidige beeld; voorbij de laatste preset: +50 per stap. */
function suggestTargetMinutes(current: MovementCurrent): MovementTargetMinutes {
  const now = current.weeklyMinutes;
  if (now === null) {
    return MOVEMENT_GUIDELINE_MINUTES;
  }
  const above = MOVEMENT_TARGET_MINUTES_PRESETS.find((preset) => now < preset);
  if (above !== undefined) {
    return above;
  }
  const lastPreset = MOVEMENT_TARGET_MINUTES_PRESETS[MOVEMENT_TARGET_MINUTES_PRESETS.length - 1];
  return Math.min(MOVEMENT_TARGET_MINUTES_MAX, Math.max(lastPreset, now) + 50);
}

function suggestTargetStrength(current: MovementCurrent): MovementTargetStrength {
  const now = current.strengthSessions;
  if (now === null) return 2;
  if (now >= 3) return 3;
  if (now >= 2) return 2;
  return (now + 1) as MovementTargetStrength;
}

export function buildMovementTargetGap(
  target: MovementTarget,
  current: MovementCurrent,
): MovementTargetGap {
  if (target.minutes === null || current.weeklyMinutes === null) {
    return { minutesDelta: null, stretch: false };
  }
  const delta = target.minutes - current.weeklyMinutes;
  return {
    minutesDelta: delta,
    stretch: current.weeklyMinutes > 0 && target.minutes > current.weeklyMinutes * 1.6,
  };
}

/**
 * De doel-knoppen sturen het programma: dagen worden sessies, minuten gedeeld
 * door dagen wordt de sessieduur (afgerond op 5). Kracht is een eigen teller.
 */
export function resolveMovementProgramDose(
  target: MovementTarget,
): MovementProgramDose | null {
  if (target.minutes === null || target.days === null) {
    return null;
  }
  const perSession = Math.max(
    10,
    Math.round(target.minutes / target.days / 5) * 5,
  );
  return {
    sessionsPerWeek: target.days,
    minutesPerSession: perSession,
    strengthSessions: target.strength ?? 0,
  };
}

/** Feitelijke ankerregel voor het programma — nooit een ratio of percentage af tegen het log. */
export function buildProgramDoseLine(dose: MovementProgramDose): string {
  return `doel ${dose.sessionsPerWeek}× ${dose.minutesPerSession} min`;
}

/** Eén regel die het doel tegen de richtlijn zet, zonder te normeren. */
export function buildGuidelineLine(target: MovementTarget): string | null {
  if (target.minutes === null) {
    return null;
  }
  if (target.minutes >= MOVEMENT_GUIDELINE_MINUTES) {
    return `Je doel ligt op of boven de richtlijn van ${MOVEMENT_GUIDELINE_MINUTES} minuten matig per week.`;
  }
  const remainder = MOVEMENT_GUIDELINE_MINUTES - target.minutes;
  return `De richtlijn is ${MOVEMENT_GUIDELINE_MINUTES} minuten matig per week — je doel zit ${remainder} minuten daaronder. Dat mag: een doel dat je haalt is meer waard dan een norm die je mist.`;
}

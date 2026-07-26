import type { QuestionId } from "@/data/intake-questions";

/**
 * Intake-antwoorden zoals opgeslagen in `intake_sessions.answers` (JSONB).
 * Semantiek: `NUT_PROT` 1–4 = eiwit-frequentie; 0 (`NUT_PROT_UNKNOWN`) = onbekend, telt niet mee in score (≥ 1.4.0).
 */
export type IntakeAnswers = Record<QuestionId, number>;

/**
 * Wat er feitelijk in de jsonb staat: de numerieke antwoorden plus de
 * string-enums van het plan-profiel (anker, startpatroon, sport, frequentie)
 * die via `/api/account/movement-prefs` op dezelfde rij worden geschreven.
 * `parseAnswers()` blijft number-only en negeert die keys.
 */
export type StoredIntakeAnswers = IntakeAnswers & Record<string, unknown>;

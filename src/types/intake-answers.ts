import type { QuestionId } from "@/data/intake-questions";

/**
 * Intake-antwoorden zoals opgeslagen in `intake_sessions.answers` (JSONB).
 * Semantiek: `NUT_PROT` 1–4 = eiwit-frequentie; 0 (`NUT_PROT_UNKNOWN`) = onbekend, telt niet mee in score (≥ 1.4.0).
 */
export type IntakeAnswers = Record<QuestionId, number>;

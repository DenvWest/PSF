import type { QuestionId } from "@/data/intake-questions";

/**
 * Intake-antwoorden zoals opgeslagen in `intake_sessions.answers` (JSONB).
 * Semantiek: eiwitinname 1–4 staat onder id `NUT_PROT` (ook wel protein_intake genoemd).
 */
export type IntakeAnswers = Record<QuestionId, number>;

import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
import { QUESTIONS } from "@/data/intake-questions";

/**
 * De harde getallen over de Leefstijlcheck, op één plek. Ze stonden verspreid
 * over ~40 teksten en liepen aantoonbaar weg van de waarheid ("16 vragen" bij
 * zestien, "6 domeinen" bij vijf). `intake-copy-consistency.test.ts` faalt als
 * een tekst er weer van afwijkt of als de bron verandert zonder de teksten.
 *
 * Domeinen = de vijf waarop de check stuurt (`INTERVENTION_DOMAIN_SCORE_KEYS`),
 * niet alle zeven scores: energie en herstel zijn readouts, geen knop.
 */
export const INTAKE_QUESTION_COUNT = QUESTIONS.length;
export const INTAKE_DOMAIN_COUNT = INTERVENTION_DOMAIN_SCORE_KEYS.length;

export const INTAKE_QUESTIONS_LABEL = `${INTAKE_QUESTION_COUNT} vragen`;
export const INTAKE_DOMAINS_LABEL = `${INTAKE_DOMAIN_COUNT} leefstijldomeinen`;

/** De vijf stuurbare domeinen in leestaal, voor opsommingen in copy. */
export const INTAKE_DOMAINS_SENTENCE = "slaap, stress, voeding, beweging en verbinding";

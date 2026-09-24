import { NUTRITION_REQUIRED_STEP_COUNT } from "@/data/nutrition/lifescore-questions";
import { getContentCheck } from "@/data/content-graph/checks";

/**
 * De harde getallen en CTA-copy over de Voedingcheck, op één plek — zelfde
 * patroon als intake-facts.ts voor de Leefstijlcheck. `intake-copy-consistency
 * .test.ts` bewaakt dat het aantal vragen hier niet wegloopt van de bron.
 */
export const VOEDINGCHECK_QUESTION_COUNT = NUTRITION_REQUIRED_STEP_COUNT;
export const VOEDINGCHECK_QUESTIONS_LABEL = `${VOEDINGCHECK_QUESTION_COUNT} vragen`;
export const VOEDINGCHECK_DURATION_LABEL = getContentCheck("voeding").duurLabel;

export const VOEDINGCHECK_CTA = {
  gratisButton: "Doe de Voedingcheck — gratis",
  blogHeadline: "Wil jij zien wat je mist in je voeding?",
  blogSubline: `${VOEDINGCHECK_QUESTIONS_LABEL} · ${VOEDINGCHECK_DURATION_LABEL} · gratis en anoniem`,
  blogClosingHeadline: "Wil jij weten wat jij nodig hebt?",
  blogClosingSubline:
    "De Voedingcheck laat zien welke voedingsstoffen je waarschijnlijk mist — en of een supplement daarbij past.",
} as const;

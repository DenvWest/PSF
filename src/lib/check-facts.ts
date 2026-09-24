import { NUTRITION_REQUIRED_STEP_COUNT } from "@/data/nutrition/lifescore-questions";
import { getContentCheck } from "@/data/content-graph/checks";

/**
 * De harde getallen en CTA-copy over de check op /intake ("Wat mis je?"), op
 * één plek — zelfde patroon als intake-facts.ts voor de brede leefstijlcheck
 * op /intake/leefstijl. `intake-copy-consistency.test.ts` bewaakt dat het
 * aantal vragen hier niet wegloopt van de bron.
 */
export const CHECK_QUESTION_COUNT = NUTRITION_REQUIRED_STEP_COUNT;
export const CHECK_QUESTIONS_LABEL = `${CHECK_QUESTION_COUNT} vragen`;
export const CHECK_DURATION_LABEL = getContentCheck("voeding").duurLabel;

export const CHECK_CTA = {
  gratisButton: "Doe de gratis check",
  blogHeadline: "Wil jij zien wat je mist in je voeding?",
  blogSubline: `${CHECK_QUESTIONS_LABEL} · ${CHECK_DURATION_LABEL} · gratis en anoniem`,
  blogClosingHeadline: "Wil jij weten wat jij nodig hebt?",
  blogClosingSubline:
    "De check laat zien welke voedingsstoffen je waarschijnlijk mist — en of een supplement daarbij past.",
} as const;

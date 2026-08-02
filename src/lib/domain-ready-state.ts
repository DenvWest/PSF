/**
 * De klaar-staat-gate: analyse en advies mogen pas prominenter worden dan de
 * dagstap wanneer die dagstap klaar is. Geen tijdsregel maar een
 * rendering-conditie — zolang er een open stap staat, is de doe-laag de enige
 * primary (BESLUIT_BEWEGING §A.2, generiek gemaakt per §C.4).
 *
 * Pure functie op feiten die de caller al heeft: wat staat er vandaag klaar
 * (agenda/plan) en wat is afgevinkt (daily_action_log).
 */

export type DayStepState =
  | "open"
  | "done"
  | "rest_day"
  | "other_domain_priority";

export type DayStepFacts = {
  /** De actie die vandaag voor dit domein klaarstaat; null = niets gepland. */
  plannedActionKey: string | null;
  /** Wat vandaag al is afgevinkt voor dit domein. */
  completedActionKeys: readonly string[];
  /** Is dit domein vandaag het prioriteitsdomein? Bepaalt alleen de reden, niet de uitkomst. */
  isPriorityDomain: boolean;
};

export function resolveDayStepState(facts: DayStepFacts): DayStepState {
  if (facts.plannedActionKey !== null) {
    return facts.completedActionKeys.includes(facts.plannedActionKey)
      ? "done"
      : "open";
  }
  return facts.isPriorityDomain ? "rest_day" : "other_domain_priority";
}

/**
 * Precies één open stap houdt de deur dicht. De drie andere staten zijn
 * verschillende redenen voor dezelfde ruimte.
 */
export function adviceMayOutrankDayStep(facts: DayStepFacts): boolean {
  return resolveDayStepState(facts) !== "open";
}

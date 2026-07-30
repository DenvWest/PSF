/**
 * Herkomst van een leefstijlstap — de naad tussen "een stap op Mijn Dag" en
 * "iets dat je later kunt bestellen".
 *
 * Ontwerpregel: de herkomst hangt aan de stap-DEFINITIE (`PlanStep.sourcing`),
 * niet aan elke dagregel. `daily_action_log` heeft alleen
 * (account_id, domain, action_key, log_date) en krijgt er géén kolom bij —
 * het nutriënt is uit de action_key zelf af te leiden.
 */

import { NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";
import type { PlanStep, StepSourcing } from "@/types/lifestyle-plan";

/**
 * De enige plek die later omgaat. Zolang deze `false` is bestaat "bestellen"
 * als vorm in de types, maar nooit als uitkomst in de runtime — geen enkele
 * aanroeper kan per ongeluk een besteluitgang tonen.
 */
const ORDERING_ENABLED: boolean = false;

/** Prefix van zelf gekozen voedingsacties: `voeding:<nutrient>:<slug>`. */
const NUTRITION_ACTION_DOMAIN = "voeding";

/** Afwezige `sourcing` staat gelijk aan `{ kind: "self" }`. */
export function resolveStepSourcing(step: PlanStep): StepSourcing {
  return step.sourcing ?? { kind: "self" };
}

/**
 * Vandaag altijd `false` — zie `ORDERING_ENABLED`. De type-predicate bestaat al
 * wél, zodat aanroepers nu al de juiste smalle vorm krijgen zodra hij omgaat.
 */
export function isOrderable(
  sourcing: StepSourcing,
): sourcing is Extract<StepSourcing, { kind: "product" }> {
  return ORDERING_ENABLED && sourcing.kind === "product";
}

/**
 * Registry-afleiding: `voeding:<nutrient>:<slug>` geeft het nutriënt terug,
 * elke andere sleutel `null`. Acties zonder nutriënt (beweging, slaap, zelf
 * aangemaakt) horen hier bewust buiten te vallen.
 */
export function nutrientFromActionKey(actionKey: string): NutrientId | null {
  const parts = actionKey.split(":");
  if (parts.length !== 3) {
    return null;
  }
  const [domain, nutrient, slug] = parts;
  if (domain !== NUTRITION_ACTION_DOMAIN || !slug) {
    return null;
  }
  return isNutrientId(nutrient) ? nutrient : null;
}

function isNutrientId(value: string): value is NutrientId {
  return (NUTRIENT_IDS as readonly string[]).includes(value);
}

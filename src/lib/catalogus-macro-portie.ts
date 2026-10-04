import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";

export interface MacroPortieDoel {
  nevoCode: string;
  benadering: boolean;
}

/**
 * De NEVO-tegenhanger van een catalogusregel, waaruit het portiescherm de
 * calorieën en macro's toont. `null` zolang de regel niet aan NEVO gekoppeld is.
 * Een benadering is een vergelijkbaar voedingsmiddel en wordt zo genoemd.
 */
export function macroPortieVoor(entry: CatalogEntry): MacroPortieDoel | null {
  const koppeling = nevoKoppelingVoor(entry.key);
  if (!koppeling) return null;
  return { nevoCode: koppeling.code, benadering: koppeling.basis === "benadering" };
}

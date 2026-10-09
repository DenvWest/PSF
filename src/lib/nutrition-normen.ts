import type { NutrientId } from "@/data/nutrition/intake-reference";
import {
  gevolgdeNormenVoor,
  isGevolgdeStofMetNorm,
  voedingsnormenVoor,
  type GevolgdeNormen,
  type KernstofMetNorm,
  type Voedingsnorm,
} from "@/data/nutrition/voedingsnormen";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";

/**
 * De ene bron voor het dekkingsdoel van de kernstoffen én de gevolgde stoffen
 * met een norm (binnen- en buitenring). Krans, patroon,
 * weekoverzicht, trend en agenda-voorstellen rekenen allemaal hiertegen, zodat
 * geen scherm een ander percentage toont dan een ander
 * (`BESLUIT_DOELEN_VERBONDEN_2026-10.md` §4).
 *
 * De normen komen per persoon van de server (`laadVoedingsdoelenWeergave`):
 * het geslacht uit de check blijft daar, alleen de norm die eruit volgt
 * bereikt de client. Tot die binnen is rekent de client met
 * {@link STANDAARD_NORMEN}, de hogere waarden.
 *
 * Etiketpercentages per product blijven de RI gebruiken
 * (`reference-intake.ts`): dat is de wettelijk voorgeschreven vermelding.
 */

export type KernstofNormen = Record<KernstofMetNorm, Voedingsnorm>;

export const STANDAARD_NORMEN: KernstofNormen = voedingsnormenVoor(null);

export const STANDAARD_GEVOLGDE_NORMEN: GevolgdeNormen = gevolgdeNormenVoor({ gender: null });

/** De norm voor een gevolgde stof, of null voor een stof zonder norm (natrium, vezels, macro's). */
export function normVoorVeld(normen: GevolgdeNormen, veld: SupermarktVeld): Voedingsnorm | null {
  return isGevolgdeStofMetNorm(veld) ? normen[veld] : null;
}

export function normVoor(normen: KernstofNormen, nutrient: NutrientId): Voedingsnorm | null {
  return nutrient === "protein" ? null : normen[nutrient];
}

/**
 * Welk deel van de norm een hoeveelheid dekt, als fractie. Null voor eiwit:
 * dat doel rekent met gewicht en belasting, niet met een vaste norm.
 */
export function aandeelVanNorm(
  normen: KernstofNormen,
  nutrient: NutrientId,
  hoeveelheid: number,
): number | null {
  const norm = normVoor(normen, nutrient);
  return norm ? hoeveelheid / norm.waarde : null;
}

/** "350 mg" — de norm zoals een tabelcel hem toont. */
export function normLabel(norm: Voedingsnorm): string {
  return `${norm.waarde.toLocaleString("nl-NL")} ${norm.unit}`;
}

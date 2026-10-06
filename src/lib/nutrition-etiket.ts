import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";
import { FOOD_CATALOG_NEVO_BENADERINGEN } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { bedragVanSupermarktveld } from "@/lib/nutrition-supermarkt-items";
import { VOEDINGSWAARDE_VELDEN, type Voedingswaarde, type VoedingswaardeVeld } from "@/lib/nutrition-voedingswaarde";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Waar het etiket (calorieën, macro's, brede micronutriënten) van een
 * catalogusregel vandaan komt, en welke regels ervan getoond mogen worden.
 *
 * - Een eigen NEVO-koppeling: het hele etiket.
 * - Een benadering die is vrijgegeven (`scripts/nevo-benadering-micros.json`):
 *   het hele etiket van het vergelijkbare record, met de NEVO-naam.
 * - Een benadering die niet is vrijgegeven: alleen energie en macro's, want
 *   verrijking (calcium, B12, vitamine D) verschilt daar per merk.
 *
 * Alleen weergave, zonder oordeel; nooit in een som
 * (`docs/plan/BESLUIT_NUL_SPOOR_BENADERING_2026-10.md`).
 */
export interface EtiketBron {
  code: string;
  benadering: boolean;
  /** NEVO-naam van het vergelijkbare record, alleen bij een vrijgegeven benadering. */
  naam: string | null;
  velden: readonly VoedingswaardeVeld[];
}

const MACRO_VELDEN = new Set(["energyKcal", "fatG", "carbohydrateG", "proteinG"]);

export function etiketBronVoor(entry: CatalogEntry | null | undefined): EtiketBron | null {
  if (!entry) return null;
  const koppeling = nevoKoppelingVoor(entry.key);
  if (!koppeling) return null;
  if (koppeling.basis !== "benadering") {
    return { code: koppeling.code, benadering: false, naam: null, velden: VOEDINGSWAARDE_VELDEN };
  }
  const vrijgegeven = FOOD_CATALOG_NEVO_BENADERINGEN[entry.key];
  return vrijgegeven
    ? { code: koppeling.code, benadering: true, naam: vrijgegeven.naam, velden: VOEDINGSWAARDE_VELDEN }
    : {
        code: koppeling.code,
        benadering: true,
        naam: null,
        velden: VOEDINGSWAARDE_VELDEN.filter((veld) => MACRO_VELDEN.has(veld.veld)),
      };
}

/** Het etiket van één product op `grams`, beperkt tot de velden van de bron. */
export function etiketVanProduct(
  product: SupermarktProduct,
  bron: EtiketBron,
  grams: number,
): Voedingswaarde {
  const rijen = bron.velden.map((veld) => {
    const waarde = bedragVanSupermarktveld(product, veld.veld, grams);
    // Een etiket per product rekent tegen de RI (wettelijke vermelding), niet tegen een persoonlijke norm.
    const aandeelRi = waarde !== null && veld.ri !== null ? waarde / veld.ri : null;
    return { ...veld, waarde, norm: null, aandeel: aandeelRi, aandeelRi };
  });
  const metWaarde = rijen.some((rij) => rij.waarde !== null) ? 1 : 0;
  return { rijen, metWaarde, zonderWaarde: 1 - metWaarde };
}

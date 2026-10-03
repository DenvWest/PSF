/**
 * Eén voedingsmiddel uit NEVO-online (RIVM), ongewijzigd, per 100 g of 100 ml.
 *
 * Staat in de tabel `nevo_foods`, los van `sm_products`: NEVO heeft eigen
 * voorwaarden (alleen ongewijzigd, bron en versie vermelden, geen kosten voor
 * eindgebruikers) en Open Food Facts valt onder de ODbL. Zie
 * `docs/plan/BESLUIT_NEVO_BRONVERMELDING.md`.
 *
 * Alle waardevelden zijn `number | null` in de eenheid van het brondbestand.
 * `null` is "niet gemeten, of spoor" — nooit een verzonnen 0. Een spoor (NEVO
 * "TR") staat in `spoor`; de 0 in het bestand is daar een plaatshouder.
 * Geen omega-3: onze EPA+DHA-som is een bewerking, en die mag niet als
 * brongetal gepresenteerd worden.
 */
export const NEVO_WAARDE_KOLOMMEN = [
  "energy_kcal",
  "protein_g",
  "fat_g",
  "saturated_fat_g",
  "carbohydrate_g",
  "sugars_g",
  "fiber_g",
  "sodium_mg",
  "potassium_mg",
  "calcium_mg",
  "magnesium_mg",
  "iron_mg",
  "zinc_mg",
  "vitamin_d_ug",
  "vitamin_b12_ug",
  "vitamin_c_mg",
] as const;

export type NevoWaardeKolom = (typeof NEVO_WAARDE_KOLOMMEN)[number];

export interface NevoFood {
  /** `nevo:<nevoCode>`. Dit is wat een dagboeklog opslaat. */
  prodId: string;
  nevoCode: string;
  /** Versie van het brondbestand, bijv. `2025/9.0`. */
  nevoVersie: string;
  groep: string;
  naamNl: string;
  naamEn: string | null;
  per: "100g" | "100ml";
  waarden: Record<NevoWaardeKolom, number | null>;
  /** Kolommen waarvan NEVO spoor meldt (waarde `null`). */
  spoor: NevoWaardeKolom[];
  /** Kolommen waarvan het gehalte door verrijking komt (NEVO "+"). */
  verrijkt: NevoWaardeKolom[];
}

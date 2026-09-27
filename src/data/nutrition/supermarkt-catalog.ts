/**
 * De supermarktproduct-catalogus — calorieën/macro's/brede micronutriënten
 * per merkproduct, los van {@link FOOD_CATALOG}.
 *
 * ## Waarom dit een aparte as is, geen uitbreiding van `FOOD_CATALOG`
 *
 * `FOOD_CATALOG` (`food-catalog.ts`) draagt de vijf kernstoffen van het
 * tekortsysteem via `NutrientId` — elke regel heeft een `/beste/*`-uitgang en
 * een EFSA-claim. Een `SupermarktProduct` heeft geen van beide: het is
 * productinformatie (calorieën, macro's, brede micronutriënten), zoals een
 * voedingswaarde-etiket, zonder tekort-oordeel en zonder affiliate-keten. Zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3.
 *
 * Dat is ook waarom dit type niet van `CatalogEntry` erft: `groep`
 * (voedselgroep-taxonomie) en `bewijsbaar` horen bij de kernstoffen-as en
 * hebben hier geen betekenis.
 *
 * ## Status (27 september 2026)
 *
 * Leeg. Laag 0 (`scripts/supermarkt-extract.mjs`) en Laag 0b
 * (`scripts/supermarkt-usda-verrijk.mjs`) leveren rapporten die nog niet
 * beoordeeld en geïmporteerd zijn — zie
 * `docs/plan/VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §2.4 en §4 (stap
 * 3-5). Dit bestand bestaat al zodat de UI (Laag A) tegen de definitieve
 * velddefinitie gebouwd kan worden, met `n.o.` waar data ontbreekt — zie
 * §1 "Laag A" van het besluit ("UI eerst, tegen voorlopige data").
 *
 * Zodra het importscript (stap 3) en Dennis' beoordeling (stap 4) klaar
 * zijn, wordt `SUPERMARKT_CATALOG` hieronder gevuld — handmatig of via een
 * gegenereerd bestand, nog te kiezen (zie voorbereidingsdocument §2.4).
 */

export type SupermarktSupermarkt = "AH" | "Jumbo" | "Lidl" | "Plus";

/** Waar een veldgroep vandaan komt — bepaalt het vertrouwensniveau dat de UI toont. */
export type SupermarktBron = "supermarkt" | "supermarkt+usda";

/** Zekerheid van een USDA-aanvulling; alleen relevant bij `bron: "supermarkt+usda"`. */
export type SupermarktUsdaZekerheid = "sterk" | "zwak" | "ongeverifieerd";

/**
 * Eén merkproduct met calorieën/macro's/brede micronutriënten.
 *
 * Alle waardevelden `number | null` — nooit een verzonnen 0 voor "onbekend",
 * zelfde patroon als `bron: null` in {@link CatalogEntry}. De UI rendert
 * `null` als "n.o." (niet opgehaald), niet als leeg getal.
 *
 * Alle waarden zijn per 100 g/ml product, zoals op het etiket.
 */
export interface SupermarktProduct {
  prodId: string;
  naam: string;
  supermarkt: SupermarktSupermarkt;
  categorie: string | null;

  // Uit Laag 0 — vrijwel altijd aanwezig (98%+ dekking per supermarkt).
  energyKcal: number | null;
  fatG: number | null;
  saturatedFatG: number | null;
  carbohydrateG: number | null;
  sugarsG: number | null;
  fiberG: number | null;
  proteinG: number | null;
  saltG: number | null;

  // Uit Laag 0 (sporadisch) of Laag 0b (USDA-aanvulling, lage(re) zekerheid).
  sodiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  vitaminCMg: number | null;
  vitaminDµg: number | null;

  bron: SupermarktBron;
  usdaZekerheid?: SupermarktUsdaZekerheid;
}

/**
 * De catalogus zelf. Leeg tot de beoordeelde import landt — zie de
 * bestandsdocstring hierboven.
 */
export const SUPERMARKT_CATALOG: readonly SupermarktProduct[] = [];

const BY_ID = new Map<string, SupermarktProduct>(
  SUPERMARKT_CATALOG.map((product) => [product.prodId, product]),
);

/** Zoekt één supermarktproduct op zijn `prodId`, of `null` als het niet bestaat. */
export function supermarktCatalogEntry(prodId: string): SupermarktProduct | null {
  return BY_ID.get(prodId) ?? null;
}

const MAX_TREFFERS = 8;

/**
 * Vrije-tekstzoekopdracht over de supermarktcatalogus, zelfde vorm als
 * `searchCatalog` in `food-catalog.ts` — case-insensitive substring op de
 * productnaam, maximaal {@link MAX_TREFFERS} resultaten.
 */
export function searchSupermarktCatalog(query: string): SupermarktProduct[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  const result: SupermarktProduct[] = [];
  for (const product of SUPERMARKT_CATALOG) {
    if (product.naam.toLowerCase().includes(trimmed)) {
      result.push(product);
      if (result.length >= MAX_TREFFERS) break;
    }
  }
  return result;
}

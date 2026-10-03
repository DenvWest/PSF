/**
 * Eén verpakt voedingsproduct met calorieën/macro's/brede micronutriënten,
 * zoals op het etiket — los van `FOOD_CATALOG` (de vijf kernstoffen).
 *
 * ## Waarom een aparte as, geen uitbreiding van `FOOD_CATALOG`
 *
 * `FOOD_CATALOG` draagt de vijf kernstoffen van het tekortsysteem via
 * `NutrientId` — elke regel heeft een `/beste/*`-uitgang en een EFSA-claim.
 * Een `SupermarktProduct` heeft geen van beide: het is productinformatie,
 * zoals een voedingswaarde-etiket, zonder tekort-oordeel en zonder
 * affiliate-keten. Zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3.
 *
 * ## Waar de data leeft
 *
 * In de tabel `sm_products` (service-role-only), niet in de bundel. De 36.000
 * producten van de eerste dataset pasten niet in de clientbundel (15 MB), en
 * de herkomst van die dataset was juridisch niet gedekt. Zie
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md`.
 *
 * ## Bronnen als lagen
 *
 * `bron` is bewust een gesloten unie met één waarde. Elke bron heeft eigen
 * licentievoorwaarden (Open Food Facts: ODbL, share-alike) en mag niet met een
 * andere in één tabel vermengd raken (ODbL §4.4.d). Een tweede bron komt er
 * dus pas via een nieuwe migratie, ná een licentiebeoordeling — nooit door een
 * extra waarde in deze unie alleen.
 *
 * Alle waardevelden zijn `number | null` per 100 g/ml, zoals op het etiket.
 * Nooit een verzonnen 0 voor "onbekend": de UI rendert `null` als "n.o.".
 */
export type SupermarktBron = "off";

export interface SupermarktProduct {
  /** `<bron>:<bronId>`, bijv. `off:8710400123456`. Dit is wat een dagboeklog opslaat. */
  prodId: string;
  bron: SupermarktBron;
  /** Id binnen de bron. Bij Open Food Facts de barcode. */
  bronId: string;
  naam: string;
  merk: string | null;
  categorie: string | null;
  /** ISO-datum (YYYY-MM-DD) van de dump waaruit deze rij komt. */
  snapshotDatum: string;

  energyKcal: number | null;
  fatG: number | null;
  saturatedFatG: number | null;
  carbohydrateG: number | null;
  sugarsG: number | null;
  fiberG: number | null;
  proteinG: number | null;
  saltG: number | null;

  sodiumMg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  vitaminCMg: number | null;
  vitaminDµg: number | null;
}

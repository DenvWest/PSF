import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Portie-rekenlaag voor supermarktproducten (Laag A) — calorieën/macro's,
 * los van het tekortsysteem.
 *
 * ## Waarom dit niet in `nutrition-dagboek-items.ts` staat
 *
 * Dat bestand draagt expliciet de regel "geen calorieën, geen macro's" in
 * zijn docstring (`nutrition-dagboek-items.ts` §"Wat dit niet doet") en
 * voedt de tekortsom (`nutrientenUitItems`/`telOp`). Calorieën/macro's samen
 * met `NutrientId`-bedragen in dezelfde functieverzameling zetten zou die
 * twee assen laten vervlechten — precies wat
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3 verbiedt.
 * Zie ook `docs/plan/VOORBEREIDING_LAAG_A_MACRO_MICRO_2026-09.md` §3.1.
 *
 * ## Opslag
 *
 * Een `SupermarktPortieLog` is geen `DagboekItem` en telt niet mee in
 * `sanitizeItems`/`bedragVanItem`/de tekortsom. Het is een eigen, parallelle
 * registratie — zelfde architectuurpatroon als
 * `account-dagboek-favorieten.ts` (eigen tabel, eigen lib, eigen API-route),
 * niet een derde `DagboekItemBron`.
 *
 * ## Verwijzen, niet kopiëren
 *
 * Een log bewaart alleen `prodId` + gram, nooit een voedingswaarde. De API
 * koppelt het product bij het uitlezen aan de log ({@link SupermarktPortie})
 * en alle sommen hieronder rekenen op dat gekoppelde product. Dat houdt de
 * dagboektabel een onafhankelijke databank naast de ODbL-tabel `sm_products`
 * en voorkomt dat gezondheidsgegevens aan een share-alike-bron vastzitten. Zie
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §3.
 */

/** Eén geregistreerde portie van een supermarktproduct, op één eetmoment. */
export type SupermarktPortieLog = {
  id: string;
  moment: string;
  /** Verwijzing naar `sm_products` (`SupermarktProduct.prodId`). */
  prodId: string;
  /** Gewicht in gram. */
  grams: number;
  createdAt: string;
};

/**
 * Een log mét het product waar hij naar verwijst, zoals de API hem uitlevert.
 * `product` is `null` als het product niet (meer) in `sm_products` staat of de
 * tabel niet bereikbaar was: de regel blijft dan zichtbaar en verwijderbaar,
 * maar telt niet mee in een som.
 */
export type SupermarktPortie = SupermarktPortieLog & {
  product: SupermarktProduct | null;
};

/** Koppelt bij het uitlezen elk log aan zijn product; een onbekend `prodId` geeft `product: null`. */
export function koppelProducten(
  logs: readonly SupermarktPortieLog[],
  producten: ReadonlyMap<string, SupermarktProduct>,
): SupermarktPortie[] {
  return logs.map((log) => ({ ...log, product: producten.get(log.prodId) ?? null }));
}

/** Eén informatief veld op `SupermarktProduct`, per 100 g uitgedrukt. */
export type SupermarktVeld = {
  [K in keyof SupermarktProduct]: SupermarktProduct[K] extends number | null ? K : never;
}[keyof SupermarktProduct];

/**
 * Wat een gegeven portie van een supermarktproduct oplevert voor één veld —
 * dezelfde `per100g × grams / 100`-rekenregel als `bedragVanItem`
 * (`nutrition-dagboek-items.ts`), toegepast op de informatieve velden in
 * plaats van op `NutrientId`.
 *
 * Levert `null` als het veld voor dit product (nog) niet is opgehaald — de
 * UI toont dat als "n.o.", niet als 0.
 */
export function bedragVanSupermarktveld(
  product: SupermarktProduct,
  veld: SupermarktVeld,
  grams: number,
): number | null {
  const per100g = product[veld];
  if (per100g === null || per100g === undefined) return null;
  return (per100g * grams) / 100;
}

/**
 * Som van één veld over meerdere logs, of `null` als geen enkel log een
 * bedrag opleverde. Gedeelde helper voor `DagboekSupermarktSectie`,
 * `DagboekScherm` (de macro-ring) en `nutrition-supermarkt-weekoverzicht.ts`
 * — dezelfde optelling stond eerder driemaal apart uitgeschreven.
 */
export function somVanSupermarktveld(
  logs: readonly Pick<SupermarktPortie, "product" | "grams">[],
  veld: SupermarktVeld,
): number | null {
  let som = 0;
  let heeftBedrag = false;
  for (const log of logs) {
    if (!log.product) continue;
    const bedrag = bedragVanSupermarktveld(log.product, veld, log.grams);
    if (bedrag === null) continue;
    som += bedrag;
    heeftBedrag = true;
  }
  return heeftBedrag ? som : null;
}

/** De vier macro-achtige velden die Laag A als ring toont, in vaste volgorde. */
export const SUPERMARKT_MACRO_VELDEN: readonly {
  veld: SupermarktVeld;
  label: string;
  unit: "kcal" | "g";
}[] = [
  { veld: "energyKcal", label: "Calorieën", unit: "kcal" },
  { veld: "carbohydrateG", label: "Koolhydraten", unit: "g" },
  { veld: "fatG", label: "Vet", unit: "g" },
  { veld: "proteinG", label: "Eiwit", unit: "g" },
];

import {
  supermarktCatalogEntry,
  type SupermarktProduct,
} from "@/data/nutrition/supermarkt-catalog";

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
 */

/** Eén geregistreerde portie van een supermarktproduct, op één eetmoment. */
export type SupermarktPortieLog = {
  id: string;
  moment: string;
  /** Sleutel in `SUPERMARKT_CATALOG` (`SupermarktProduct.prodId`). */
  prodId: string;
  /** Gewicht in gram. */
  grams: number;
  createdAt: string;
};

/** Grootste portie die Laag A accepteert — hoger is bijna altijd een typfout. */
const MAX_GRAMS = 2000;

/** Hoeveel logs één dag mag dragen. */
const MAX_LOGS = 60;

/**
 * Maakt van ruwe invoer een geldige logslijst. Zelfde filosofie als
 * `sanitizeItems`: een log met een `prodId` die de catalogus niet (meer)
 * kent, valt eraf zonder de rest weg te gooien.
 */
export function sanitizeSupermarktLogs(raw: unknown): SupermarktPortieLog[] {
  if (!Array.isArray(raw)) return [];
  const result: SupermarktPortieLog[] = [];
  for (const entry of raw) {
    if (result.length >= MAX_LOGS) break;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const { id, moment, prodId, grams, createdAt } = entry as Record<string, unknown>;
    if (typeof id !== "string" || !id) continue;
    if (typeof moment !== "string" || !moment) continue;
    if (typeof prodId !== "string" || !supermarktCatalogEntry(prodId)) continue;
    if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
    if (typeof createdAt !== "string" || !createdAt) continue;
    result.push({
      id,
      moment,
      prodId,
      grams: Math.min(Math.trunc(grams), MAX_GRAMS),
      createdAt,
    });
  }
  return result;
}

/** Eén informatief veld op `SupermarktProduct`, per 100 g uitgedrukt. */
export type SupermarktVeld = Exclude<
  keyof SupermarktProduct,
  "prodId" | "naam" | "supermarkt" | "categorie" | "bron" | "usdaZekerheid"
>;

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
  logs: readonly Pick<SupermarktPortieLog, "prodId" | "grams">[],
  veld: SupermarktVeld,
): number | null {
  let som = 0;
  let heeftBedrag = false;
  for (const log of logs) {
    const product = supermarktCatalogEntry(log.prodId);
    if (!product) continue;
    const bedrag = bedragVanSupermarktveld(product, veld, log.grams);
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

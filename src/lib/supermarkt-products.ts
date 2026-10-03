import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupermarktBron, SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Server-side toegang tot `sm_products` — zoeken, ophalen op id, en de
 * mapping tussen tabelrij en {@link SupermarktProduct}. Alleen voor
 * server-code (API-routes, importscripts): de tabel is RLS deny-all en wordt
 * uitsluitend via de service role gelezen. Client-veilige bronhelpers staan in
 * `supermarkt-bron.ts`.
 *
 * Zie `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md`.
 */

const TABLE = "sm_products";

const COLUMNS = [
  "prod_id",
  "bron",
  "bron_id",
  "snapshot_datum",
  "naam",
  "merk",
  "categorie",
  "zoek_tekst",
  "energy_kcal",
  "fat_g",
  "saturated_fat_g",
  "carbohydrate_g",
  "sugars_g",
  "fiber_g",
  "protein_g",
  "salt_g",
  "sodium_mg",
  "calcium_mg",
  "iron_mg",
  "vitamin_c_mg",
  "vitamin_d_ug",
].join(",");

/** Kortste zoekterm waarmee de trigram-index nog helpt; korter geeft bijna alles terug. */
export const MIN_ZOEKTERM_LENGTE = 3;

/** Zoekresultaten per verzoek. */
export const MAX_ZOEKRESULTATEN = 20;

/** Producten die in één keer op id worden opgehaald (een dag logs, of een week). */
export const MAX_IDS_PER_VERZOEK = 200;

const MAX_ZOEKTERMEN = 6;
const MAX_ZOEKTERM_LENGTE = 60;

const BRONNEN: readonly SupermarktBron[] = ["off"];

/**
 * Kleine letters, zonder accenten, spaties samengevouwen. Wordt door de
 * schrijver én de zoekopdracht gebruikt, zodat "crème fraîche" en "creme
 * fraiche" elkaar vinden. Een generated column kan dit niet: `unaccent()` is
 * niet immutable.
 */
export function normaliseerZoektekst(tekst: string): string {
  return tekst
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Zoektermen voor een vrije-tekstzoekopdracht, of `null` als er niets zinnigs te zoeken valt. */
export function zoektermenUit(query: string): string[] | null {
  const termen = normaliseerZoektekst(query)
    .split(" ")
    .filter(Boolean)
    .map((term) => term.slice(0, MAX_ZOEKTERM_LENGTE))
    .slice(0, MAX_ZOEKTERMEN);
  if (!termen.some((term) => term.length >= MIN_ZOEKTERM_LENGTE)) return null;
  return termen;
}

/** `%`, `_` en `\` zijn in LIKE/ILIKE jokertekens; een zoekterm moet letterlijk matchen. */
export function escapeLikeTerm(term: string): string {
  return term.replace(/[\\%_]/g, (teken) => `\\${teken}`);
}

type Rij = Record<string, unknown>;

function getal(waarde: unknown): number | null {
  if (waarde === null || waarde === undefined) return null;
  const n = typeof waarde === "number" ? waarde : Number(waarde);
  return Number.isFinite(n) ? n : null;
}

function tekstOfNull(waarde: unknown): string | null {
  return typeof waarde === "string" && waarde.trim() ? waarde : null;
}

export function isSupermarktBron(waarde: unknown): waarde is SupermarktBron {
  return typeof waarde === "string" && (BRONNEN as readonly string[]).includes(waarde);
}

/** Tabelrij → product, of `null` als de rij niet bruikbaar is (kapotte bron, ontbrekende naam). */
export function rijNaarProduct(rij: Rij): SupermarktProduct | null {
  const bron = rij.bron;
  if (!isSupermarktBron(bron)) return null;
  const prodId = tekstOfNull(rij.prod_id);
  const bronId = tekstOfNull(rij.bron_id);
  const naam = tekstOfNull(rij.naam);
  const snapshotDatum = tekstOfNull(rij.snapshot_datum);
  if (!prodId || !bronId || !naam || !snapshotDatum) return null;

  return {
    prodId,
    bron,
    bronId,
    naam,
    merk: tekstOfNull(rij.merk),
    categorie: tekstOfNull(rij.categorie),
    snapshotDatum,
    energyKcal: getal(rij.energy_kcal),
    fatG: getal(rij.fat_g),
    saturatedFatG: getal(rij.saturated_fat_g),
    carbohydrateG: getal(rij.carbohydrate_g),
    sugarsG: getal(rij.sugars_g),
    fiberG: getal(rij.fiber_g),
    proteinG: getal(rij.protein_g),
    saltG: getal(rij.salt_g),
    sodiumMg: getal(rij.sodium_mg),
    calciumMg: getal(rij.calcium_mg),
    ironMg: getal(rij.iron_mg),
    vitaminCMg: getal(rij.vitamin_c_mg),
    vitaminDµg: getal(rij.vitamin_d_ug),
  };
}

/** Product → tabelrij, voor de schrijver. Vult `zoek_tekst` met {@link normaliseerZoektekst}. */
export function productNaarRij(product: SupermarktProduct): Rij {
  return {
    prod_id: product.prodId,
    bron: product.bron,
    bron_id: product.bronId,
    snapshot_datum: product.snapshotDatum,
    naam: product.naam,
    merk: product.merk,
    categorie: product.categorie,
    zoek_tekst: normaliseerZoektekst([product.naam, product.merk].filter(Boolean).join(" ")),
    energy_kcal: product.energyKcal,
    fat_g: product.fatG,
    saturated_fat_g: product.saturatedFatG,
    carbohydrate_g: product.carbohydrateG,
    sugars_g: product.sugarsG,
    fiber_g: product.fiberG,
    protein_g: product.proteinG,
    salt_g: product.saltG,
    sodium_mg: product.sodiumMg,
    calcium_mg: product.calciumMg,
    iron_mg: product.ironMg,
    vitamin_c_mg: product.vitaminCMg,
    vitamin_d_ug: product.vitaminDµg,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Dezelfde grenzen als de check-constraints in `sm_products`. Een rij die hier
 * afvalt zou in de database de hele batch laten falen; de schrijver filtert er
 * dus vooraf op, in plaats van pas bij het inserten.
 */
export function isPlausibelSupermarktProduct(product: SupermarktProduct): boolean {
  const tussen = (waarde: number | null, min: number, max: number) =>
    waarde === null || (waarde >= min && waarde <= max);
  const nietNegatief = (waarde: number | null) => waarde === null || waarde >= 0;

  if (product.prodId !== `${product.bron}:${product.bronId}`) return false;
  if (product.naam.length < 1 || product.naam.length > 300) return false;
  if (product.bronId.length < 1 || product.bronId.length > 64) return false;

  return (
    tussen(product.energyKcal, 0, 900) &&
    tussen(product.fatG, 0, 100) &&
    tussen(product.saturatedFatG, 0, 100) &&
    tussen(product.carbohydrateG, 0, 100) &&
    tussen(product.sugarsG, 0, 100) &&
    tussen(product.fiberG, 0, 100) &&
    tussen(product.proteinG, 0, 100) &&
    tussen(product.saltG, 0, 100) &&
    nietNegatief(product.sodiumMg) &&
    nietNegatief(product.calciumMg) &&
    nietNegatief(product.ironMg) &&
    nietNegatief(product.vitaminCMg) &&
    nietNegatief(product.vitaminDµg)
  );
}

function alsProducten(data: unknown): SupermarktProduct[] {
  if (!Array.isArray(data)) return [];
  const producten: SupermarktProduct[] = [];
  for (const rij of data) {
    if (!rij || typeof rij !== "object") continue;
    const product = rijNaarProduct(rij as Rij);
    if (product) producten.push(product);
  }
  return producten;
}

/**
 * Zoekt producten op naam en merk. Alle zoektermen moeten voorkomen (AND),
 * in willekeurige volgorde. Kortste naam eerst, dan alfabetisch.
 * Gooit bij een databasefout; geeft `[]` als de query te kort of leeg is.
 */
export async function zoekSupermarktProducten(
  supabase: SupabaseClient,
  query: string,
  limit: number = MAX_ZOEKRESULTATEN,
): Promise<SupermarktProduct[]> {
  const termen = zoektermenUit(query);
  if (!termen) return [];

  let aanvraag = supabase.from(TABLE).select(COLUMNS);
  for (const term of termen) {
    aanvraag = aanvraag.ilike("zoek_tekst", `%${escapeLikeTerm(term)}%`);
  }
  const { data, error } = await aanvraag
    .order("naam_lengte", { ascending: true })
    .order("naam", { ascending: true })
    .limit(Math.min(Math.max(1, Math.trunc(limit)), MAX_ZOEKRESULTATEN));

  if (error) throw new Error(error.message);
  return alsProducten(data);
}

/**
 * Haalt producten op `prod_id` op, in één query. Onbekende ids ontbreken
 * gewoon in het resultaat; de aanroeper beslist wat een log zonder product
 * betekent. Gooit bij een databasefout.
 */
export async function haalSupermarktProductenOp(
  supabase: SupabaseClient,
  prodIds: readonly string[],
): Promise<Map<string, SupermarktProduct>> {
  const uniek = [...new Set(prodIds.filter((id) => id.length > 0 && id.length <= 200))].slice(
    0,
    MAX_IDS_PER_VERZOEK,
  );
  const resultaat = new Map<string, SupermarktProduct>();
  if (uniek.length === 0) return resultaat;

  const { data, error } = await supabase.from(TABLE).select(COLUMNS).in("prod_id", uniek);
  if (error) throw new Error(error.message);
  for (const product of alsProducten(data)) resultaat.set(product.prodId, product);
  return resultaat;
}

/**
 * Schrijft producten weg (upsert op `prod_id`), zonder ooit iets te
 * verwijderen: een dagboeklog verwijst via `prod_id` en mag niet wegvallen
 * omdat een product uit een nieuwe dump verdwijnt. Rijen buiten de
 * plausibiliteitsgrenzen worden overgeslagen en geteld teruggegeven.
 */
export async function schrijfSupermarktProducten(
  supabase: SupabaseClient,
  producten: readonly SupermarktProduct[],
  batchGrootte = 500,
): Promise<{ geschreven: number; overgeslagen: number }> {
  const geldig = producten.filter(isPlausibelSupermarktProduct);
  for (let start = 0; start < geldig.length; start += batchGrootte) {
    const batch = geldig.slice(start, start + batchGrootte).map(productNaarRij);
    const { error } = await supabase.from(TABLE).upsert(batch, { onConflict: "prod_id" });
    if (error) throw new Error(error.message);
  }
  return { geschreven: geldig.length, overgeslagen: producten.length - geldig.length };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import { NEVO_WAARDE_KOLOMMEN, type NevoFood, type NevoWaardeKolom } from "@/types/nevo-food";
import {
  MAX_IDS_PER_VERZOEK,
  MAX_ZOEKRESULTATEN,
  escapeLikeTerm,
  normaliseerZoektekst,
  zoektermenUit,
} from "@/lib/supermarkt-products";

/**
 * Server-side toegang tot `nevo_foods` — zoeken, ophalen op code of id, en de
 * mapping tussen tabelrij en {@link NevoFood}. Alleen voor server-code: de
 * tabel is RLS deny-all en wordt uitsluitend via de service role gelezen.
 * Waarden gaan ongewijzigd door; er wordt hier niets afgerond of omgerekend.
 *
 * Zie `docs/plan/BESLUIT_NEVO_BRONVERMELDING.md` en
 * `docs/plan/ONTWERP_SUPERMARKT_PRODUCTTABEL_2026-10.md` §7.
 */

const TABLE = "nevo_foods";
const PREFIX = "nevo:";

const COLUMNS = [
  "nevo_code",
  "nevo_versie",
  "groep",
  "naam_nl",
  "naam_en",
  "per",
  "spoor",
  "verrijkt",
  ...NEVO_WAARDE_KOLOMMEN,
].join(",");

type Rij = Record<string, unknown>;

export function nevoProdId(nevoCode: string): string {
  return `${PREFIX}${nevoCode}`;
}

/** `nevo:1590` → `1590`, of `null` als het geen NEVO-id is. */
export function nevoCodeUitProdId(prodId: string): string | null {
  return prodId.startsWith(PREFIX) && prodId.length > PREFIX.length ? prodId.slice(PREFIX.length) : null;
}

function getal(waarde: unknown): number | null {
  if (waarde === null || waarde === undefined) return null;
  const n = typeof waarde === "number" ? waarde : Number(waarde);
  return Number.isFinite(n) ? n : null;
}

function tekstOfNull(waarde: unknown): string | null {
  return typeof waarde === "string" && waarde.trim() ? waarde : null;
}

function kolommenLijst(waarde: unknown): NevoWaardeKolom[] {
  if (!Array.isArray(waarde)) return [];
  return waarde.filter((k): k is NevoWaardeKolom => (NEVO_WAARDE_KOLOMMEN as readonly unknown[]).includes(k));
}

/** Tabelrij → voedingsmiddel, of `null` als de rij niet bruikbaar is. */
export function rijNaarNevoFood(rij: Rij): NevoFood | null {
  const nevoCode = tekstOfNull(rij.nevo_code);
  const nevoVersie = tekstOfNull(rij.nevo_versie);
  const groep = tekstOfNull(rij.groep);
  const naamNl = tekstOfNull(rij.naam_nl);
  if (!nevoCode || !nevoVersie || !groep || !naamNl) return null;
  if (rij.per !== "100g" && rij.per !== "100ml") return null;

  const waarden = {} as Record<NevoWaardeKolom, number | null>;
  for (const kolom of NEVO_WAARDE_KOLOMMEN) waarden[kolom] = getal(rij[kolom]);

  return {
    prodId: nevoProdId(nevoCode),
    nevoCode,
    nevoVersie,
    groep,
    naamNl,
    naamEn: tekstOfNull(rij.naam_en),
    per: rij.per,
    waarden,
    spoor: kolommenLijst(rij.spoor),
    verrijkt: kolommenLijst(rij.verrijkt),
  };
}

/** Voedingsmiddel → tabelrij, voor de loader. Vult `zoek_tekst` met dezelfde normalisatie als de zoekopdracht. */
export function nevoFoodNaarRij(food: NevoFood): Rij {
  return {
    nevo_code: food.nevoCode,
    nevo_versie: food.nevoVersie,
    groep: food.groep,
    naam_nl: food.naamNl,
    naam_en: food.naamEn,
    per: food.per,
    zoek_tekst: normaliseerZoektekst(food.naamNl),
    ...food.waarden,
    spoor: food.spoor,
    verrijkt: food.verrijkt,
    updated_at: new Date().toISOString(),
  };
}

function alsVoedingsmiddelen(data: unknown): NevoFood[] {
  if (!Array.isArray(data)) return [];
  const resultaat: NevoFood[] = [];
  for (const rij of data) {
    if (!rij || typeof rij !== "object") continue;
    const food = rijNaarNevoFood(rij as Rij);
    if (food) resultaat.push(food);
  }
  return resultaat;
}

/**
 * Zoekt NEVO-voedingsmiddelen op naam. Alle zoektermen moeten voorkomen (AND),
 * in willekeurige volgorde; kortste naam eerst. Gooit bij een databasefout;
 * geeft `[]` als de query te kort of leeg is.
 */
export async function zoekNevoFoods(
  supabase: SupabaseClient,
  query: string,
  limit: number = MAX_ZOEKRESULTATEN,
): Promise<NevoFood[]> {
  const termen = zoektermenUit(query);
  if (!termen) return [];

  let aanvraag = supabase.from(TABLE).select(COLUMNS);
  for (const term of termen) {
    aanvraag = aanvraag.ilike("zoek_tekst", `%${escapeLikeTerm(term)}%`);
  }
  const { data, error } = await aanvraag
    .order("naam_lengte", { ascending: true })
    .order("naam_nl", { ascending: true })
    .limit(Math.min(Math.max(1, Math.trunc(limit)), MAX_ZOEKRESULTATEN));

  if (error) throw new Error(error.message);
  return alsVoedingsmiddelen(data);
}

/**
 * Haalt voedingsmiddelen op NEVO-code op, in één query. Onbekende codes
 * ontbreken in het resultaat (sleutel = `nevo:<code>`). Gooit bij een databasefout.
 */
export async function haalNevoFoodsOp(
  supabase: SupabaseClient,
  nevoCodes: readonly string[],
): Promise<Map<string, NevoFood>> {
  const uniek = [...new Set(nevoCodes.filter((code) => code.length > 0 && code.length <= 16))].slice(
    0,
    MAX_IDS_PER_VERZOEK,
  );
  const resultaat = new Map<string, NevoFood>();
  if (uniek.length === 0) return resultaat;

  const { data, error } = await supabase.from(TABLE).select(COLUMNS).in("nevo_code", uniek);
  if (error) throw new Error(error.message);
  for (const food of alsVoedingsmiddelen(data)) resultaat.set(food.prodId, food);
  return resultaat;
}

/**
 * Schrijft voedingsmiddelen weg (upsert op `nevo_code`), zonder iets te
 * verwijderen. Een nieuwe NEVO-versie is dezelfde aanroep met de nieuwe versie
 * per rij.
 */
export async function schrijfNevoFoods(
  supabase: SupabaseClient,
  foods: readonly NevoFood[],
  batchGrootte = 500,
): Promise<{ geschreven: number }> {
  for (let start = 0; start < foods.length; start += batchGrootte) {
    const batch = foods.slice(start, start + batchGrootte).map(nevoFoodNaarRij);
    const { error } = await supabase.from(TABLE).upsert(batch, { onConflict: "nevo_code" });
    if (error) throw new Error(error.message);
  }
  return { geschreven: foods.length };
}

/**
 * NEVO-voedingsmiddel → de gedeelde weergavevorm van het dagboek. Waarden gaan
 * ongewijzigd door; `saltG` blijft `null` (NEVO geeft natrium, en zout daaruit
 * rekenen is een bewerking). `snapshotDatum` draagt de NEVO-versie.
 */
export function nevoFoodNaarSupermarktProduct(food: NevoFood): SupermarktProduct {
  const w = food.waarden;
  return {
    prodId: food.prodId,
    bron: "nevo",
    bronId: food.nevoCode,
    naam: food.naamNl,
    merk: null,
    categorie: food.groep,
    snapshotDatum: food.nevoVersie,
    energyKcal: w.energy_kcal,
    fatG: w.fat_g,
    saturatedFatG: w.saturated_fat_g,
    carbohydrateG: w.carbohydrate_g,
    sugarsG: w.sugars_g,
    fiberG: w.fiber_g,
    proteinG: w.protein_g,
    saltG: null,
    sodiumMg: w.sodium_mg,
    calciumMg: w.calcium_mg,
    ironMg: w.iron_mg,
    vitaminCMg: w.vitamin_c_mg,
    vitaminDµg: w.vitamin_d_ug,
  };
}

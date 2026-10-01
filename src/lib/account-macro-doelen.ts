import type { OrgScopedClient } from "@/lib/db/scoped";

/**
 * Eigen macro/calorie-doel (Laag C) — 100% gebruikersinvoer, geen formule.
 *
 * ## Waarom dit geen "weergave"-samenstelling heeft zoals `account-voedingsdoelen-server.ts`
 *
 * Het eiwitdoel combineert een handmatige overschrijving met een server-side
 * gerekende richtlijn (PROT-AGE/ESPEN). Een macro/calorie-doel heeft geen
 * richtlijn om mee te combineren — het systeem berekent hier niets voor (zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §4). Wat er
 * in de tabel staat, is precies wat de UI toont: geen server-berekening
 * ertussen, dus geen aparte "server"-module nodig.
 *
 * ## Waarom geen som-validatie op de percentages
 *
 * Een check dat koolhydraten+vet+eiwit optelt tot 100 zou het systeem laten
 * corrigeren wat iemand invulde — een vorm van berekenen die §4 uitsluit. Elk
 * veld is onafhankelijk geldig tussen 0 en 100.
 */

export type MacroDoelen = {
  calorieenKcal: number | null;
  koolhydratenPct: number | null;
  vetPct: number | null;
  eiwitPct: number | null;
};

export const LEGE_MACRO_DOELEN: MacroDoelen = {
  calorieenKcal: null,
  koolhydratenPct: null,
  vetPct: null,
  eiwitPct: null,
};

const CALORIEEN_MIN = 500;
const CALORIEEN_MAX = 6000;

export function isGeldigeCalorieen(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= CALORIEEN_MIN &&
    value <= CALORIEEN_MAX
  );
}

export function isGeldigPercentage(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

type Rij = {
  calorieen_kcal: number | null;
  koolhydraten_pct: number | null;
  vet_pct: number | null;
  eiwit_pct: number | null;
};

export async function getMacroDoelen(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<MacroDoelen> {
  const { data, error } = await supabase
    .from("account_macro_doelen")
    .select("calorieen_kcal,koolhydraten_pct,vet_pct,eiwit_pct")
    .eq("account_id", accountId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return LEGE_MACRO_DOELEN;
  }

  const rij = data as unknown as Rij;
  return {
    calorieenKcal: rij.calorieen_kcal ?? null,
    koolhydratenPct: rij.koolhydraten_pct ?? null,
    vetPct: rij.vet_pct ?? null,
    eiwitPct: rij.eiwit_pct ?? null,
  };
}

/**
 * Schrijft het doel weg. Elk veld mag expliciet op null — dat betekent
 * "nog niet ingesteld", niet "0".
 */
export async function setMacroDoelen(
  supabase: OrgScopedClient,
  accountId: string,
  doelen: MacroDoelen,
): Promise<void> {
  const { error } = await supabase.from("account_macro_doelen").upsert(
    {
      account_id: accountId,
      calorieen_kcal: doelen.calorieenKcal,
      koolhydraten_pct: doelen.koolhydratenPct,
      vet_pct: doelen.vetPct,
      eiwit_pct: doelen.eiwitPct,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

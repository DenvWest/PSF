import type { MacroDoelen } from "@/lib/account-macro-doelen";
import { SUPERMARKT_MACRO_VELDEN, type SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import type { Voedingswaarde } from "@/lib/nutrition-voedingswaarde";

/**
 * Eén week calorieën/macro's: de tabel gemiddeld / doel / over — de
 * informatieve tegenhanger van `nutrition-weekoverzicht.ts` (die rekent over
 * `DagboekItem`/`NutrientId`, het tekortsysteem).
 *
 * ## Waarom per dag een `Voedingswaarde`
 *
 * De aanroeper rekent elke dag door met `berekenVoedingswaarde` — dezelfde
 * som als de dagtabel en de macro-ring, over catalogusproducten (NEVO) én
 * etiketproducten. Daardoor kan de week nooit iets anders tellen dan de dag
 * (`BESLUIT_DAGBOEK_TOTAALBEELD_2026-10.md`, open punt "weektabel"). Tot
 * 4 okt telde deze tabel alleen etiketproducten.
 *
 * ## Waarom "over" hier een neutraal restgetal is, geen "te gaan"
 *
 * Het macro-besluit (§1 Laag B) verbiedt een weekscore-in-%. Een neutraal
 * restgetal ("nog 800 kcal tot je doel") draagt geen tekort-taal en is
 * toegestaan; op een lege week toont dit overzicht "nog niets geregistreerd",
 * want een ontbrekende registratie is geen nul.
 *
 * ## Wat een geregistreerde dag is
 *
 * Een dag met minstens één product, ook als dat product geen waarden heeft.
 * Zo wordt het gemiddelde een ondergrens in plaats van dat een dag met alleen
 * onbekende producten stilletjes uit de noemer valt. `zonderWaarde` telt die
 * producten, zodat de tabel dat kan zeggen.
 */

export type VoedingWeekRij = {
  veld: SupermarktVeld;
  label: string;
  unit: "kcal" | "g";
  /** Gemiddelde per geregistreerde dag in deze week. */
  gemiddeld: number;
  /** Het zelf ingestelde doel, of null als er niets is ingesteld. */
  doel: number | null;
  /** Afstand tot het doel; null zonder doel of zonder registratie. */
  over: number | null;
};

export type VoedingWeekoverzicht = {
  start: string;
  eind: string;
  dagenGeregistreerd: number;
  /** Producten in deze week die geen enkele waarde opleverden. */
  zonderWaarde: number;
  rijen: VoedingWeekRij[];
};

const DOEL_PER_VELD: Partial<Record<SupermarktVeld, (doelen: MacroDoelen) => number | null>> = {
  energyKcal: (d) => d.calorieenKcal,
};

/**
 * Percentage-doelen (koolhydraten/vet/eiwit) zijn geen absoluut grammendoel
 * totdat er een calorierichtlijn bij staat — `gram = pct% × kcal / 4 of 9`.
 * Zonder calorierichtlijn blijft `doel` null: het systeem stelt geen
 * berekening voor die het niet mag maken.
 */
function grammenDoelUitPercentage(
  doelen: MacroDoelen,
  pct: number | null,
  kcalPerGram: 4 | 9,
): number | null {
  if (typeof pct !== "number" || typeof doelen.calorieenKcal !== "number") return null;
  return Math.round(((pct / 100) * doelen.calorieenKcal) / kcalPerGram);
}

function doelVoorVeld(veld: SupermarktVeld, doelen: MacroDoelen): number | null {
  if (veld === "carbohydrateG") return grammenDoelUitPercentage(doelen, doelen.koolhydratenPct, 4);
  if (veld === "fatG") return grammenDoelUitPercentage(doelen, doelen.vetPct, 9);
  if (veld === "proteinG") return grammenDoelUitPercentage(doelen, doelen.eiwitPct, 4);
  return DOEL_PER_VELD[veld]?.(doelen) ?? null;
}

function aantalProducten(waarde: Voedingswaarde): number {
  return waarde.metWaarde + waarde.zonderWaarde;
}

export function bouwVoedingWeekoverzicht(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  datums: readonly string[],
  doelen: MacroDoelen,
): VoedingWeekoverzicht {
  const start = datums[0] ?? "";
  const eind = datums[datums.length - 1] ?? "";
  const dagen = datums.flatMap((datum) => {
    const waarde = perDag.get(datum);
    return waarde && aantalProducten(waarde) > 0 ? [waarde] : [];
  });
  const dagenGeregistreerd = dagen.length;
  const zonderWaarde = dagen.reduce((som, dag) => som + dag.zonderWaarde, 0);

  const rijen = SUPERMARKT_MACRO_VELDEN.map((veldDef): VoedingWeekRij => {
    let som = 0;
    let heeftWaarde = false;
    for (const dag of dagen) {
      const waarde = dag.rijen.find((rij) => rij.veld === veldDef.veld)?.waarde;
      if (waarde === null || waarde === undefined) continue;
      som += waarde;
      heeftWaarde = true;
    }

    const doel = doelVoorVeld(veldDef.veld, doelen);
    const gemiddeld =
      heeftWaarde && dagenGeregistreerd > 0
        ? Math.round((som / dagenGeregistreerd) * 10) / 10
        : 0;
    const over =
      heeftWaarde && doel !== null && doel > gemiddeld
        ? Math.round((doel - gemiddeld) * 10) / 10
        : null;

    return {
      veld: veldDef.veld,
      label: veldDef.label,
      unit: veldDef.unit,
      gemiddeld,
      doel,
      over,
    };
  });

  return { start, eind, dagenGeregistreerd, zonderWaarde, rijen };
}

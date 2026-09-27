import type { MacroDoelen } from "@/lib/account-macro-doelen";
import {
  bedragVanSupermarktveld,
  SUPERMARKT_MACRO_VELDEN,
  type SupermarktPortieLog,
  type SupermarktVeld,
} from "@/lib/nutrition-supermarkt-items";
import { supermarktCatalogEntry } from "@/data/nutrition/supermarkt-catalog";

/**
 * Eén week calorieën/macro's: de tabel gemiddeld / doel / over — de
 * parallelle tegenhanger van `nutrition-weekoverzicht.ts` (die rekent over
 * `DagboekItem`/`NutrientId`, het tekortsysteem).
 *
 * ## Waarom een eigen module en geen uitbreiding van `nutrition-weekoverzicht.ts`
 *
 * `bouwWeekoverzicht()` daar rekent via `nutrientenUitItems`/`sanitizeItems`
 * — de tekortsom. Supermarkt-macro's mogen daar niet doorheen lopen (zie
 * `nutrition-supermarkt-items.ts` en
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3). Wel
 * hergebruikt: `weekStart`/`verschuifWeek`/`weekDatums`/`weekLabel` uit die
 * module zijn generiek (geen `NutrientId` erin) en gelden hier onveranderd —
 * de aanroeper (`DagboekScherm.tsx`) importeert die rechtstreeks.
 *
 * ## Waarom "over" hier een neutraal restgetal is, geen "te gaan"
 *
 * `nutrition-weekoverzicht.ts` noemt die kolom bewust "te gaan" in plaats van
 * "over": bij het tekortsysteem zou "over" op een lege week het hele doel
 * tonen alsof er nog dekking te halen viel, terwijl niet-registreren daar
 * geen nul betekent. Het besluit (§1 Laag B) verbiedt voor calorieën/macro's
 * expliciet een ander soort oordeel — een weekscore-in-%. Een neutraal
 * restgetal ("nog 800 kcal tot je doel") draagt geen tekort-taal en is hier
 * dus toegestaan; op een lege week toont dit overzicht "nog niets
 * geregistreerd" in plaats van een getal, om dezelfde reden als het
 * tekortsysteem — een ontbrekende registratie is geen nul.
 *
 * ## Waarom een map van datum → logs, geen platte lijst
 *
 * `SupermarktPortieLog` draagt geen datumveld (dat leeft op API-niveau via
 * `/api/account/supermarkt-portie-logs?date=`) — de aanroeper haalt per dag
 * op en geeft hier een map mee, zodat "hoeveel dagen zijn geregistreerd"
 * hier correct te tellen is zonder dat dit bestand iets over de opslag hoeft
 * te weten.
 */

export type SupermarktWeekRij = {
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

export type SupermarktWeekoverzicht = {
  start: string;
  eind: string;
  dagenGeregistreerd: number;
  rijen: SupermarktWeekRij[];
};

const DOEL_PER_VELD: Partial<Record<SupermarktVeld, (doelen: MacroDoelen) => number | null>> = {
  energyKcal: (d) => d.calorieenKcal,
};

/**
 * Percentage-doelen (koolhydraten/vet/eiwit) zijn geen absoluut grammendoel
 * totdat er een calorierichtlijn bij staat — `gram = pct% × kcal / 4 of 9`.
 * Zonder calorierichtlijn is een percentage niet om te rekenen naar gram, dus
 * dan blijft `doel` null (geen berekening voorstellen die het systeem niet
 * mag maken — het percentage zelf blijft in Laag C's eigen scherm zichtbaar).
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

export function bouwSupermarktWeekoverzicht(
  logsPerDag: ReadonlyMap<string, readonly SupermarktPortieLog[]>,
  datums: readonly string[],
  doelen: MacroDoelen,
): SupermarktWeekoverzicht {
  const start = datums[0] ?? "";
  const eind = datums[datums.length - 1] ?? "";
  const dagenGeregistreerd = datums.filter((d) => (logsPerDag.get(d)?.length ?? 0) > 0).length;

  const rijen = SUPERMARKT_MACRO_VELDEN.map((veldDef): SupermarktWeekRij => {
    let som = 0;
    let heeftBedrag = false;
    for (const datum of datums) {
      for (const log of logsPerDag.get(datum) ?? []) {
        const product = supermarktCatalogEntry(log.prodId);
        if (!product) continue;
        const bedrag = bedragVanSupermarktveld(product, veldDef.veld, log.grams);
        if (bedrag === null) continue;
        som += bedrag;
        heeftBedrag = true;
      }
    }

    const doel = doelVoorVeld(veldDef.veld, doelen);
    const gemiddeld =
      heeftBedrag && dagenGeregistreerd > 0
        ? Math.round((som / dagenGeregistreerd) * 10) / 10
        : 0;
    const over =
      heeftBedrag && doel !== null && doel > gemiddeld
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

  return { start, eind, dagenGeregistreerd, rijen };
}

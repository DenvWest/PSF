import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import {
  bouwWeekoverzicht,
  verschuifWeek,
  type WeekRij,
} from "@/lib/nutrition-weekoverzicht";

/**
 * De trend per stof: hetzelfde weekgemiddelde als het weekoverzicht, maar dan
 * meerdere weken achter elkaar in plaats van één week in detail.
 *
 * ## Waarom dit geen nieuwe rekenkern is
 *
 * `nutrition-weekoverzicht.ts` bouwt al precies wat een week nodig heeft
 * (gemiddelde, referentie, dekking) voor één week. Een trend is niets anders
 * dan die berekening N keer herhalen met `verschuifWeek` en de uitkomsten op
 * een rij zetten. Een aparte rekenkern zou dezelfde asymmetrie-regel en
 * dezelfde "alleen bewijsbare stoffen"-logica een tweede keer moeten
 * implementeren, met het risico dat de twee uit elkaar lopen.
 *
 * ## Waarom weken en geen dagen
 *
 * Een dag-voor-dag lijn over twaalf weken is vierentachtig punten — ruis, geen
 * trend. Een week is de kortste periode die de kalibratie- en
 * weekendvergelijking uit het dagboek al gebruikt (zie `nutrition-dagboek.ts`
 * §3.2 van het besluit), dus hij ligt hier voor de hand als eenheid.
 */

export type TrendPunt = {
  /** Maandag van deze week, ISO. */
  weekStart: string;
  /** Het weekgemiddelde, of null als er niets geregistreerd is in die week. */
  waarde: number | null;
  /** Deel van de referentie, of null zonder meting of bij een eigen doel. */
  aandeel: number | null;
  dagenGeregistreerd: number;
};

export type NutrientTrend = {
  nutrient: NutrientId;
  label: string;
  unit: "g" | "mg" | "µg";
  referentie: number | null;
  bewijsbaar: boolean;
  punten: TrendPunt[];
};

/**
 * De trend voor alle nutriënten, over `aantalWeken` weken tot en met de week
 * van `vandaag`.
 *
 * `aantalWeken` staat op 6 als standaard: genoeg om een patroon te zien,
 * weinig genoeg om op een telefoon nog leesbaar te zijn als staafjes.
 */
export function bouwTrend(
  dagen: readonly DagboekDag[],
  vandaag: string,
  aantalWeken = 6,
): NutrientTrend[] {
  const huidigeWeekStart = weekStartVan(vandaag);
  const weekStarts: string[] = [];
  for (let i = aantalWeken - 1; i >= 0; i -= 1) {
    weekStarts.push(verschuifWeek(huidigeWeekStart, -i));
  }

  const weekOverzichten = weekStarts.map((start) => bouwWeekoverzicht(dagen, start));

  return NUTRIENT_ORDER.map((nutrient) => {
    const eersteRij = weekOverzichten[0]!.rijen.find((r) => r.nutrient === nutrient)!;

    const punten: TrendPunt[] = weekOverzichten.map((overzicht, index) => {
      const rij = overzicht.rijen.find((r) => r.nutrient === nutrient) as WeekRij;
      return {
        weekStart: weekStarts[index]!,
        waarde: rij.dagenMetBron === 0 ? null : rij.gemiddeld,
        aandeel: rij.aandeel,
        dagenGeregistreerd: overzicht.dagenGeregistreerd,
      };
    });

    return {
      nutrient,
      label: eersteRij.label,
      unit: eersteRij.unit,
      referentie: eersteRij.referentie,
      bewijsbaar: eersteRij.bewijsbaar,
      punten,
    };
  });
}

function weekStartVan(datum: string): string {
  const dag = new Date(datum);
  dag.setDate(dag.getDate() - ((dag.getDay() + 6) % 7));
  return dag.toISOString().slice(0, 10);
}

/** Kort weeklabel voor onder een staafje: "wk 37". */
export function weekKort(weekStartIso: string): string {
  const dag = new Date(weekStartIso);
  const eersteJan = new Date(dag.getFullYear(), 0, 1);
  const dagenSindsJan = Math.floor(
    (dag.getTime() - eersteJan.getTime()) / 86_400_000,
  );
  const weeknummer = Math.ceil((dagenSindsJan + eersteJan.getDay() + 1) / 7);
  return `wk ${weeknummer}`;
}

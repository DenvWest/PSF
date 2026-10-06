import { VENSTER_LABEL, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import type { Richting, Vensterreeks } from "@/lib/nutrition-tekortsysteem";

export type KeuzeMeting = {
  aandeel: number;
  gedekt: boolean;
  richting: Richting;
  vensters: { label: string; waarde: string }[];
};

/**
 * De gemeten stand van één stof, uit het dagboek, voor de Keuze-tab.
 *
 * Null wanneer er niets te tonen valt: een stof die een dagboek niet kan
 * aantonen (zink, vitamine D) of nog geen geregistreerde dagen heeft. De
 * kaart valt dan terug op het checkantwoord.
 */
export function keuzeMeting(reeks: Vensterreeks | undefined): KeuzeMeting | null {
  if (!reeks || !reeks.bewijsbaar) return null;
  const gevuld = reeks.vensters.filter((venster) => venster.dagen > 0 && venster.aandeel !== null);
  const langste = gevuld[gevuld.length - 1];
  if (!langste || langste.aandeel === null) return null;
  return {
    aandeel: langste.aandeel,
    gedekt: langste.gedekt === true,
    richting: reeks.richting,
    vensters: gevuld.map((venster) => ({
      label: VENSTER_LABEL[venster.dagen_terug],
      waarde: percentageADH(venster.aandeel),
    })),
  };
}

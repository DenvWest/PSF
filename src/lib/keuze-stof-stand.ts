import type { NutrientId } from "@/data/nutrition/intake-reference";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { NIET_BEWIJSBAAR, type Venster, type Vensterreeks } from "@/lib/nutrition-tekortsysteem";

/**
 * Waar één stof staat volgens je dagboek, voor Keuze → Vergelijken. Vervangt
 * de laag-6-poort uit de check-ladder (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`,
 * herziening 6 okt): de supplementkant gaat niet meer op slot, hij krijgt meer
 * of minder nadruk naar wat je dagboek laat zien.
 *
 * - `op_koers`: de gemeten ondergrens haalt je norm. Bewezen dekking.
 * - `ruimte`: je dagboek haalt de norm nog niet. Geen tekort — een dagboek is
 *   een ondergrens en een tekort stelt een arts vast (asymmetrie-regel) — maar
 *   wel de plek waar een keuze iets uitmaakt.
 * - `niet_meetbaar`: een dagboek kan deze stof niet aantonen (zink, vitamine D).
 * - `onbekend`: minder dan {@link MIN_DAGEN} geregistreerde dagen.
 * - `geen_doel`: genoeg dagen, maar geen norm om tegen te leggen. Alleen eiwit:
 *   dat doel rekent met gewicht en trainingsbelasting uit Je doelen, en het
 *   tekortsysteem rekent eiwit daarom nooit zelf als aandeel (`aandeelVanNorm`).
 *   Tot 7 oktober viel eiwit hier op `onbekend` ("te weinig dagen"), ook met
 *   een vol dagboek.
 */

export type KeuzeStand = "op_koers" | "ruimte" | "niet_meetbaar" | "onbekend" | "geen_doel";

export type KeuzeStofStand = {
  nutrient: NutrientId;
  stand: KeuzeStand;
  /** Het venster waarop de stand rust (7 dagen, anders 30), of null. */
  venster: { dagen_terug: number; dagen: number; dagenMetBron: number } | null;
  /** Gemiddeld per dag, in `unit`. */
  gemiddeld: number | null;
  norm: number | null;
  aandeel: number | null;
  unit: string;
  /** Eén neutrale zin over de stand, zonder "tekort". */
  zin: string;
  benaderd: boolean;
};

export const MIN_DAGEN = 3;

function bruikbaarVenster(reeks: Vensterreeks): Venster | null {
  for (const lengte of [7, 30] as const) {
    const venster = reeks.vensters.find((v) => v.dagen_terug === lengte);
    if (venster && venster.dagen >= MIN_DAGEN) return venster;
  }
  return null;
}

/**
 * @param eiwitDoelG je eiwitdoel uit Je doelen (`useEiwitDoel`), alleen gebruikt
 *   voor eiwit, waar het venster zelf geen aandeel draagt.
 */
export function keuzeStofStand(
  nutrient: NutrientId,
  reeks: Vensterreeks | undefined,
  eiwitDoelG: number | null = null,
): KeuzeStofStand {
  const unit = reeks?.unit ?? "";
  const leeg = { venster: null, gemiddeld: null, norm: null, aandeel: null, unit, benaderd: false };

  const nietMeetbaar = NIET_BEWIJSBAAR[nutrient];
  if (nietMeetbaar || (reeks && !reeks.bewijsbaar)) {
    return { nutrient, stand: "niet_meetbaar", ...leeg, zin: nietMeetbaar ?? "Een dagboek kan deze stof niet aantonen." };
  }

  const gevonden = reeks ? bruikbaarVenster(reeks) : null;
  const venster =
    gevonden && gevonden.aandeel === null && nutrient === "protein" && eiwitDoelG
      ? { ...gevonden, aandeel: gevonden.gemiddeld / eiwitDoelG, gedekt: gevonden.gemiddeld >= eiwitDoelG }
      : gevonden;

  if (reeks && venster && venster.aandeel === null) {
    const periode = venster.dagen_terug === 7 ? "de laatste 7 dagen" : "de laatste 30 dagen";
    return {
      nutrient,
      stand: "geen_doel",
      venster: { dagen_terug: venster.dagen_terug, dagen: venster.dagen, dagenMetBron: venster.dagenMetBron },
      gemiddeld: venster.gemiddeld,
      norm: null,
      aandeel: null,
      unit,
      benaderd: venster.benaderd === true,
      zin: `Je dagboek komt op gemiddeld ${venster.benaderd ? "≈ " : ""}${hoeveelheid(venster.gemiddeld)} ${unit} per dag, ${periode}. Zonder eiwitdoel geen percentage: dat rekent met je gewicht en trainingsbelasting uit Je doelen.`,
    };
  }

  if (!reeks || !venster || venster.aandeel === null) {
    return {
      nutrient,
      stand: "onbekend",
      ...leeg,
      zin: `Nog te weinig dagen in je dagboek. Vanaf ${MIN_DAGEN} dagen zie je hier waar je staat.`,
    };
  }

  const norm = venster.aandeel > 0 ? venster.gemiddeld / venster.aandeel : null;
  const periode = venster.dagen_terug === 7 ? "de laatste 7 dagen" : "de laatste 30 dagen";
  const benaderd = venster.benaderd === true;
  const gem = `${benaderd ? "≈ " : ""}${hoeveelheid(venster.gemiddeld)} ${unit}`;
  const tegen = norm ? ` van ${hoeveelheid(norm)} ${unit}` : "";
  const basis = {
    nutrient,
    venster: { dagen_terug: venster.dagen_terug, dagen: venster.dagen, dagenMetBron: venster.dagenMetBron },
    gemiddeld: venster.gemiddeld,
    norm,
    aandeel: venster.aandeel,
    unit,
    benaderd,
  };

  if (venster.gedekt === true) {
    return {
      ...basis,
      stand: "op_koers",
      zin: `Je eten haalt je norm: gemiddeld ${gem}${tegen} per dag, ${periode}.`,
    };
  }
  return {
    ...basis,
    stand: "ruimte",
    zin: `Je dagboek komt op gemiddeld ${gem}${tegen} per dag (${percentageADH(venster.aandeel)}), ${periode}. Dat is minstens wat je binnenkreeg — hier maakt een keuze verschil.`,
  };
}

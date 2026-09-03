import { NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";
import type { NutrientSufficiency } from "@/lib/nutrition-sufficiency";

/**
 * De nutriëntenkolom — wat je binnenkrijgt, per stof, als staande rail.
 *
 * **Waarom de stoffen de kolom dragen en niet de prioriteiten.** De
 * prioriteiten zijn een volgorde van aanpakken: eerst je basis, dan kwaliteit,
 * dan verhoudingen. Dat is een route, en een route lees je van links naar
 * rechts — horizontaal, als stappen. De stoffen zijn iets anders: een lijst
 * meetwaarden die je naast elkaar wilt kunnen aflezen, elk met een eigen
 * balk. Dat is een kolom.
 *
 * Zet je ze om, dan vecht de vorm met de inhoud: zes stappen onder elkaar
 * lezen als een checklist die je afwerkt, en vijf meetwaarden naast elkaar
 * verliezen hun onderlinge vergelijkbaarheid.
 *
 * **De harde grens die deze module bewaakt.** `food-sources.ts` zegt het
 * letterlijk: de waarden daar tellen NIET op tot een dagtotaal, en de band per
 * nutriënt komt uit frequentievragen — niet uit grammen. Deze rail toont dus
 * bánden en aandelen, nooit een opgetelde mg-waarde en nooit een
 * percentage-van-de-dagbehoefte. Wie hier later een getal aan toevoegt, moet
 * eerst die bron veranderen.
 *
 * **Macro en micro apart.** Eiwit is een macronutriënt (je eet er tientallen
 * grammen van), magnesium en zink zijn micronutriënten (milligrammen), vitamine
 * D microgrammen, en omega-3 zit daartussenin. Ze in één ongesorteerde lijst
 * zetten suggereert dat ze dezelfde soort meetwaarde zijn. De groepering zegt
 * wat voor soort grootheid je leest, zonder een getal te noemen dat we niet
 * hebben.
 */

export type NutrientGroep = "macro" | "micro";

/**
 * In welke groep een stof valt.
 *
 * Omega-3 is strikt genomen een vetzuur en dus macro, maar de hoeveelheden
 * (honderden mg EPA/DHA) en de manier waarop je hem haalt — één bron, een paar
 * keer per week — lezen als een micronutriënt. Hij staat bij micro omdat dat
 * is hoe je hem in de praktijk stuurt, en die keuze staat hier expliciet in
 * plaats van verstopt in een sorteerfunctie.
 */
export const NUTRIENT_GROEP: Record<NutrientId, NutrientGroep> = {
  protein: "macro",
  omega3: "micro",
  magnesium: "micro",
  vitamin_d: "micro",
  zinc: "micro",
};

export const NUTRIENT_GROEP_LABEL: Record<NutrientGroep, string> = {
  macro: "Macronutriënten",
  micro: "Micronutriënten",
};

/**
 * Eén rij in de rail: de stof, waar hij staat, en waar dat op rust.
 *
 * `dekking` is een positie op de balk (0–1), geen percentage van je behoefte.
 * Het verschil telt: een percentage nodigt uit tot optellen en tot "nog 30% te
 * gaan", en dat is precies de rekensom die de bron verbiedt. De positie zegt
 * alleen in welke band je zit, met de zekerheid van een frequentievraag.
 */
export type NutrientRailRij = {
  nutrient: NutrientId;
  label: string;
  groep: NutrientGroep;
  band: IntakeBand;
  /** Positie op de balk, 0–1. Het midden van de band — nooit een precisie die de bron niet draagt. */
  dekking: number;
  /** De bronnen die dit het sterkst dragen, sterkste eerst. */
  bronnen: readonly { labelNl: string; share: number }[];
  /** Of deze stof op P6 een keuze verdient. */
  p6Relevant: boolean;
};

/**
 * Waar de marker staat per band.
 *
 * Dezelfde redenering als `markerPositie` in `dashboard-surface.ts`: de check
 * meet frequentie, geen hoeveelheid, dus de marker gaat naar het midden van
 * zijn band. Meer precisie zou schijnprecisie zijn.
 */
const BAND_POSITIE: Record<IntakeBand, number> = {
  below: 0.17,
  around: 0.5,
  meets: 0.83,
};

export const BAND_WOORD: Record<IntakeBand, string> = {
  below: "ruimte",
  around: "rond",
  meets: "op orde",
};

export function bouwNutrientRail(
  nutrients: readonly NutrientSufficiency[],
): NutrientRailRij[] {
  const perId = new Map(nutrients.map((rij) => [rij.nutrient, rij]));
  const rijen: NutrientRailRij[] = [];
  // NUTRIENT_IDS bepaalt de volgorde, niet de binnenkomende array: zo staat de
  // rail bij elke check in dezelfde volgorde, ook als de engine er ooit een
  // andere sortering op loslaat. Een kolom die van volgorde wisselt tussen twee
  // checks is niet te vergelijken met je vorige keer.
  for (const id of NUTRIENT_IDS) {
    const bron = perId.get(id);
    if (!bron) {
      continue;
    }
    rijen.push({
      nutrient: id,
      label: bron.label,
      groep: NUTRIENT_GROEP[id],
      band: bron.band,
      dekking: BAND_POSITIE[bron.band],
      bronnen: bron.leadingSources,
      p6Relevant: bron.p6Relevant,
    });
  }
  return rijen;
}

/** De rail in twee groepen, lege groepen weggelaten. */
export function railGroepen(
  rijen: readonly NutrientRailRij[],
): { groep: NutrientGroep; label: string; rijen: NutrientRailRij[] }[] {
  const groepen: NutrientGroep[] = ["macro", "micro"];
  return groepen
    .map((groep) => ({
      groep,
      label: NUTRIENT_GROEP_LABEL[groep],
      rijen: rijen.filter((rij) => rij.groep === groep),
    }))
    .filter((blok) => blok.rijen.length > 0);
}

/**
 * De samenvattende regel boven de rail.
 *
 * Telt hoeveel stoffen ruimte laten zien, want dat is de vraag waarmee iemand
 * naar deze kolom kijkt. Nooit een gemiddelde over de vijf: een gemiddelde
 * band is geen grootheid die ergens op slaat.
 */
export function railBronregel(rijen: readonly NutrientRailRij[]): string {
  if (rijen.length === 0) {
    return "Doe de voedingscheck om je stoffen te zien.";
  }
  const ruimte = rijen.filter((rij) => rij.band === "below").length;
  if (ruimte === 0) {
    return `${rijen.length} stoffen · geen duidelijke ruimte`;
  }
  return `${rijen.length} stoffen · ${ruimte} met ruimte`;
}

/**
 * Bij welke prioriteit een stof iets te zeggen heeft.
 *
 * **Waarom de rail meebeweegt met de prioriteit en niet met de sortering.** De
 * sorteerkeuze gaat over de leesvolgorde van de zes prioriteiten; die zegt
 * niets over welke stoffen relevant zijn. Koppel je de kolom daaraan, dan
 * bewegen twee onafhankelijke assen tegelijk en weet je bij een veranderde
 * kolom niet meer wat de oorzaak was. De actieve prioriteit is wél een
 * inhoudelijke vraag: op P1 (je basis) dragen alle stoffen mee, op P4 (jouw
 * situatie) de stoffen waar de check ruimte ziet, op P6 (aanvullen) alleen de
 * stoffen waar een supplementkeuze speelt.
 *
 * Buiten die drie lagen filtert de rail niet: P2, P3 en P5 gaan over kwaliteit,
 * verdeling en meten — vragen waarop geen enkele stof een beter of slechter
 * antwoord geeft, en een willekeurige inperking zou dan suggereren dat er wél
 * een verband is.
 */
export function railVoorPrioriteit(
  rijen: readonly NutrientRailRij[],
  prioriteit: number | null,
): NutrientRailRij[] {
  if (prioriteit === 6) {
    return rijen.filter((rij) => rij.p6Relevant);
  }
  if (prioriteit === 4) {
    return rijen.filter((rij) => rij.band !== "meets");
  }
  return [...rijen];
}

/**
 * De regel die zegt waaróm de kolom korter is dan je stoffenlijst.
 *
 * Zonder die regel leest een gefilterde kolom als een kolom die stoffen kwijt
 * is. Null waar er niet gefilterd is — dan valt er niets uit te leggen.
 */
export function railFilterRegel(prioriteit: number | null): string | null {
  if (prioriteit === 6) {
    return "Alleen de stoffen waar een supplementkeuze speelt.";
  }
  if (prioriteit === 4) {
    return "Alleen de stoffen waar je check ruimte ziet.";
  }
  return null;
}

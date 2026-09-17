import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De wettelijke referentie-innames (RI) uit EU 1169/2011, bijlage XIII.
 *
 * ## Waarom dit los staat van `intake-reference.ts`
 *
 * Die tabel draagt **indicatieve** drempels — zijn eigen moduledoc zegt het
 * onomwonden: "vuistregels, geen gevalideerde norm", met een TODO om ze door
 * gebronde grenzen te vervangen. Dat is prima voor het inschatten van een
 * frequentie-antwoord, maar niet om een percentage op te baseren.
 *
 * De waarden hieronder zijn wél een norm, en een die letterlijk in een
 * verordening staat. Ze mengen niet: een dekkingspercentage rekent tegen deze
 * getallen, een bandindeling tegen die van hiernaast.
 *
 * ## Waarom percentages hier mogen
 *
 * Artikel 32 van 1169/2011 schrijft voor dat een vermelding van vitaminen en
 * mineralen wordt uitgedrukt als percentage van de RI. Een dekkingspercentage
 * op een voedingsmiddel is dus een **feitelijke samenstellingsvermelding**,
 * geen claim — en die vorm is niet alleen toegestaan maar de voorgeschreven
 * manier.
 *
 * Twee drempels volgen er rechtstreeks uit, vastgelegd in de bijlage bij
 * verordening 1924/2006:
 *
 * | Drempel | Wat je dan mag zeggen |
 * |---|---|
 * | 15 % RI per 100 g | "bron van" |
 * | 30 % RI per 100 g | "rijk aan" / "hoog gehalte aan" |
 *
 * Dat staat los van een **gezondheidsclaim** ("draagt bij tot vermindering van
 * vermoeidheid"), die pas mag boven de EFSA-drempel per dagdosis — voor
 * magnesium 56,25 mg, zoals `approved-claims.ts` al vastlegt. Twee
 * verschillende dingen, twee verschillende labels in de UI.
 *
 * ## Eiwit is de uitzondering
 *
 * De RI voor eiwit (50 g) is een etiketwaarde voor een gemiddelde volwassene,
 * niet een persoonlijk doel. Voor eiwit rekent dit product met gewicht en
 * belasting (`protein-target.ts`), en dat getal hoort dus níét uit deze tabel
 * te komen. Hij staat er wel in, omdat een etiketpercentage nu eenmaal tegen
 * de RI gaat — maar `personalTarget` markeert dat je voor de dekking ergens
 * anders moet zijn.
 */

export type ReferenceIntake = {
  nutrient: NutrientId;
  /** De RI zoals bijlage XIII hem geeft. */
  value: number;
  unit: "g" | "mg" | "µg";
  /**
   * Of het persoonlijke doel elders vandaan komt.
   *
   * True betekent: gebruik deze waarde alleen voor etiket-percentages per
   * portie, niet om iemands dekking tegen af te meten.
   */
  personalTarget: boolean;
};

/** Bijlage XIII, deel A, punt 1 — de waarden voor volwassenen. */
export const REFERENCE_INTAKES: Record<NutrientId, ReferenceIntake> = {
  protein: { nutrient: "protein", value: 50, unit: "g", personalTarget: true },
  magnesium: { nutrient: "magnesium", value: 375, unit: "mg", personalTarget: false },
  zinc: { nutrient: "zinc", value: 10, unit: "mg", personalTarget: false },
  vitamin_d: { nutrient: "vitamin_d", value: 5, unit: "µg", personalTarget: false },
  /**
   * Omega-3 staat níét in bijlage XIII — er is geen RI voor EPA/DHA.
   * De 250 mg is de voorwaarde waaronder EFSA de hartclaim toestaat
   * (`approved-claims.ts`), en die gebruiken we hier als referentiepunt.
   * Daarom is dit de enige rij waar "% van de RI" strikt genomen "% van de
   * claimdrempel" is; de UI noemt hem dan ook anders.
   */
  omega3: { nutrient: "omega3", value: 250, unit: "mg", personalTarget: false },
};

/** Drempel waarboven een product "bron van" mag heten (per 100 g). */
export const BRON_VAN_DREMPEL = 0.15;

/** Drempel waarboven een product "rijk aan" mag heten (per 100 g). */
export const RIJK_AAN_DREMPEL = 0.3;

export type ClaimNiveau = "rijk_aan" | "bron_van" | "onder_drempel";

/**
 * Welk samenstellingslabel een gehalte per 100 g mag dragen.
 *
 * Let op de eenheid: de drempels gelden **per 100 g product**, niet per portie.
 * Een handvol amandelen levert 18 % van de magnesium-RI en amandelen zijn
 * tóch "rijk aan magnesium" — dat oordeel gaat over het product, niet over
 * wat jij ervan at.
 */
export function claimNiveauVoor(
  nutrient: NutrientId,
  per100g: number,
): ClaimNiveau {
  const ri = REFERENCE_INTAKES[nutrient];
  const aandeel = per100g / ri.value;
  if (aandeel >= RIJK_AAN_DREMPEL) return "rijk_aan";
  if (aandeel >= BRON_VAN_DREMPEL) return "bron_van";
  return "onder_drempel";
}

/**
 * Welk deel van de RI een hoeveelheid dekt, als fractie.
 *
 * Geeft null wanneer het persoonlijke doel elders vandaan komt (eiwit): dan
 * zou een percentage tegen de etiketwaarde een doel suggereren dat dit product
 * niet hanteert.
 */
export function aandeelVanRi(nutrient: NutrientId, hoeveelheid: number): number | null {
  const ri = REFERENCE_INTAKES[nutrient];
  if (ri.personalTarget) return null;
  return hoeveelheid / ri.value;
}

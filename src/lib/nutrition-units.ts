import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De eenheden waarin een gehalte wordt uitgedrukt, en hoe je er veilig mee
 * optelt.
 *
 * ## Waarom deze module bestaat
 *
 * `nutrientenUitItems` telde tot september 2026 `bedrag.value` op zonder naar
 * `bedrag.unit` te kijken, en zette de eenheid van het resultaat op die van
 * het laatste item dat langskwam. Zolang elke bron van één stof dezelfde
 * eenheid draagt is dat onzichtbaar goed — en dat was het ook: voeding staat
 * in g (eiwit), mg (magnesium, zink, EPA+DHA) en µg (vitamine D), en de
 * supplementcatalogus volgde dat toevallig exact.
 *
 * Het probleem is dat niets dat afdwong. Eén vitamine-D-supplement in µg
 * naast een etiketwaarde in IE, of één omega-3-rij in gram, en 25 wordt bij
 * 10 opgeteld. Er komt geen foutmelding; er komt een getal dat er precies zo
 * uitziet als een goed getal. Dat is de gevaarlijkste soort rekenfout, en de
 * reden dat de optelling voortaan door {@link toBase} gaat.
 *
 * ## Hoe het werkt
 *
 * Elke stof heeft één canonieke basiseenheid ({@link BASE_UNIT}). Bij het
 * optellen wordt elk bedrag eerst naar die basis omgerekend; de som wordt
 * daarna in de basiseenheid uitgedrukt. Een eenheid die niet naar de basis te
 * rekenen is (een toekomstige IE-waarde, die een stofspecifieke factor heeft)
 * levert `null` en valt daarmee zichtbaar om in plaats van stil mee te tellen.
 *
 * ## Wat dit niet doet
 *
 * **Geen IE-conversie.** IE → µg verschilt per stof (vitamine D: 1 µg = 40 IE,
 * vitamine E heeft een andere factor) en hangt bij sommige stoffen af van de
 * chemische vorm. Die factor hoort bij de catalogusregel die hem gebruikt,
 * niet in een generieke tabel. Zolang `unit` geen IE kent, kan die fout niet
 * ontstaan; komt IE er ooit bij, dan dwingt het type hier af dat er eerst een
 * expliciet besluit valt.
 */

/** De eenheden die een gehalte kan dragen. Bewust klein gehouden. */
export type NutrientUnit = "g" | "mg" | "µg";

/**
 * Hoeveel van de kleinste eenheid (µg) er in één van deze eenheid gaat.
 *
 * Omrekenen loopt via µg en niet via gram, omdat µg de kleinste is: zo is elke
 * conversie een vermenigvuldiging met een geheel getal en introduceert de
 * omrekening zelf geen drijvende-komma-afwijking.
 */
const IN_MICROGRAM: Record<NutrientUnit, number> = {
  µg: 1,
  mg: 1_000,
  g: 1_000_000,
};

/**
 * De eenheid waarin de som van een stof wordt uitgedrukt.
 *
 * Dit is de eenheid waarin de stof gangbaar wordt besproken — dezelfde waarin
 * `FOOD_SOURCES` hem vandaag al draagt. De keuze is dus geen wijziging van
 * gedrag maar een vastlegging ervan: wat impliciet gold, staat nu vast en
 * wordt getest ({@link nutrition-units.test.ts}).
 */
export const BASE_UNIT: Record<NutrientId, NutrientUnit> = {
  protein: "g",
  magnesium: "mg",
  zinc: "mg",
  omega3: "mg",
  vitamin_d: "µg",
};

/**
 * Rekent een bedrag om naar de basiseenheid van de stof.
 *
 * `null` betekent: deze eenheid is niet naar de basis te rekenen. De aanroeper
 * mag dat nooit als nul behandelen — een onbekende eenheid is een gat in de
 * data, geen afwezigheid van de stof.
 */
export function toBase(
  value: number,
  unit: NutrientUnit,
  nutrient: NutrientId,
): number | null {
  if (!Number.isFinite(value)) return null;

  const factor = IN_MICROGRAM[unit];
  const doel = IN_MICROGRAM[BASE_UNIT[nutrient]];
  if (!factor || !doel) return null;

  return (value * factor) / doel;
}

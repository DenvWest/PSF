import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";
import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { indexedFood, NUTRIENT_ORDER } from "@/lib/nutrition-food-index";

/**
 * Producten en gerechten op het 2+2-dagboek — de invoervorm die weet wélk
 * product je at.
 *
 * ## Waarom dit naast `portions` en `meals` bestaat
 *
 * Dezelfde reden waarom `meals` er in september naast `portions` kwam: de
 * invoervorm mag fijner worden, de analyse-as niet. `portions` blijft de bron
 * voor breedte, variatie, de weekendvergelijking en de zelfrapport-brug; elk
 * item draagt zijn voedselgroep, dus `portions` wordt eruit afgeleid
 * ({@link portiesUitItems}).
 *
 * Wat dit toevoegt dat de groepenvorm niet kon, is precies de vondst uit
 * BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1 §4: op groepsniveau telt "vis" tonijn uit
 * blik even zwaar als makreel, en is verrijkte margarine niet van olijfolie te
 * onderscheiden. Alleen hier staat wélke bron het was.
 *
 * ## De ondergrens-regel
 *
 * Een som over gekozen items is een **ondergrens**, nooit een dagtotaal.
 * Niemand noemt alles — de koffie, de olijfolie, het broodje dat je vergat.
 * {@link nutrientenUitItems} levert daarom een bedrag plus het aantal items
 * dat eraan bijdroeg én het aantal dat geen gehalte had; de laag erboven is
 * verplicht het woord "minstens" mee te dragen en te zeggen hoeveel items
 * zwegen.
 *
 * ## Wat dit niet doet
 *
 * **Geen tweede score.** Zelfde lock als bij beweging (minuten = evidence,
 * nooit een tweede score). Dit verrijkt de readout van laag 5 en voedt
 * `nutrition-score.ts` niet.
 *
 * **Geen calorieën, geen macro's.** Laag 5 blijft dicht voor tellen.
 *
 * **Geen portie-omrekening buiten gram.** Elk item draagt zijn gewicht in
 * gram; het gehalte komt uit `nutrientValue` (per 100 g), het enige getal dat
 * ongewijzigd uit de brondataset komt. De portie-labels uit `FOOD_SOURCES`
 * horen bij hún portie en worden hier niet gebruikt.
 */

/** Eén geregistreerd product of gerecht, op één eetmoment. */
export type DagboekItem = {
  moment: EetmomentId;
  /** Sleutel in `FOOD_CATALOG`. */
  key: string;
  /** Gewicht in gram. Hele grammen; het dagboek claimt geen halve. */
  grams: number;
};

/** Grootste portie die het dagboek accepteert — hoger is bijna altijd een typfout. */
const MAX_GRAMS = 2000;

/** Hoeveel items één dag mag dragen. Daarboven wordt het een boekhouding. */
const MAX_ITEMS = 60;

/**
 * Maakt van ruwe invoer een geldige itemlijst.
 *
 * Zelfde filosofie als `sanitizePortions`: onbekende sleutels vallen eraf
 * zonder de rest weg te gooien. Een item met een key die de catalogus niet
 * kent, verdwijnt — anders draagt de opslag een verwijzing naar niets, en
 * levert een latere uitlezing een gat dat niet van "geen gehalte" te
 * onderscheiden is.
 */
export function sanitizeItems(raw: unknown): DagboekItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const result: DagboekItem[] = [];
  for (const entry of raw) {
    if (result.length >= MAX_ITEMS) break;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const { moment, key, grams } = entry as Record<string, unknown>;
    if (typeof moment !== "string" || !isEetmomentId(moment)) continue;
    if (typeof key !== "string" || !catalogEntry(key)) continue;
    if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
    result.push({ moment, key, grams: Math.min(Math.trunc(grams), MAX_GRAMS) });
  }
  return result;
}

/**
 * Leidt de portie-map af uit de items: elk item vult zijn eigen voedselgroep.
 *
 * Eén item is één portie van zijn groep, ongeacht het gewicht. Dat klinkt grof
 * en is het ook — maar `portions` telt breedte en variatie, niet hoeveelheid,
 * en een half bord spinazie maakt je dag niet half zo gevarieerd. De
 * hoeveelheid leeft in `grams` en wordt daar gebruikt waar hij iets betekent:
 * in de milligram-uitlezing.
 */
export function portiesUitItems(
  items: readonly DagboekItem[],
): Partial<Record<VoedselgroepId, number>> {
  const result: Partial<Record<VoedselgroepId, number>> = {};
  for (const item of items) {
    const entry = catalogEntry(item.key);
    if (!entry) continue;
    result[entry.groep] = (result[entry.groep] ?? 0) + 1;
  }
  return result;
}

/** Wat één nutriënt uit de geregistreerde items oplevert. */
export type NutrientOndergrens = {
  nutrient: NutrientId;
  /** Som over de items die een gehalte hadden, in de eenheid van het nutriënt. */
  minstens: number;
  unit: "g" | "mg" | "µg";
  /** Hoeveel items aan dit bedrag bijdroegen. */
  bronnen: number;
  /**
   * Hoeveel geregistreerde items géén gehalte voor deze stof hadden.
   *
   * Dit getal hoort in beeld te blijven: het is het verschil tussen "je at
   * weinig magnesium" en "we weten van drie dingen die je at niet hoeveel
   * magnesium erin zit".
   */
  zonderGehalte: number;
};

/**
 * De milligram-ondergrens per nutriënt over één dag.
 *
 * Levert alleen de nutriënten waarvoor ten minste één item een gehalte had.
 * Een stof zonder enkele bron komt niet als nul terug maar helemaal niet —
 * nul zou beweren dat je er niets van binnenkreeg, en dat weet dit dagboek
 * niet.
 */
export function nutrientenUitItems(
  items: readonly DagboekItem[],
): NutrientOndergrens[] {
  const result: NutrientOndergrens[] = [];

  for (const nutrient of NUTRIENT_ORDER) {
    let minstens = 0;
    let bronnen = 0;
    let zonderGehalte = 0;
    let unit: "g" | "mg" | "µg" | null = null;

    for (const item of items) {
      const entry = catalogEntry(item.key);
      const bronKey = entry?.bron;
      const rij = bronKey
        ? indexedFood(bronKey)?.nutrients.find((n) => n.nutrient === nutrient)
        : undefined;
      const per100g = rij?.source.nutrientValue;

      if (!per100g) {
        zonderGehalte += 1;
        continue;
      }
      minstens += (per100g.value * item.grams) / 100;
      bronnen += 1;
      unit = per100g.unit;
    }

    if (bronnen === 0 || !unit) continue;
    result.push({
      nutrient,
      minstens: Math.round(minstens * 10) / 10,
      unit,
      bronnen,
      zonderGehalte,
    });
  }

  return result;
}

/** De items van één eetmoment, in de volgorde waarin ze zijn ingevoerd. */
export function itemsVanMoment(
  items: readonly DagboekItem[],
  moment: EetmomentId,
): DagboekItem[] {
  return items.filter((item) => item.moment === moment);
}

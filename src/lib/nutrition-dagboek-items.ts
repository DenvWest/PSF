import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";
import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { indexedFood, NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { BASE_UNIT, toBase, type NutrientUnit } from "@/lib/nutrition-units";

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

/** Waar een geregistreerd item vandaan komt: een voedingsmiddel of een supplement. */
export type DagboekItemBron = "voeding" | "supplement";

/** Eén geregistreerd product, gerecht of supplement, op één eetmoment. */
export type DagboekItem = {
  moment: EetmomentId;
  /**
   * Ontbreekt in elke rij die vóór de supplement-uitbreiding is opgeslagen —
   * `sanitizeItems` vult die dan aan met `"voeding"`, want elke bestaande rij
   * wijst naar `FOOD_CATALOG`. Geen migratie nodig: de opslag blijft dezelfde
   * jsonb-kolom.
   */
  bron: DagboekItemBron;
  /** Sleutel in `FOOD_CATALOG` (bron `"voeding"`) of `SUPPLEMENT_CATALOG` (bron `"supplement"`). */
  key: string;
  /**
   * Bij `bron: "voeding"`: gewicht in gram. Bij `bron: "supplement"`: aantal
   * porties uit `SupplementCatalogEntry.porties[0]` — een supplement wordt in
   * capsules/schepjes geteld, niet in gram, maar deelt hetzelfde numerieke
   * veld om geen derde getal-kolom nodig te maken. Hele aantallen; het
   * dagboek claimt geen halve.
   */
  grams: number;
};

/** Grootste portie die het dagboek accepteert — hoger is bijna altijd een typfout. */
const MAX_GRAMS = 2000;

/** Grootste aantal supplement-porties per item — hoger is bijna altijd een typfout. */
const MAX_SUPPLEMENT_PORTIES = 20;

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
    const { moment, bron: ruweBron, key, grams } = entry as Record<string, unknown>;
    if (typeof moment !== "string" || !isEetmomentId(moment)) continue;
    if (typeof key !== "string") continue;
    const bron: DagboekItemBron = ruweBron === "supplement" ? "supplement" : "voeding";
    if (bron === "voeding") {
      if (!catalogEntry(key)) continue;
      if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
      result.push({ moment, bron, key, grams: Math.min(Math.trunc(grams), MAX_GRAMS) });
    } else {
      if (!supplementCatalogEntry(key)) continue;
      if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
      result.push({
        moment,
        bron,
        key,
        grams: Math.min(Math.trunc(grams), MAX_SUPPLEMENT_PORTIES),
      });
    }
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
 *
 * Een supplement-item (`bron: "supplement"`) vult hier bewust niets: het staat
 * niet in `FOOD_CATALOG`, dus `catalogEntry` levert `null` en het item valt
 * stilzwijgend weg. Dat is geen gat maar correct gedrag — `portions` meet
 * variatie in wát je eet, en een capsule is geen voedselgroep.
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
  /**
   * Som over de items die een gehalte hadden, in {@link unit}.
   *
   * Elk bedrag wordt vóór het optellen naar de basiseenheid van de stof
   * gerekend (`nutrition-units.ts`), zodat mg en µg nooit bij elkaar opgeteld
   * kunnen worden.
   */
  minstens: number;
  /** Altijd `BASE_UNIT[nutrient]` — vast per stof, niet afhankelijk van de items. */
  unit: NutrientUnit;
  /** Hoeveel items aan dit bedrag bijdroegen. */
  bronnen: number;
  /**
   * Hoeveel geregistreerde voedingsitems géén gehalte voor deze stof hadden.
   *
   * Dit getal hoort in beeld te blijven: het is het verschil tussen "je at
   * weinig magnesium" en "we weten van drie dingen die je at niet hoeveel
   * magnesium erin zit".
   *
   * Telt alleen voeding. Een supplement dat een ándere stof draagt, zwijgt
   * niet over deze stof — het gaat er niet over, en het als zwijgend tellen
   * zou de zin erboven onwaar maken.
   */
  zonderGehalte: number;
};

/** Wat één item van één nutriënt levert, of null als het gehalte ontbreekt. */
export function bedragVanItem(
  item: DagboekItem,
  nutrient: NutrientId,
): { value: number; unit: NutrientUnit } | null {
  if (item.bron === "supplement") {
    const entry = supplementCatalogEntry(item.key);
    if (!entry || entry.nutrient !== nutrient) return null;
    // Eén supplementregel draagt vandaag één portie-vorm; `grams` is het
    // aantal van die portie (zie DagboekItem.grams).
    const portie = entry.porties[0];
    if (!portie) return null;
    return { value: portie.amount * item.grams, unit: portie.unit };
  }

  const entry = catalogEntry(item.key);
  const bronKey = entry?.bron;
  const rij = bronKey
    ? indexedFood(bronKey)?.nutrients.find((n) => n.nutrient === nutrient)
    : undefined;
  const per100g = rij?.source.nutrientValue;
  if (!per100g) return null;
  return { value: (per100g.value * item.grams) / 100, unit: per100g.unit };
}

/**
 * De ondergrens per nutriënt over één dag, elk in zijn eigen basiseenheid
 * (`BASE_UNIT`): eiwit in g, magnesium/zink/omega-3 in mg, vitamine D in µg.
 *
 * Levert alleen de nutriënten waarvoor ten minste één item een gehalte had.
 * Een stof zonder enkele bron komt niet als nul terug maar helemaal niet —
 * nul zou beweren dat je er niets van binnenkreeg, en dat weet dit dagboek
 * niet.
 *
 * Telt voeding én supplementen mee, zonder onderscheid — een supplement dekt
 * een tekort net zo goed als voeding. Wie het onderscheid wél nodig heeft
 * (de hero-cirkel en de nutriëntbalken), gebruikt {@link nutrientenGesplitstUitItems}.
 */
export function nutrientenUitItems(
  items: readonly DagboekItem[],
): NutrientOndergrens[] {
  return NUTRIENT_ORDER.map((nutrient) => telOp(items, nutrient)).filter(
    (stof): stof is NutrientOndergrensGesplitst => stof !== null,
  );
}

/**
 * De som voor één stof, met de twee delen waaruit hij bestaat.
 *
 * Eén doorloop over de items voor allebei: {@link nutrientenGesplitstUitItems}
 * liep vroeger per stof nog een tweede keer door de lijst om hetzelfde nog
 * eens uit te rekenen, waardoor de delen door hun eigen afronding minimaal
 * van het totaal konden afwijken. Nu komen som en delen uit dezelfde optelling
 * en klopt `uitVoeding + uitSupplement === minstens` per constructie.
 */
function telOp(
  items: readonly DagboekItem[],
  nutrient: NutrientId,
): NutrientOndergrensGesplitst | null {
  const unit = BASE_UNIT[nutrient];
  let uitVoeding = 0;
  let uitSupplement = 0;
  let bronnen = 0;
  let zonderGehalte = 0;

  for (const item of items) {
    const bedrag = bedragVanItem(item, nutrient);
    if (!bedrag) {
      // Een supplement dat een ándere stof draagt, zwijgt hier niet — het
      // gaat gewoon niet over deze stof. Drie magnesiumcapsules mogen niet als
      // "drie producten waarvan we het eiwitgehalte niet kennen" gaan tellen:
      // dat getal draagt in de UI de zin "van sommige producten kennen we het
      // gehalte nog niet", en die slaat op voeding met een open `bron`.
      if (item.bron !== "supplement") zonderGehalte += 1;
      continue;
    }

    // Optellen mag pas als beide bedragen in dezelfde eenheid staan. Een
    // eenheid die niet naar de basis te rekenen is, telt niet mee als nul maar
    // als een gat — zie nutrition-units.ts.
    const inBasis = toBase(bedrag.value, bedrag.unit, nutrient);
    if (inBasis === null) {
      if (item.bron !== "supplement") zonderGehalte += 1;
      continue;
    }

    if (item.bron === "supplement") uitSupplement += inBasis;
    else uitVoeding += inBasis;
    bronnen += 1;
  }

  if (bronnen === 0) return null;

  // Pas hier afronden, niet tijdens het optellen: bij vitamine D is 0,1 µg een
  // significante stap op een dagbehoefte van 10 µg, en een afronding per item
  // stapelt over een dag met veel regels.
  return {
    nutrient,
    minstens: afgerond(uitVoeding + uitSupplement),
    unit,
    bronnen,
    zonderGehalte,
    uitVoeding: afgerond(uitVoeding),
    uitSupplement: afgerond(uitSupplement),
  };
}

function afgerond(waarde: number): number {
  return Math.round(waarde * 10) / 10;
}

/** `NutrientOndergrens`, uitgesplitst naar wat er uit voeding kwam en wat uit supplementen. */
export type NutrientOndergrensGesplitst = NutrientOndergrens & {
  /** Het deel van `minstens` dat uit voeding kwam, in dezelfde eenheid. */
  uitVoeding: number;
  /** Het deel van `minstens` dat uit supplementen kwam, in dezelfde eenheid. */
  uitSupplement: number;
};

/**
 * Zelfde ondergrens als {@link nutrientenUitItems}, met de bron erbij.
 *
 * Puur additief: de som zelf verandert niet, alleen de twee delen waaruit hij
 * is opgebouwd worden zichtbaar. Bedoeld voor de hero-cirkel en de
 * nutriëntbalken, die voeding en supplement in aparte kleuren tonen.
 */
export function nutrientenGesplitstUitItems(
  items: readonly DagboekItem[],
): NutrientOndergrensGesplitst[] {
  return NUTRIENT_ORDER.map((nutrient) => telOp(items, nutrient)).filter(
    (stof): stof is NutrientOndergrensGesplitst => stof !== null,
  );
}

/** De items van één eetmoment, in de volgorde waarin ze zijn ingevoerd. */
export function itemsVanMoment(
  items: readonly DagboekItem[],
  moment: EetmomentId,
): DagboekItem[] {
  return items.filter((item) => item.moment === moment);
}

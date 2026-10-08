import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import {
  supplementCatalogEntry,
  type SupplementCatalogEntry,
  type SupplementPortie,
} from "@/data/nutrition/supplement-catalog";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";
import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import {
  gehalteBenaderingPer100g,
  gehaltePer100g,
  gehalteWeergavePer100g,
  type GehalteWeergave,
} from "@/lib/nutrition-catalog-gehalte";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
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
  /**
   * Sleutel in `FOOD_CATALOG` (bron `"voeding"`) of `SUPPLEMENT_CATALOG` (bron
   * `"supplement"`). Bij een supplement met {@link product}: de slug van het
   * hubproduct.
   */
  key: string;
  /**
   * Alleen bij een merkproduct uit Keuze: wat het etiket per dag gaf op het
   * moment van loggen. Vastgelegd in plaats van opgezocht, zodat een oude dag
   * blijft kloppen als het etiket later verandert en de uitlezing synchroon
   * blijft (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, elfde ronde). De server
   * neemt hem alleen aan als hij gelijk is aan het hubproduct of aan wat er al
   * stond ({@link behoudBekendeProducten}).
   */
  product?: DagboekSupplementProduct;
  /**
   * Bij `bron: "voeding"`: gewicht in gram. Bij `bron: "supplement"`: aantal
   * porties uit `SupplementCatalogEntry.porties[0]` — een supplement wordt in
   * capsules/schepjes geteld, niet in gram, maar deelt hetzelfde numerieke
   * veld om geen derde getal-kolom nodig te maken. Hele aantallen; het
   * dagboek claimt geen halve.
   */
  grams: number;
};

/** Het etiket van een merkproduct per dag, zoals het bij het loggen was. */
export type DagboekSupplementProduct = {
  naam: string;
  nutrient: NutrientId;
  /** Dosis per dag volgens het etiket, in {@link unit}. */
  dosis: number;
  unit: SupplementPortie["unit"];
};

/** Waar een merkproduct in telt: één dagdosis volgens het etiket. */
export const PRODUCT_PORTIE_LABEL = "dagdosis";

const PRODUCT_UNITS: ReadonlySet<string> = new Set(["g", "mg", "µg"]);
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;

function sanitizeProduct(raw: unknown): DagboekSupplementProduct | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const { naam, nutrient, dosis, unit } = raw as Record<string, unknown>;
  if (typeof naam !== "string" || !naam.trim() || naam.length > 200) return null;
  if (typeof nutrient !== "string" || !(NUTRIENT_ORDER as readonly string[]).includes(nutrient)) return null;
  if (typeof unit !== "string" || !PRODUCT_UNITS.has(unit)) return null;
  if (typeof dosis !== "number" || !Number.isFinite(dosis) || dosis <= 0 || dosis > 100_000) return null;
  return { naam: naam.trim(), nutrient: nutrient as NutrientId, dosis, unit: unit as SupplementPortie["unit"] };
}

/**
 * Een supplementregel in de vorm van een catalogusregel: uit de catalogus, of
 * uit het vastgelegde etiket van een merkproduct. Null bij voeding of een
 * onbekende sleutel.
 */
export function supplementVanItem(
  item: Pick<DagboekItem, "bron" | "key" | "product">,
): SupplementCatalogEntry | null {
  if (item.bron !== "supplement") return null;
  if (!item.product) return supplementCatalogEntry(item.key);
  const { naam, nutrient, dosis, unit } = item.product;
  return {
    key: item.key,
    labelNl: naam,
    nutrient,
    porties: [{ labelNl: PRODUCT_PORTIE_LABEL, amount: dosis, unit }],
  };
}

function zelfdeProduct(a: DagboekSupplementProduct, b: DagboekSupplementProduct): boolean {
  return a.naam === b.naam && a.nutrient === b.nutrient && a.dosis === b.dosis && a.unit === b.unit;
}

/**
 * Houdt alleen merkproduct-regels over waarvan het vastgelegde etiket klopt:
 * gelijk aan wat er voor die dag al stond, of aan het hubproduct nu
 * (`actueel`, per slug). Zo kan een client geen eigen dosis verzinnen, en
 * blijft een oude dag staan als het etiket intussen veranderde. Overige
 * regels gaan ongewijzigd door.
 */
export function behoudBekendeProducten(
  items: readonly DagboekItem[],
  bestaand: readonly DagboekItem[],
  actueel: ReadonlyMap<string, DagboekSupplementProduct>,
): DagboekItem[] {
  return items.filter((item) => {
    if (!item.product) return true;
    const product = item.product;
    const nu = actueel.get(item.key);
    if (nu && zelfdeProduct(nu, product)) return true;
    return bestaand.some((b) => b.key === item.key && b.product !== undefined && zelfdeProduct(b.product, product));
  });
}

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
    const { moment, bron: ruweBron, key, grams, product: ruwProduct } = entry as Record<string, unknown>;
    if (typeof moment !== "string" || !isEetmomentId(moment)) continue;
    if (typeof key !== "string") continue;
    const bron: DagboekItemBron = ruweBron === "supplement" ? "supplement" : "voeding";
    if (bron === "voeding") {
      if (!catalogEntry(key)) continue;
      if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
      result.push({ moment, bron, key, grams: Math.min(Math.trunc(grams), MAX_GRAMS) });
    } else {
      const product = ruwProduct === undefined ? null : sanitizeProduct(ruwProduct);
      if (ruwProduct !== undefined && (!product || !SLUG.test(key))) continue;
      if (!product && !supplementCatalogEntry(key)) continue;
      if (typeof grams !== "number" || !Number.isFinite(grams) || grams <= 0) continue;
      result.push({
        moment,
        bron,
        key,
        grams: Math.min(Math.trunc(grams), MAX_SUPPLEMENT_PORTIES),
        ...(product ? { product } : {}),
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
   * Een gemeten 0 of spoor telt hier niet: dan weten we het wél.
   *
   * Telt alleen voeding. Een supplement dat een ándere stof draagt, zwijgt
   * niet over deze stof — het gaat er niet over, en het als zwijgend tellen
   * zou de zin erboven onwaar maken.
   */
  zonderGehalte: number;
  /**
   * Het deel van `minstens` dat uit een vrijgegeven benadering komt (≈), in
   * {@link unit}. Toon de som met "≈" als dit groter dan 0 is, en reken een
   * "gehaald" met {@link zonderBenadering}
   * (`BESLUIT_MICRO_IN_BEELD_2026-10.md` §1b).
   */
  uitBenadering: number;
};

/** De som zonder benaderingen: waar een "gehaald" / ✓ mee rekent. */
export function zonderBenadering(stof: Pick<NutrientOndergrens, "minstens" | "uitBenadering"> | undefined): number {
  return stof ? afgerond(stof.minstens - stof.uitBenadering) : 0;
}

/**
 * Wat één item van één nutriënt levert, of null als het gehalte ontbreekt.
 * `benaderd` als het uit een vrijgegeven benadering komt (≈).
 */
export function bedragVanItem(
  item: DagboekItem,
  nutrient: NutrientId,
): { value: number; unit: NutrientUnit; benaderd?: true } | null {
  if (item.bron === "supplement") {
    const entry = supplementVanItem(item);
    if (!entry || entry.nutrient !== nutrient) return null;
    // Eén supplementregel draagt vandaag één portie-vorm; `grams` is het
    // aantal van die portie (zie DagboekItem.grams).
    const portie = entry.porties[0];
    if (!portie) return null;
    return { value: portie.amount * item.grams, unit: portie.unit };
  }

  const entry = catalogEntry(item.key);
  const echt = gehaltePer100g(entry, nutrient);
  if (echt) return { value: (echt.value * item.grams) / 100, unit: echt.unit };
  const benaderd = gehalteBenaderingPer100g(entry, nutrient);
  if (!benaderd) return null;
  return { value: (benaderd.value * item.grams) / 100, unit: benaderd.unit, benaderd: true };
}

/**
 * Wat een catalogusregel op zijn eigen standaardportie levert — zonder dat er
 * al een `DagboekItem` gelogd is.
 *
 * Zelfde formule als {@link bedragVanItem}, maar met `porties[0]` in plaats
 * van `item.grams`: bedoeld voor de productvergelijking, waar je meerdere
 * catalogusregels naast elkaar wilt zien op hún realistische portie ("1
 * plakje zalm", "1 schep eiwitpoeder") in plaats van per 100 g.
 */
export function bedragVoorStandaardPortie(
  bron: DagboekItemBron,
  key: string,
  nutrient: NutrientId,
): { value: number; unit: NutrientUnit; portieLabel: string } | null {
  if (bron === "supplement") {
    const entry = supplementCatalogEntry(key);
    if (!entry || entry.nutrient !== nutrient) return null;
    const portie = entry.porties[0];
    if (!portie) return null;
    return { value: portie.amount, unit: portie.unit, portieLabel: portie.labelNl };
  }

  const entry = catalogEntry(key);
  const portie = entry?.porties[0];
  const per100g = gehaltePer100g(entry, nutrient);
  if (!per100g || !portie) return null;
  return {
    value: (per100g.value * portie.grams) / 100,
    unit: per100g.unit,
    portieLabel: portie.labelNl,
  };
}

/**
 * Wat een scherm voor één item toont: als {@link bedragVanItem}, plus een
 * gemeten 0, een spoor of een benadering. Alleen voor weergave; de som loopt
 * via {@link bedragVanItem}. Een supplement kent alleen zijn eigen stof.
 */
export function weergaveVanItem(item: DagboekItem, nutrient: NutrientId): GehalteWeergave {
  if (item.bron === "supplement") {
    const bedrag = bedragVanItem(item, nutrient);
    return bedrag ? { soort: "waarde", ...bedrag, benadering: null } : { soort: "onbekend" };
  }
  return naarGram(gehalteWeergavePer100g(catalogEntry(item.key), nutrient), item.grams);
}

/** Als {@link bedragVoorStandaardPortie}, maar voor weergave (zie {@link weergaveVanItem}). */
export function weergaveVoorStandaardPortie(
  bron: DagboekItemBron,
  key: string,
  nutrient: NutrientId,
): GehalteWeergave {
  if (bron === "supplement") {
    const bedrag = bedragVoorStandaardPortie(bron, key, nutrient);
    return bedrag ? { soort: "waarde", value: bedrag.value, unit: bedrag.unit, benadering: null } : { soort: "onbekend" };
  }
  const entry = catalogEntry(key);
  const portie = entry?.porties[0];
  if (!portie) return { soort: "onbekend" };
  return naarGram(gehalteWeergavePer100g(entry, nutrient), portie.grams);
}

function naarGram(per100g: GehalteWeergave, grams: number): GehalteWeergave {
  return per100g.soort === "waarde" ? { ...per100g, value: (per100g.value * grams) / 100 } : per100g;
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
  let uitBenadering = 0;
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
      if (item.bron !== "supplement" && !isBekendeNul(item, nutrient)) zonderGehalte += 1;
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
    if (bedrag.benaderd) uitBenadering += inBasis;
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
    uitBenadering: afgerond(uitBenadering),
    uitVoeding: afgerond(uitVoeding),
    uitSupplement: afgerond(uitSupplement),
  };
}

/**
 * Een gemeten 0 of spoor zwijgt niet: we weten dat er (vrijwel) niets in zit.
 * Het telt niet als bron — de som en het wel/niet tonen van een stof blijven
 * gelijk — maar ook niet als "geen gehalte bekend". Dat geldt ook voor de 0 van
 * een vrijgegeven benadering (§1b): ook die telt verder overal mee.
 */
function isBekendeNul(item: DagboekItem, nutrient: NutrientId): boolean {
  const weergave = weergaveVanItem(item, nutrient);
  return weergave.soort === "nul" || weergave.soort === "spoor";
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

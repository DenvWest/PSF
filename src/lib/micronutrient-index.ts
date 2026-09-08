import {
  formatMicronutrientHoeveelheid,
  getMicronutrient,
  MICRONUTRIENTEN,
  type Micronutrient,
  type MicronutrientId,
} from "@/data/nutrition/micronutrients";
import {
  getVoedingsmiddel,
  VOEDINGSMIDDELEN,
  type Voedingsmiddel,
} from "@/data/nutrition/food-items";
import { DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * De twee leesrichtingen van dezelfde tabel.
 *
 * `food-items.ts` is voedingsmiddel-eerst; het dagboek leest hem zo. Het
 * overzicht "waar haal ik magnesium vandaan" leest hem andersom. Beide
 * richtingen komen hier uit dezelfde bron, zodat een tweede handmatige lijst
 * niet kán ontstaan — en dus ook niet kan gaan afwijken.
 *
 * ## Waarom hier wél een weging staat en geen dagtotaal
 *
 * Eén portie wegen tegen een dagreferentie is etiketteringspraktijk: EU-
 * verordening 1169/2011 (bijlage XIII) noemt 15% van de referentie-inname de
 * grens voor "bron van" en 30% voor "rijk aan". Dat is een gepubliceerde
 * grens, en hij zegt iets over één product — precies de vraag die een chip bij
 * een dagboekregel beantwoordt.
 *
 * Wat hier daarom níét staat is een optelling van die porties tot een
 * dagpercentage. De gehaltes in `food-items.ts` staan op `verified: false`, de
 * porties zijn standaardporties, en fytaat bepaalt bij magnesium, zink en
 * ijzer mede wat je er werkelijk uit haalt. Drie indicatieve getallen optellen
 * en tegen een norm leggen is een inname-claim; die dragen we niet. Het
 * dagoverzicht telt bronnen — zie `nutrition-dagdekking.ts`.
 */

/** Vanaf dit deel van de dagreferentie mag een portie "rijk aan" heten. */
export const RIJK_DREMPEL = 0.3;
/** Vanaf dit deel "bron van" — de grens uit Vo. 1169/2011, bijlage XIII. */
export const BRON_DREMPEL = 0.15;
/** Daaronder: noemenswaard, maar geen bron. Onze eigen ondergrens voor tonen. */
export const SPOOR_DREMPEL = 0.05;

export const BIJDRAGE_BRON =
  "Grenzen voor 'bron van' (15%) en 'rijk aan' (30%) volgen EU-verordening 1169/2011, bijlage XIII.";

export type BijdrageNiveau = "rijk" | "bron" | "spoor";

export const BIJDRAGE_LABEL: Record<BijdrageNiveau, string> = {
  rijk: "rijk aan",
  bron: "bron van",
  spoor: "beetje",
};

/** Hoeveel van een stof er in één portie van dit product zit. */
export function hoeveelheidPerPortie(
  product: Voedingsmiddel,
  stof: MicronutrientId,
): number | null {
  const per100g = product.per100g[stof];
  if (per100g == null) {
    return null;
  }
  return (per100g * product.portieGram) / 100;
}

/**
 * Hoe zwaar één portie weegt tegen de dagreferentie, als fractie.
 *
 * Alleen bedoeld om te wegen en te sorteren. Wie hier percentages van maakt en
 * ze bij elkaar optelt, maakt er een inname-claim van — zie de kop van dit
 * bestand.
 */
export function deelVanReferentie(
  product: Voedingsmiddel,
  stof: MicronutrientId,
): number | null {
  const hoeveelheid = hoeveelheidPerPortie(product, stof);
  const referentie = getMicronutrient(stof)?.referentiePerDag;
  if (hoeveelheid == null || !referentie) {
    return null;
  }
  return hoeveelheid / referentie;
}

export function bijdrageNiveau(deel: number): BijdrageNiveau | null {
  if (deel >= RIJK_DREMPEL) return "rijk";
  if (deel >= BRON_DREMPEL) return "bron";
  if (deel >= SPOOR_DREMPEL) return "spoor";
  return null;
}

/** Eén stof zoals hij bij een product op het scherm komt. */
export type ProductBijdrage = {
  stof: Micronutrient;
  /** Per portie, in de eenheid van de stof. */
  hoeveelheid: number;
  /** Klaar voor weergave: "79 mg". */
  hoeveelheidLabel: string;
  deel: number;
  niveau: BijdrageNiveau;
};

/**
 * De stoffen die dit product noemenswaard levert, zwaarste eerst.
 *
 * Sorteren op `deel` en niet op de rauwe hoeveelheid: 400 mg kalium en 30 µg
 * selenium zijn niet te vergelijken als getal, wel als aandeel van waar je op
 * een dag naartoe werkt. Zonder die normalisering zou elke chiprij met kalium
 * beginnen, ongeacht het product.
 */
export function bijdragenVanProduct(
  product: Voedingsmiddel,
  opties: { max?: number; minNiveau?: BijdrageNiveau } = {},
): ProductBijdrage[] {
  const { max, minNiveau = "spoor" } = opties;
  const drempel =
    minNiveau === "rijk" ? RIJK_DREMPEL : minNiveau === "bron" ? BRON_DREMPEL : SPOOR_DREMPEL;

  const rijen: ProductBijdrage[] = [];
  for (const stof of MICRONUTRIENTEN) {
    const deel = deelVanReferentie(product, stof.id);
    const hoeveelheid = hoeveelheidPerPortie(product, stof.id);
    if (deel == null || hoeveelheid == null || deel < drempel) {
      continue;
    }
    const niveau = bijdrageNiveau(deel);
    if (!niveau) continue;
    rijen.push({
      stof,
      hoeveelheid,
      hoeveelheidLabel: formatMicronutrientHoeveelheid(hoeveelheid, stof.eenheid),
      deel,
      niveau,
    });
  }

  rijen.sort((a, b) => b.deel - a.deel);
  return max != null ? rijen.slice(0, max) : rijen;
}

/** Eén bron zoals hij in het overzicht per stof staat. */
export type StofBron = {
  product: Voedingsmiddel;
  hoeveelheid: number;
  hoeveelheidLabel: string;
  deel: number;
  niveau: BijdrageNiveau;
};

/**
 * Alle voedingsmiddelen die deze stof noemenswaard leveren, aflopend.
 *
 * Dit is de "volledigheid" die het overzicht belooft: niet een selectie van
 * vijf bronnen per stof, maar alles wat de tabel kent, met de portie erbij
 * zodat de volgorde over borden gaat en niet over honderd gram.
 */
export function bronnenVoorStof(
  stof: MicronutrientId,
  opties: { groepen?: readonly VoedselgroepId[]; minNiveau?: BijdrageNiveau } = {},
): StofBron[] {
  const { groepen, minNiveau = "spoor" } = opties;
  const drempel =
    minNiveau === "rijk" ? RIJK_DREMPEL : minNiveau === "bron" ? BRON_DREMPEL : SPOOR_DREMPEL;

  const rijen: StofBron[] = [];
  for (const product of VOEDINGSMIDDELEN) {
    if (groepen && groepen.length > 0 && !groepen.includes(product.groep)) {
      continue;
    }
    const deel = deelVanReferentie(product, stof);
    const hoeveelheid = hoeveelheidPerPortie(product, stof);
    if (deel == null || hoeveelheid == null || deel < drempel) {
      continue;
    }
    const niveau = bijdrageNiveau(deel);
    if (!niveau) continue;
    const eenheid = getMicronutrient(stof)?.eenheid ?? "mg";
    rijen.push({
      product,
      hoeveelheid,
      hoeveelheidLabel: formatMicronutrientHoeveelheid(hoeveelheid, eenheid),
      deel,
      niveau,
    });
  }

  rijen.sort((a, b) => b.deel - a.deel);
  return rijen;
}

/** Hoeveel bronnen de tabel per stof kent — draagt de telling in het overzicht. */
export function bronnenTelling(stof: MicronutrientId): number {
  return bronnenVoorStof(stof).length;
}

/**
 * De voedingsmiddelen van één dagboekgroep, in tabelvolgorde.
 *
 * De zoeker toont ze zo: eerst de groep die bij het eetmoment past, daarbinnen
 * de volgorde van de tabel. Alfabetisch sorteren zou groente op "andijvie"
 * laten beginnen terwijl spinazie en boerenkool de bronnen zijn waar het
 * scherm over gaat.
 */
export function voedingsmiddelenVanGroep(groep: VoedselgroepId): Voedingsmiddel[] {
  return VOEDINGSMIDDELEN.filter((product) => product.groep === groep);
}

export function voedingsmiddelenPerGroep(): {
  groep: VoedselgroepId;
  label: string;
  producten: Voedingsmiddel[];
}[] {
  const volgorde: VoedselgroepId[] = [];
  for (const product of VOEDINGSMIDDELEN) {
    if (!volgorde.includes(product.groep)) {
      volgorde.push(product.groep);
    }
  }
  return volgorde.map((groep) => ({
    groep,
    label: DAGBOEK_LABELS[groep] ?? groep,
    producten: voedingsmiddelenVanGroep(groep),
  }));
}

function normaliseer(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Zoeken op naam, synoniem of sleutel.
 *
 * Woord-voor-woord en niet als één string: wie "rode kool" typt moet
 * "Rodekool" vinden, en wie "kaas 48" typt "Goudse kaas 48+". Een enkele
 * `includes` op de hele invoer zou allebei missen.
 */
export function zoekVoedingsmiddelen(
  term: string,
  limiet = 24,
): Voedingsmiddel[] {
  const woorden = normaliseer(term).split(/\s+/).filter(Boolean);
  if (woorden.length === 0) {
    return [];
  }

  const treffers: { product: Voedingsmiddel; score: number }[] = [];
  for (const product of VOEDINGSMIDDELEN) {
    const haystack = normaliseer(
      [product.labelNl, product.key, ...(product.synoniemen ?? [])].join(" "),
    );
    if (!woorden.every((woord) => haystack.includes(woord))) {
      continue;
    }
    // Een treffer aan het begin van de naam telt zwaarder dan een treffer
    // ergens in een synoniem: wie "kool" typt wil Boerenkool boven Chinese kool
    // noch andersom, maar wél kool boven "kokosolie".
    const label = normaliseer(product.labelNl);
    const score = label.startsWith(woorden[0]) ? 0 : label.includes(woorden[0]) ? 1 : 2;
    treffers.push({ product, score });
  }

  treffers.sort((a, b) => a.score - b.score);
  return treffers.slice(0, limiet).map((treffer) => treffer.product);
}

/** Regel onder een productkaart: portie, herkomst en de weging-bron. */
export function productBronregel(product: Voedingsmiddel): string {
  const herkomst = product.verified
    ? "gehaltes nageslagen"
    : "gehaltes indicatief, nog niet tegen NEVO gelegd";
  return `Per ${product.portieLabel} — ${herkomst}. ${BIJDRAGE_BRON}`;
}

export { getVoedingsmiddel, VOEDINGSMIDDELEN };
export type { Voedingsmiddel };

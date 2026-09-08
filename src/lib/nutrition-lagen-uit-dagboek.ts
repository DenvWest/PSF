import { getMicronutrient, type MicronutrientId } from "@/data/nutrition/micronutrients";
import {
  nutrientReferences,
  NUTRIENT_IDS,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import type { Voedingsmiddel } from "@/data/nutrition/food-items";
import {
  bijdrageNiveau,
  deelVanReferentie,
  BRON_DREMPEL,
} from "@/lib/micronutrient-index";
import {
  alleDagItems,
  productenVanDag,
  type DagItems,
} from "@/lib/nutrition-dagboek-items";
import { getVoedingsmiddel } from "@/data/nutrition/food-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * De hogere ladderlagen, gelezen uit dezelfde dag.
 *
 * ## Waarom dit bestaat
 *
 * De voedingsladder heeft zes lagen, en tot nu toe kwam elke laag uit dezelfde
 * bron: de frequentiecheck. Dat gaf zes panelen die allemaal hetzelfde
 * antwoord in een andere vorm herhaalden — er was maar één meting, dus meer
 * dan één conclusie viel er niet te trekken.
 *
 * Nu er een dagboek op productniveau onder ligt, kunnen P2 en P3 een eigen
 * vraag beantwoorden over dezelfde dag die je op P1 invulde. Niet een tweede
 * score (de check blijft de enige plek waar een voedingsscore vandaan komt),
 * maar een aflezing: wat stond er, en hoe was het verdeeld.
 *
 * ## Wat hier bewust níét gebeurt
 *
 * Geen oordeel over een dag. Eén dag zegt weinig over een patroon, en de
 * ladder gaat over je patroon. Elke functie hier levert daarom tellingen en
 * verdelingen — de UI zet er hoogstens een neutrale regel bij. Wie een oordeel
 * wil, doet de check; die weegt weken.
 */

/** De groepen die als hele, onbewerkte basis tellen. */
const BASISGROEPEN: readonly VoedselgroepId[] = [
  "groente",
  "fruit",
  "peulvruchten",
  "noten",
  "granen",
  "vis",
  "vlees",
  "eieren",
  "zuivel",
  "zetmeel",
];

/** Producten die als "sterk bewerkt of gezoet" tellen, ongeacht hun groep. */
const GEZOET_OF_BEWERKT = new Set<string>([
  "frisdrank",
  "sinaasappelsap",
  "bier",
  "friet",
  "koek",
  "chips",
  "pizza",
  "ijs",
  "melkchocolade",
]);

export type KwaliteitBeeld = {
  /** Porties uit de basisgroepen. */
  basis: number;
  /** Porties uit de groep suiker & bewerkt, plus de gezoete dranken. */
  bewerkt: number;
  totaal: number;
  /** De producten die onder "bewerkt" vielen — het bewijs onder het getal. */
  bewerkteProducten: { product: Voedingsmiddel; porties: number }[];
  /** Producten uit de basisgroepen, zwaarste bijdrage eerst. */
  basisProducten: { product: Voedingsmiddel; porties: number }[];
};

function isBewerkt(product: Voedingsmiddel): boolean {
  return product.groep === "suiker" || GEZOET_OF_BEWERKT.has(product.key);
}

/**
 * P2 — Voedingskwaliteit: hoeveel van deze dag kwam uit hele voeding?
 *
 * Telt porties en niet producten: drie glazen frisdrank is drie keer die
 * keuze, en de laag gaat expliciet over frequentie ("hoe vaak is iets je
 * standaardkeuze"), niet over variatie.
 */
export function bouwKwaliteitBeeld(items: DagItems): KwaliteitBeeld {
  const producten = productenVanDag(items);
  let basis = 0;
  let bewerkt = 0;
  const bewerkteProducten: { product: Voedingsmiddel; porties: number }[] = [];
  const basisProducten: { product: Voedingsmiddel; porties: number }[] = [];

  for (const regel of producten) {
    if (isBewerkt(regel.product)) {
      bewerkt += regel.porties;
      bewerkteProducten.push(regel);
      continue;
    }
    if (BASISGROEPEN.includes(regel.product.groep)) {
      basis += regel.porties;
      basisProducten.push(regel);
    }
  }

  return {
    basis,
    bewerkt,
    totaal: basis + bewerkt,
    bewerkteProducten,
    basisProducten,
  };
}

export type MomentVerdeling = {
  moment: EetmomentId;
  label: string;
  /** Aantal producten op dit moment. */
  producten: number;
  /** Producten die minstens "bron van" eiwit zijn. */
  eiwitbronnen: number;
  /** Producten die minstens "bron van" vezels zijn. */
  vezelbronnen: number;
  /** Producten uit groente, fruit of peulvruchten. */
  plantbronnen: number;
};

/**
 * P3 — Verhoudingen: hoe lag je dag over de momenten?
 *
 * De laag noemt eiwit per maaltijd als eerste, en dat is precies wat een
 * dagboek op productniveau kan laten zien zonder iets te berekenen: bij welk
 * moment stond er een eiwitbron, en bij welk niet. Geen grammen — een telling
 * van bronnen, met dezelfde etiketteringsgrens als overal.
 */
export function bouwMomentVerdeling(items: DagItems): MomentVerdeling[] {
  return EETMOMENTEN.map((moment) => {
    const regels = items[moment.id] ?? [];
    let eiwitbronnen = 0;
    let vezelbronnen = 0;
    let plantbronnen = 0;

    for (const regel of regels) {
      const product = getVoedingsmiddel(regel.key);
      if (!product) continue;
      const eiwit = deelVanReferentie(product, "eiwit");
      const vezels = deelVanReferentie(product, "vezels");
      if (eiwit != null && eiwit >= BRON_DREMPEL) eiwitbronnen += 1;
      if (vezels != null && vezels >= BRON_DREMPEL) vezelbronnen += 1;
      if (
        product.groep === "groente" ||
        product.groep === "fruit" ||
        product.groep === "peulvruchten"
      ) {
        plantbronnen += 1;
      }
    }

    return {
      moment: moment.id,
      label: moment.label,
      producten: regels.length,
      eiwitbronnen,
      vezelbronnen,
      plantbronnen,
    };
  }).filter((rij) => rij.producten > 0);
}

/** Op hoeveel momenten stond er een eiwitbron — de kernvraag van P3. */
export function momentenMetEiwit(verdeling: readonly MomentVerdeling[]): number {
  return verdeling.filter((rij) => rij.eiwitbronnen > 0).length;
}

export type AanvulRegel = {
  stof: MicronutrientId;
  label: string;
  /** Hoeveel bronnen deze dag leverde die minstens "bron van" waren. */
  bronnen: number;
  /** Het beste product van vandaag voor deze stof, of null. */
  besteBron: Voedingsmiddel | null;
  /** Pad naar de vergelijking; alleen de stoffen met een interventiepad. */
  comparisonPath: string;
};

/**
 * P6 — Aanvullen: alleen de stoffen waar een vergelijking achter zit.
 *
 * De volgorde is niet toevallig: eerst wat je dag ervoor leverde, dan pas de
 * link. Een supplementblok dat opent met "vergelijk magnesium" zonder te tonen
 * dat je vanochtend havermout at, verkoopt een oplossing voor een probleem dat
 * het niet heeft gemeten.
 */
export function bouwAanvulRegels(items: DagItems): AanvulRegel[] {
  const producten = productenVanDag(items);

  return NUTRIENT_IDS.map((nutrientId) => {
    const stof = STOF_VOOR_NUTRIENT[nutrientId];
    const micro = getMicronutrient(stof);

    let bronnen = 0;
    let besteBron: Voedingsmiddel | null = null;
    let besteDeel = 0;

    for (const regel of producten) {
      const deel = deelVanReferentie(regel.product, stof);
      if (deel == null) continue;
      const niveau = bijdrageNiveau(deel);
      if (niveau !== "rijk" && niveau !== "bron") continue;
      bronnen += 1;
      if (deel > besteDeel) {
        besteDeel = deel;
        besteBron = regel.product;
      }
    }

    return {
      stof,
      label: micro?.label ?? stof,
      bronnen,
      besteBron,
      comparisonPath: nutrientReferences[nutrientId].comparisonPath,
    };
  });
}

/** De brug van `NutrientId` (interventiepad) naar `MicronutrientId` (bord). */
export const STOF_VOOR_NUTRIENT: Record<NutrientId, MicronutrientId> = {
  protein: "eiwit",
  omega3: "omega3",
  magnesium: "magnesium",
  vitamin_d: "vitamine_d",
  zinc: "zink",
};

/** Aantal regels op deze dag — de telling die de lagen delen. */
export function dagRegels(items: DagItems): number {
  return alleDagItems(items).length;
}

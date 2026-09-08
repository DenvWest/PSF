import {
  MICRONUTRIENTEN,
  type Micronutrient,
  type MicronutrientGroep,
  type MicronutrientId,
} from "@/data/nutrition/micronutrients";
import type { Voedingsmiddel } from "@/data/nutrition/food-items";
import {
  bijdrageNiveau,
  deelVanReferentie,
  type BijdrageNiveau,
} from "@/lib/micronutrient-index";
import { productenVanDag, type DagItems } from "@/lib/nutrition-dagboek-items";

/**
 * Wat je dag aan micronutriënten opleverde — geteld in **bronnen**, niet in
 * milligrammen.
 *
 * ## Waarom hier geen dagtotaal staat
 *
 * De verleiding is groot en het scherm zou er mooier van worden: tel de
 * porties op, deel door de dagreferentie, zet er een percentage neer. Drie
 * dingen maken dat onwaar, en geen ervan is met een disclaimer op te lossen:
 *
 * 1. De gehaltes in `food-items.ts` staan op `verified: false` — indicatieve
 *    orde-van-grootte-waarden. Een som van indicatieve getallen is niet
 *    preciezer dan zijn onderdelen, alleen zelfverzekerder.
 * 2. De porties zijn standaardporties, niet die van jou. Een "handvol noten"
 *    is bij niemand 25,0 gram.
 * 3. Bij magnesium, zink en ijzer bepaalt fytaat mede hoeveel je er werkelijk
 *    uit haalt. Twee borden met hetzelfde tabelgetal leveren niet hetzelfde.
 *
 * Wat wél waar is: dít product is een bron van magnesium, en die kwam vandaag
 * langs. Die uitspraak leunt op de etiketteringsgrens uit Vo. 1169/2011
 * (15% = "bron van", 30% = "rijk aan") en op één portie — niet op een som.
 * Deze module telt hoe vaak die uitspraak vandaag opging, per stof.
 *
 * ## De vertaling naar één woord per stof
 *
 * `sterk`  — minstens één rijke bron, of twee bronnen.
 * `iets`   — één bron, of drie kleine bijdragen.
 * `weinig` — alleen kleine bijdragen.
 * `geen`   — niets langsgekomen dat de ondergrens haalt.
 *
 * Regels over tellingen, geen rekensom over hoeveelheden. Daarom mogen ze op
 * het scherm staan.
 */

export type DekkingStatus = "sterk" | "iets" | "weinig" | "geen";

export const DEKKING_LABEL: Record<DekkingStatus, string> = {
  sterk: "goed gedekt",
  iets: "iets binnen",
  weinig: "nauwelijks",
  geen: "niets vandaag",
};

/** Eén bron die vandaag aan een stof bijdroeg. */
export type DekkingBron = {
  product: Voedingsmiddel;
  porties: number;
  niveau: BijdrageNiveau;
  deel: number;
};

export type StofDekking = {
  stof: Micronutrient;
  status: DekkingStatus;
  /** De bronnen van vandaag, zwaarste eerst. */
  bronnen: DekkingBron[];
  /** Hoeveel bronnen op elk niveau — draagt de regel onder de balk. */
  rijk: number;
  bron: number;
  spoor: number;
};

export type Dagdekking = {
  /** Alle stoffen, in de volgorde van `MICRONUTRIENTEN`. */
  stoffen: StofDekking[];
  /** Stoffen met status `sterk` of `iets`: die kwamen vandaag echt langs. */
  gedekt: number;
  /** Het totaal waartegen `gedekt` gelezen wordt. */
  totaal: number;
  /** Aantal producten dat de dag telt. */
  producten: number;
  /** De grootste gaten: stoffen op `geen`, in tabelvolgorde. */
  ontbreekt: Micronutrient[];
};

const STATUS_VOLGORDE: Record<DekkingStatus, number> = {
  geen: 0,
  weinig: 1,
  iets: 2,
  sterk: 3,
};

function statusVoor(rijk: number, bron: number, spoor: number): DekkingStatus {
  if (rijk >= 1 || bron >= 2) return "sterk";
  if (bron >= 1 || spoor >= 3) return "iets";
  if (spoor >= 1) return "weinig";
  return "geen";
}

/**
 * Meer porties van hetzelfde product tellen als meer bronnen — tot twee.
 *
 * Drie keer spinazie is meer magnesium dan één keer, en dat mag meewegen. Maar
 * onbeperkt doortellen zou van één product een volledige dekking maken, en dat
 * is precies de somredenering die deze module vermijdt. Twee is de grens: het
 * verschil tussen "at ik" en "at ik ruim" is zichtbaar, het verschil tussen
 * ruim en heel veel niet.
 */
function bronGewicht(porties: number): number {
  return Math.min(Math.max(Math.trunc(porties), 1), 2);
}

export function bouwDagdekking(items: DagItems): Dagdekking {
  const producten = productenVanDag(items);

  const stoffen: StofDekking[] = MICRONUTRIENTEN.map((stof) => {
    const bronnen: DekkingBron[] = [];
    let rijk = 0;
    let bron = 0;
    let spoor = 0;

    for (const regel of producten) {
      const deel = deelVanReferentie(regel.product, stof.id);
      if (deel == null) continue;
      const niveau = bijdrageNiveau(deel);
      if (!niveau) continue;

      const gewicht = bronGewicht(regel.porties);
      if (niveau === "rijk") rijk += gewicht;
      else if (niveau === "bron") bron += gewicht;
      else spoor += gewicht;

      bronnen.push({ product: regel.product, porties: regel.porties, niveau, deel });
    }

    bronnen.sort((a, b) => b.deel - a.deel);

    return { stof, status: statusVoor(rijk, bron, spoor), bronnen, rijk, bron, spoor };
  });

  return {
    stoffen,
    gedekt: stoffen.filter((rij) => rij.status === "sterk" || rij.status === "iets").length,
    totaal: stoffen.length,
    producten: producten.length,
    ontbreekt: stoffen.filter((rij) => rij.status === "geen").map((rij) => rij.stof),
  };
}

/** De stoffen van één groep, voor het overzicht in kolommen. */
export function dekkingPerGroep(
  dekking: Dagdekking,
  groep: MicronutrientGroep,
): StofDekking[] {
  return dekking.stoffen.filter((rij) => rij.stof.groep === groep);
}

export function dekkingVoorStof(
  dekking: Dagdekking,
  stof: MicronutrientId,
): StofDekking | undefined {
  return dekking.stoffen.find((rij) => rij.stof.id === stof);
}

/**
 * De stoffen waar vandaag het minst binnenkwam, zwakste eerst.
 *
 * Sorteert op status en daarbinnen op tabelvolgorde. Bewust niet op "hoeveel
 * scheelt het": dat zou een hoeveelheid claimen, en die hebben we niet.
 */
export function zwaksteStoffen(dekking: Dagdekking, max = 3): StofDekking[] {
  return [...dekking.stoffen]
    .sort((a, b) => STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status])
    .slice(0, max);
}

/**
 * De kopregel boven het dagoverzicht.
 *
 * Eén zin die zegt wat er staat, zonder oordeel. Geen "je haalt het niet" —
 * daar is dit instrument niet nauwkeurig genoeg voor, en het is ook niet de
 * vraag waar iemand mee binnenkomt.
 */
export function dagdekkingRegel(dekking: Dagdekking): string {
  if (dekking.producten === 0) {
    return "Nog niets ingevuld voor deze dag.";
  }
  return `${dekking.gedekt} van de ${dekking.totaal} stoffen kwamen langs uit ${
    dekking.producten === 1 ? "dit product" : `deze ${dekking.producten} producten`
  }.`;
}

/**
 * De regel eronder: waar de ruimte zit.
 *
 * Noemt maximaal drie stoffen. Meer opsommen leest als een lijst van tekorten,
 * en dat is precies de diagnose-taal die dit product niet voert.
 */
export function dagdekkingRuimteRegel(dekking: Dagdekking): string | null {
  if (dekking.producten === 0) {
    return null;
  }
  const gaten = dekking.ontbreekt.slice(0, 3);
  if (gaten.length === 0) {
    return "Elke stof in deze lijst kwam ergens vandaan.";
  }
  const namen = gaten.map((stof) => stof.label);
  const lijst =
    namen.length === 1
      ? namen[0]
      : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
  return `Nog niets langsgekomen voor ${lijst}.`;
}

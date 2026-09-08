import type { Micronutrient } from "@/data/nutrition/micronutrients";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { parseDagItems, itemsTelling, type DagItems } from "@/lib/nutrition-dagboek-items";
import { bouwDagdekking } from "@/lib/nutrition-dagdekking";

/**
 * Het dagboek samengevat over meerdere dagen — de vorm die Voortgang draagt.
 *
 * ## Waarom Voortgang samenvat en niet meer invult
 *
 * Invullen gebeurt op Kompas: daar staat je dag, daar zet je er producten in,
 * daar lees je wat ze leveren. Voortgang beantwoordt een andere vraag — *hoe
 * ging het over de weken* — en die vraag heeft geen invoerveld nodig. Twee
 * plekken waar je hetzelfde kunt doen betekent onvermijdelijk dat er één de
 * verkeerde stand toont.
 *
 * Wat hier dus staat is een aflezing van dezelfde dagen: hoeveel je invulde, en
 * welke stoffen structureel wel en niet langskwamen. Geen tweede meting, geen
 * tweede score, en geen knop die de dag verandert.
 *
 * ## Waarom "op hoeveel dagen" en niet "hoeveel milligram"
 *
 * Dezelfde reden als op Kompas (zie `nutrition-dagdekking.ts`): de gehaltes
 * zijn indicatief en de porties zijn standaardporties. Wat over dagen heen wél
 * betekenis heeft is herhaling — een stof die op vier van de vijf dagen uit je
 * eten kwam, is een patroon; een stof die op geen enkele dag langskwam ook.
 */

export type StofPatroon = {
  stof: Micronutrient;
  /** Op hoeveel ingevulde dagen deze stof goed of enigszins gedekt was. */
  dagen: number;
  /** Het aantal ingevulde dagen waartegen dat gelezen wordt. */
  vanDagen: number;
};

export type DagboekSamenvatting = {
  /** Dagen met minstens één product, binnen het venster. */
  ingevuldeDagen: number;
  /** De lengte van het venster in dagen. */
  venster: number;
  /** Totaal aantal productregels over die dagen. */
  producten: number;
  /** De laatste dag waarop iets geregistreerd is, of null. */
  laatsteDag: string | null;
  /** Alle stoffen met hun patroon, in tabelvolgorde. */
  alle: StofPatroon[];
  /** Stoffen die op de meeste dagen langskwamen, aflopend. */
  sterkste: StofPatroon[];
  /** Stoffen die op de minste dagen langskwamen, oplopend. */
  zwakste: StofPatroon[];
};

function itemsVanDag(dag: DagboekDag): DagItems {
  if (!dag.items) return {};
  return parseDagItems(
    Object.fromEntries(
      Object.entries(dag.items).map(([moment, regels]) => [
        moment,
        regels.map((regel) => ({ k: regel.key, n: regel.porties })),
      ]),
    ),
  );
}

export function bouwDagboekSamenvatting(
  dagen: readonly DagboekDag[],
  venster = 14,
): DagboekSamenvatting {
  const recent = [...dagen]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, venster)
    .map((dag) => ({ dag, items: itemsVanDag(dag) }))
    .filter((rij) => itemsTelling(rij.items) > 0);

  const perStof = new Map<string, StofPatroon>();
  let producten = 0;

  for (const rij of recent) {
    producten += itemsTelling(rij.items);
    const dekking = bouwDagdekking(rij.items);
    for (const stofDekking of dekking.stoffen) {
      const bestaand = perStof.get(stofDekking.stof.id) ?? {
        stof: stofDekking.stof,
        dagen: 0,
        vanDagen: recent.length,
      };
      if (stofDekking.status === "sterk" || stofDekking.status === "iets") {
        bestaand.dagen += 1;
      }
      bestaand.vanDagen = recent.length;
      perStof.set(stofDekking.stof.id, bestaand);
    }
  }

  const patronen = [...perStof.values()];

  return {
    ingevuldeDagen: recent.length,
    venster,
    producten,
    laatsteDag: recent[0]?.dag.date ?? null,
    alle: patronen,
    sterkste: [...patronen].sort((a, b) => b.dagen - a.dagen).slice(0, 3),
    zwakste: [...patronen].sort((a, b) => a.dagen - b.dagen).slice(0, 3),
  };
}

/**
 * Eén regel over de reeks. Geen oordeel over het aantal dagen: er is geen
 * richtlijn die zegt dat vijf beter is dan drie, en een dagboek dat je
 * aanspreekt op zijn eigen invulfrequentie is een dagboek dat je niet meer
 * invult.
 */
/** Het patroon van één stof, of undefined als er geen dag is ingevuld. */
export function patroonVoorStof(
  samenvatting: DagboekSamenvatting,
  stof: string,
): StofPatroon | undefined {
  return samenvatting.alle.find((rij) => rij.stof.id === stof);
}

export function samenvattingRegel(samenvatting: DagboekSamenvatting): string {
  if (samenvatting.ingevuldeDagen === 0) {
    return "Nog geen dagen ingevuld.";
  }
  return `${samenvatting.ingevuldeDagen} ${
    samenvatting.ingevuldeDagen === 1 ? "dag" : "dagen"
  } ingevuld in de laatste ${samenvatting.venster}, samen ${samenvatting.producten} ${
    samenvatting.producten === 1 ? "product" : "producten"
  }.`;
}

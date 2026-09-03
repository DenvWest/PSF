import {
  NUTRITION_LAYERS,
  type NutritionLayerId,
} from "@/data/nutrition/lifestyle-pyramid";
import {
  resolveNutritionFocusLayer,
  type NutritionFactRow,
  type NutritionFactRowKey,
  type NutritionLadderLayerId,
} from "@/lib/nutrition-ladder";

/**
 * Van feitenrijen naar één tot drie prioriteiten — het antwoord op "waar moet
 * ik als eerste naartoe".
 *
 * ## Waarom dit naast de tellingen staat en ze niet vervangt
 *
 * Het Kompas droeg tot nu twee getallen: hoeveel stoffen aandacht vragen en
 * hoeveel keuzes openstaan (zie `nutrition-kompas-samenvatting.ts`). Dat is
 * een *stand* — hoe ver ben je — en het is een goed antwoord op een vraag die
 * niemand als eerste stelt. De eerste vraag is waarheen, en die beantwoordt
 * een telling niet: "3 stoffen vragen aandacht" zegt niet welke stap je zet.
 *
 * Deze module levert dat antwoord uit dezelfde rijen die de ladder al bouwt.
 * Geen tweede meting, geen tweede oordeel — alleen een selectie en een
 * formulering. Dat is bewust: zodra hier een eigen berekening zou staan, kan
 * het Kompas iets anders zeggen dan Voortgang, en dan is geen van beide meer
 * te vertrouwen.
 *
 * ## Prioriteiten zijn richtingen, geen acties
 *
 * "Basisvoeding versterken", niet "Eet meer groente". Dat laatste is het werk
 * van de agenda: een actie heeft een moment nodig, en een moment hoort in een
 * agendablok en niet op een overzichtsscherm. De scheiding is dezelfde als
 * tussen de lagen van de keten — Kompas prioriteert, Agenda maakt er gedrag
 * van.
 *
 * ## Wat er nooit in mag
 *
 * Rijen met status `own` of een opt-out. Dat is geen tekort maar een andere
 * route: wie geen vis eet mist geen doel, hij heeft een ander doel. Ze als
 * prioriteit tonen zou precies de badge zijn die `nutrition-ladder.ts`
 * verbiedt — een grens suggereren die er niet was.
 */

/** Eén richting, met de rij die hem verantwoordt. */
export type NutritionPriority = {
  /** De richting, in de gebiedende vorm zonder werkwoordsdruk. */
  label: string;
  /** De laag waar hij op zit — bepaalt de volgorde. */
  layer: NutritionLadderLayerId;
  /** De feitenrij die hem draagt; de herkomst blijft traceerbaar. */
  source: NutritionFactRowKey;
  /** Is dit de laag die de check als winst aanwijst? */
  isFocus: boolean;
};

export type NutritionPriorities = {
  priorities: NutritionPriority[];
  /** Eén regel die de selectie verantwoordt; null als er niets te prioriteren valt. */
  why: string | null;
  /** De winst-laag uit de check, voor de deur naar Voortgang. */
  focusLayer: NutritionLadderLayerId | null;
};

/**
 * De richting per feitenrij.
 *
 * Bewust niet afgeleid van `row.label`: dat is een zelfstandig naamwoord
 * ("Plantbasis") en een prioriteit is een beweging. Ook bewust niet uit
 * `whyLine` — die verklaart waarom het telt, niet wat je doet.
 */
const PRIORITY_LABEL: Record<NutritionFactRowKey, string> = {
  plantbasis: "Je plantbasis uitbreiden",
  eiwitbronnen: "Je eiwitbronnen aanvullen",
  vezelbasis: "Je vezelbasis versterken",
  visbron: "Je omega-3-bron regelen",
  minderen: "Zoete dranken terugbrengen",
  bewerkingsgraad: "Minder sterk bewerkt eten",
  eiwitritme: "Eiwit beter over de dag verdelen",
};

/** Hoogstens dit aantal — drie richtingen is al een lijst, vier is een taak. */
const MAX_PRIORITIES = 3;

function layerName(layer: NutritionLadderLayerId): string {
  return (
    NUTRITION_LAYERS.find((entry) => entry.layer === layer)?.name ?? `prioriteit ${layer}`
  );
}

/**
 * Telt deze rij mee als prioriteit?
 *
 * `own` valt af omdat er geen meetlat was, en een opt-out omdat de meetlat niet
 * van hem is. Beide zouden als tekort lezen terwijl er geen tekort is.
 */
function isRankable(row: NutritionFactRow): boolean {
  if (row.status === "own") return false;
  if (row.exemption === "opt-out") return false;
  return row.status === "below" || row.status === "near";
}

/**
 * Volgorde: gaten vóór bijna-gaten, en binnen elke soort de laagste laag
 * eerst.
 *
 * Die tweede regel is de noordster uit de ladder: eerst structureel goed eten,
 * dan perfect eten. Een `below` op laag 1 gaat dus vóór een `below` op laag 3,
 * ook als die laatste op de winst-laag zit — want de winst-laag ís de laagste
 * laag met een gat, dus dat geval bestaat niet.
 */
function rankRows(rows: readonly NutritionFactRow[]): NutritionFactRow[] {
  const rankable = rows.filter(isRankable);
  return [...rankable].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "below" ? -1 : 1;
    }
    return a.layer - b.layer;
  });
}

/**
 * De waarom-regel onder de prioriteiten.
 *
 * Feit eerst, dan de richting — dezelfde volgorde als de rest van de
 * check-copy. Geen bemoediging ("goed bezig!"), geen schuld ("dit laat je
 * liggen"): wat er staat en wat het betekent.
 */
function buildWhy(
  priorities: readonly NutritionPriority[],
  rows: readonly NutritionFactRow[],
  focus: NutritionLadderLayerId | null,
): string | null {
  if (priorities.length === 0) {
    // Geen prioriteiten betekent twee heel verschillende dingen.
    const measured = rows.filter((row) => row.status !== "own");
    if (measured.length === 0) {
      return null;
    }
    return "Je antwoorden liggen op of boven hun richtlijn. Hier valt nu niets te prioriteren — houden zo.";
  }

  const gaps = priorities.filter((priority) => {
    const row = rows.find((entry) => entry.key === priority.source);
    return row?.status === "below";
  }).length;

  const focusName = focus != null ? layerName(focus).toLowerCase() : null;

  if (gaps === 0) {
    return focusName
      ? `Geen gaten in je eetbasis — je ${focusName} is waar de eerstvolgende winst zit.`
      : "Geen gaten in je eetbasis; dit is waar de eerstvolgende winst zit.";
  }
  if (gaps === 1) {
    return focusName
      ? `Eén antwoord ligt onder zijn richtlijn. Je ${focusName} is waar je begint.`
      : "Eén antwoord ligt onder zijn richtlijn — daar begin je.";
  }
  return focusName
    ? `${gaps} antwoorden liggen onder hun richtlijn. Je ${focusName} draagt de eerste.`
    : `${gaps} antwoorden liggen onder hun richtlijn — de laagste pak je eerst.`;
}

/**
 * Bouw de prioriteitenlijst.
 *
 * Nooit opvullen tot drie: een derde richting die er niet is, maakt de eerste
 * twee minder waard. Bij één echt signaal staat er één regel, en dat is een
 * scherper scherm dan drie regels waarvan er twee bedacht zijn.
 */
export function buildNutritionPriorities(
  rows: readonly NutritionFactRow[],
): NutritionPriorities {
  const focus = resolveNutritionFocusLayer(rows);
  const ranked = rankRows(rows).slice(0, MAX_PRIORITIES);

  const priorities: NutritionPriority[] = ranked.map((row) => ({
    label: PRIORITY_LABEL[row.key],
    layer: row.layer,
    source: row.key,
    isFocus: focus != null && row.layer === focus,
  }));

  return {
    priorities,
    why: buildWhy(priorities, rows, focus),
    focusLayer: focus,
  };
}

/** Voor het meetpunt: welke lagen dragen de getoonde prioriteiten. */
export function nutritionPriorityLayers(
  priorities: readonly NutritionPriority[],
): NutritionLadderLayerId[] {
  return [...new Set(priorities.map((priority) => priority.layer))].sort((a, b) => a - b);
}

/** Naam van een laag, voor UI die alleen het laag-id heeft. */
export function nutritionLayerName(layer: NutritionLadderLayerId): string {
  return layerName(layer);
}

export type { NutritionLayerId };

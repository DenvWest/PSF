/**
 * Voedselgroep-filters voor de feitenrij-tabel en het P1-categorie-overzicht.
 *
 * De ladder groepeert feitenrijen op **prioriteit** (welke laag pak je eerst
 * aan). Deze laag geeft een tweede ingang: op **voedselgroep** — hoe mensen
 * zelf over eten praten. "Wat zegt mijn check over vlees en vis" is een andere
 * vraag dan "wat pak ik als eerste aan", en beide horen beantwoord te worden
 * zonder de ander te verbergen.
 *
 * Waarom de mapping hier staat en niet op de rij zelf: een feitenrij dekt vaak
 * meerdere groepen. `eiwitbronnen` bundelt vlees, zuivel én noten; `plantbasis`
 * bundelt groente en fruit. Een enkel `group`-veld op de rij zou die
 * werkelijkheid platslaan, en dan zou een filter op "Zuivel" de eiwitbronnen-
 * rij laten verdwijnen terwijl het antwoord er wél in zit.
 */

import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import type {
  NutritionFactRow,
  NutritionFactRowKey,
  NutritionLadderReport,
  NutritionRowExemption,
} from "@/lib/nutrition-ladder";
import { resolveNutritionOptOut } from "@/lib/nutrition-ladder";

/**
 * Alle voedselgroepen die het systeem kent.
 *
 * Twee lijsten putten hieruit, en ze zijn bewust niet gelijk:
 *
 * - **{@link VOEDSELGROEPEN}** — de zeven die de *check* kan beoordelen. Elke
 *   groep hangt aan minstens één feitenrij, dus er valt iets over te zeggen
 *   tegenover een richtlijn.
 * - **{@link DAGBOEK_GROEPEN}** (in `nutrition-dagboek.ts`) — de twaalf die je
 *   zélf per dag invult. Die mogen fijner zijn: je weet wat je at, ook als de
 *   check er geen vraag over stelt.
 *
 * De vijf extra dagboekgroepen (vis apart van vlees, eieren, peulvruchten
 * apart van noten, oliën, dranken) bestaan niet omdat meer categorieën beter
 * zijn, maar omdat de nutriëntroutes ze los nodig hebben: omega-3 loopt via
 * vis, zink via vlees, magnesium via noten. Zolang die drie in één bak zitten,
 * kan het dagboek die routes niet voeden.
 */
export type VoedselgroepId =
  | "groente"
  | "fruit"
  | "vlees-vis"
  | "zuivel"
  | "granen"
  | "noten"
  | "suiker"
  // Alleen in het dagboek — de check stelt hier (nog) geen aparte vraag over.
  | "vis"
  | "vlees"
  | "eieren"
  | "peulvruchten"
  | "zetmeel"
  | "vetten"
  | "dranken";

export interface Voedselgroep {
  id: VoedselgroepId;
  label: string;
  /** Feitenrijen waarin deze groep meetelt. */
  rowKeys: readonly NutritionFactRowKey[];
}

/**
 * Volgorde volgt het bord: eerst de plantkant, dan de eiwitkant, dan wat je
 * mindert. Niet gesorteerd op hoe vaak een groep voorkomt — dat zou per
 * gebruiker verschillen en de knoppenrij bij elke check laten verspringen.
 */
/**
 * De groepen die de **check** beoordeelt — bron voor de categorietabel op P1.
 *
 * Ongewijzigd sinds de tabel bestaat: elke rij hier hangt aan een feitenrij,
 * en zonder feitenrij valt er niets tegenover een richtlijn te zetten. De
 * fijnere dagboekindeling staat los (zie {@link VoedselgroepId}).
 */
export const VOEDSELGROEPEN: readonly Voedselgroep[] = [
  { id: "groente", label: "Groente", rowKeys: ["plantbasis"] },
  { id: "fruit", label: "Fruit", rowKeys: ["plantbasis"] },
  { id: "vlees-vis", label: "Vlees & vis", rowKeys: ["visbron", "eiwitbronnen", "eiwitritme"] },
  { id: "zuivel", label: "Zuivel", rowKeys: ["eiwitbronnen", "eiwitritme"] },
  { id: "granen", label: "Granen", rowKeys: ["vezelbasis"] },
  { id: "noten", label: "Noten & peulvruchten", rowKeys: ["eiwitbronnen"] },
  { id: "suiker", label: "Suiker & bewerkt", rowKeys: ["minderen", "bewerkingsgraad"] },
] as const;

/** Eén categoriekaart op P1 — aanbevolen vs. jij, zonder tweede berekening. */
export type CategorieKaart = {
  id: VoedselgroepId;
  label: string;
  jij: string;
  aanbevolen: string | null;
  aanbevolenBron: string | null;
  status: LadderEvidenceStatus;
  footnote: string | null;
  /**
   * Waaróm deze rij geen richtlijn heeft. Draagt de tekst in de lege
   * richtlijn-cel: zonder dit veld stond daar "geen norm", en dat leest als
   * een ontbrekend getal in plaats van als de uitkomst die het is.
   *
   * Komt rechtstreeks van de feitenrij mee — geen tweede beoordeling. Null
   * betekent: er ís een richtlijn, dus de vraag speelt niet.
   */
  exemption: NutritionRowExemption | null;
  /**
   * Waar jouw antwoord staat op de schaal van zijn eigen vraag, 0–1.
   *
   * De sliders hebben genummerde stops ("nooit" … "dagelijks"), en dat is een
   * echte positie — geen afgeleide van de status. Daarmee kan een balk per
   * categorie een eigen meetwaarde tonen in plaats van alleen de kleur van
   * `status` te herhalen.
   *
   * Null waar de categorie geen slider heeft (de gecombineerde groepen lezen
   * meerdere feitenrijen) of waar de check de vraag niet stelde. De UI toont
   * dan de statuszone zonder markering — een balk zonder positie is eerlijker
   * dan een positie die we verzinnen.
   */
  schaalPositie: number | null;
};

/**
 * Wat er in de richtlijn-cel staat wanneer er geen richtlijn is.
 *
 * Drie verschillende dingen die allemaal "leeg" waren:
 *
 * - `geen-norm` — de vraag heeft geen Nederlandse richtlijn achter zich. Jouw
 *   antwoord is dan het ijkpunt, en dat is een uitkomst, geen gat.
 * - `opt-out` — je eet dit niet, dus deze meetlat is niet van jou.
 * - `niet-gemeten` — de check heeft er (nog) niet naar gevraagd.
 *
 * Nooit een formulering die suggereert dat er een grens was die je miste —
 * dezelfde invariant als in `nutrition-ladder.ts`.
 */
export const GEEN_RICHTLIJN_LABEL: Record<NutritionRowExemption, string> = {
  "geen-norm": "Geen NL-richtlijn — jouw antwoord is het ijkpunt",
  "opt-out": "Niet jouw meetlat",
  "niet-gemeten": "Nog niet gevraagd",
};

/** Korte vorm voor de mobiele regel onder het antwoord. */
export const GEEN_RICHTLIJN_LABEL_KORT: Record<NutritionRowExemption, string> = {
  "geen-norm": "geen NL-richtlijn — jouw antwoord is het ijkpunt",
  "opt-out": "niet jouw meetlat",
  "niet-gemeten": "nog niet gevraagd",
};

const STATUS_PRIORITEIT: Record<LadderEvidenceStatus, number> = {
  below: 0,
  near: 1,
  meets: 2,
  own: 3,
};

function stopLabel(sliderId: string, index: number | undefined): string | null {
  const question = nutritionSliderQuestion(sliderId);
  if (!question || index === undefined || !Number.isFinite(index)) {
    return null;
  }
  const clamped = Math.min(Math.max(Math.trunc(index), 0), question.stops.length - 1);
  return question.stops[clamped]?.label ?? null;
}

/**
 * De positie van een antwoord op zijn eigen schaal, 0–1.
 *
 * Deelt door het aantal stops min één, zodat de laatste stop op 1 uitkomt en
 * niet op 0,8: de bovenste stop ís het einde van de schaal, geen tussenstand.
 */
function sliderPositie(sliderId: string, index: number | undefined): number | null {
  const question = nutritionSliderQuestion(sliderId);
  if (!question || index === undefined || !Number.isFinite(index)) {
    return null;
  }
  const laatste = question.stops.length - 1;
  if (laatste <= 0) {
    return null;
  }
  const clamped = Math.min(Math.max(Math.trunc(index), 0), laatste);
  return clamped / laatste;
}

function sliderIndex(report: NutritionLadderReport, id: string): number | undefined {
  const value = report.sliders[id];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function joinAnswers(parts: (string | null)[]): string {
  const filtered = parts.filter((part): part is string => Boolean(part));
  return filtered.length > 0 ? filtered.join(" · ") : "—";
}

function worstStatus(statuses: readonly LadderEvidenceStatus[]): LadderEvidenceStatus {
  return statuses.reduce(
    (worst, status) => (STATUS_PRIORITEIT[status] < STATUS_PRIORITEIT[worst] ? status : worst),
    "own" as LadderEvidenceStatus,
  );
}

/**
 * De exemption die de richtlijn-cel moet dragen.
 *
 * Een rij die wél een richtlijn heeft, geeft null terug — ook als de ladder er
 * een exemption op zette. Anders zou een categorie tegelijk een norm én de
 * mededeling "geen norm" tonen. De richtlijn wint: die is concreter.
 *
 * Ontbreekt de rij helemaal, dan is er niet naar gevraagd. Dat is een derde
 * geval, en het verdient een eigen tekst — niet dezelfde als "geen norm".
 */
function exemptionOf(row: NutritionFactRow | undefined): NutritionRowExemption | null {
  if (!row) return "niet-gemeten";
  if (row.benchmarkLabel) return null;
  return row.exemption ?? "geen-norm";
}

function rowMap(factRows: readonly NutritionFactRow[]): Map<NutritionFactRowKey, NutritionFactRow> {
  return new Map(factRows.map((row) => [row.key, row]));
}

function rowsForGroep(
  groep: Voedselgroep,
  byKey: Map<NutritionFactRowKey, NutritionFactRow>,
): NutritionFactRow[] {
  return groep.rowKeys
    .map((key) => byKey.get(key))
    .filter((row): row is NutritionFactRow => row != null);
}

function shouldShowGroep(
  groep: Voedselgroep,
  rows: NutritionFactRow[],
  report: NutritionLadderReport | null,
): boolean {
  if (rows.length > 0) {
    return true;
  }
  if (!report) {
    return false;
  }
  if (groep.id === "groente") {
    return sliderIndex(report, "vegetables") !== undefined;
  }
  if (groep.id === "fruit") {
    return (
      sliderIndex(report, "fruit") !== undefined || sliderIndex(report, "berries") !== undefined
    );
  }
  if (groep.id === "zuivel") {
    return !resolveNutritionOptOut("dairy", report);
  }
  if (groep.id === "noten") {
    return !resolveNutritionOptOut("nutsSeedsLegumes", report);
  }
  if (groep.id === "granen") {
    return !resolveNutritionOptOut("wholegrain", report);
  }
  if (groep.id === "vlees-vis") {
    return !resolveNutritionOptOut("oilyFish", report) || !resolveNutritionOptOut("meatLegumes", report);
  }
  return false;
}

function buildGroenteKaart(
  plantbasis: NutritionFactRow | undefined,
  report: NutritionLadderReport,
): CategorieKaart {
  return {
    id: "groente",
    label: "Groente",
    jij: stopLabel("vegetables", sliderIndex(report, "vegetables")) ?? "—",
    aanbevolen: plantbasis?.benchmarkLabel ?? null,
    aanbevolenBron: plantbasis?.benchmarkSource ?? null,
    status: plantbasis?.status ?? "own",
    footnote: plantbasis?.footnote ?? null,
    exemption: exemptionOf(plantbasis),
    schaalPositie: sliderPositie("vegetables", sliderIndex(report, "vegetables")),
  };
}

function buildFruitKaart(
  plantbasis: NutritionFactRow | undefined,
  report: NutritionLadderReport,
): CategorieKaart {
  return {
    id: "fruit",
    label: "Fruit",
    jij: joinAnswers([
      stopLabel("fruit", sliderIndex(report, "fruit")),
      stopLabel("berries", sliderIndex(report, "berries")),
    ]),
    aanbevolen: plantbasis?.benchmarkLabel ?? null,
    aanbevolenBron: plantbasis?.benchmarkSource ?? null,
    status: plantbasis?.status ?? "own",
    footnote: plantbasis?.footnote ?? null,
    exemption: exemptionOf(plantbasis),
    // Fruit leest twee sliders (fruit + bessen); de laagste van de twee draagt
    // de balk, want die bepaalt waar de ruimte zit.
    schaalPositie: laagstePositie([
      sliderPositie("fruit", sliderIndex(report, "fruit")),
      sliderPositie("berries", sliderIndex(report, "berries")),
    ]),
  };
}

function buildSliderGroepKaart(
  groep: Voedselgroep,
  sliderId: string,
  rows: NutritionFactRow[],
  report: NutritionLadderReport,
): CategorieKaart {
  const primary = rows[0];
  return {
    id: groep.id,
    label: groep.label,
    jij: stopLabel(sliderId, sliderIndex(report, sliderId)) ?? primary?.answerLabel ?? "—",
    aanbevolen: primary?.benchmarkLabel ?? null,
    aanbevolenBron: primary?.benchmarkSource ?? null,
    status: primary?.status ?? "own",
    footnote: primary?.footnote ?? null,
    exemption: exemptionOf(primary),
    schaalPositie: sliderPositie(sliderId, sliderIndex(report, sliderId)),
  };
}

/** De laagste van een paar posities — null als er geen enkele is. */
function laagstePositie(posities: (number | null)[]): number | null {
  const echte = posities.filter((p): p is number => p != null);
  return echte.length > 0 ? Math.min(...echte) : null;
}

function buildCombinedGroepKaart(groep: Voedselgroep, rows: NutritionFactRow[]): CategorieKaart {
  const statuses = rows.map((row) => row.status ?? "own");
  const primary =
    rows.find((row) => row.status === "below") ??
    rows.find((row) => row.status === "near") ??
    rows[0];
  return {
    id: groep.id,
    label: groep.label,
    jij: joinAnswers(rows.map((row) => row.answerLabel)),
    aanbevolen: primary?.benchmarkLabel ?? null,
    aanbevolenBron: primary?.benchmarkSource ?? null,
    status: worstStatus(statuses),
    footnote: primary?.footnote ?? null,
    exemption: exemptionOf(primary),
    // Gecombineerde groepen lezen meerdere feitenrijen zonder één eigen
    // slider. Ze krijgen daarom geen positie: de balk toont dan zijn zone
    // zonder markering, wat eerlijker is dan een gemiddelde over vragen die
    // niet op dezelfde schaal staan.
    schaalPositie: null,
  };
}

/**
 * Categorie-overzicht voor P1 Voedingsbasis — alle groepen op één hoop,
 * ook als de engine de onderliggende rij op P2 of P3 meet.
 */
export function categorieKaarten(
  factRows: readonly NutritionFactRow[],
  report: NutritionLadderReport | null,
): CategorieKaart[] {
  const byKey = rowMap(factRows);
  const plantbasis = byKey.get("plantbasis");
  const cards: CategorieKaart[] = [];

  for (const groep of VOEDSELGROEPEN) {
    const rows = rowsForGroep(groep, byKey);
    if (!shouldShowGroep(groep, rows, report)) {
      continue;
    }

    if (groep.id === "groente" && report) {
      cards.push(buildGroenteKaart(plantbasis, report));
      continue;
    }
    if (groep.id === "fruit" && report) {
      cards.push(buildFruitKaart(plantbasis, report));
      continue;
    }
    if (groep.id === "zuivel" && report) {
      cards.push(buildSliderGroepKaart(groep, "dairy", rows, report));
      continue;
    }
    if (groep.id === "noten" && report) {
      cards.push(buildSliderGroepKaart(groep, "nutsSeedsLegumes", rows, report));
      continue;
    }
    if (groep.id === "granen" && rows.length > 0) {
      cards.push(buildCombinedGroepKaart(groep, rows));
      continue;
    }
    if (rows.length > 0) {
      cards.push(buildCombinedGroepKaart(groep, rows));
    }
  }

  return cards;
}

export function isVoedselgroepId(value: string): value is VoedselgroepId {
  return VOEDSELGROEPEN.some((groep) => groep.id === value);
}

/**
 * Welke rijen horen bij een selectie van groepen?
 * Lege selectie = geen filter = alle rijen.
 */
export function rowKeysVoorGroepen(
  selectie: readonly VoedselgroepId[],
): Set<NutritionFactRowKey> | null {
  if (selectie.length === 0) {
    return null;
  }
  const keys = new Set<NutritionFactRowKey>();
  for (const groep of VOEDSELGROEPEN) {
    if (selectie.includes(groep.id)) {
      for (const key of groep.rowKeys) {
        keys.add(key);
      }
    }
  }
  return keys;
}

/**
 * Groepen waarvoor deze check daadwerkelijk een rij opleverde. Een knop tonen
 * voor een groep die niets filtert is een dode knop — en die kost op 375px
 * precies zoveel ruimte als een werkende.
 */
export function beschikbareGroepen(
  aanwezigeRowKeys: readonly NutritionFactRowKey[],
): Voedselgroep[] {
  const aanwezig = new Set(aanwezigeRowKeys);
  return VOEDSELGROEPEN.filter((groep) =>
    groep.rowKeys.some((key) => aanwezig.has(key)),
  );
}

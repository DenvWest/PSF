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
} from "@/lib/nutrition-ladder";
import { resolveNutritionOptOut } from "@/lib/nutrition-ladder";

export type VoedselgroepId =
  | "groente"
  | "fruit"
  | "vlees-vis"
  | "zuivel"
  | "granen"
  | "noten"
  | "suiker";

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
  };
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

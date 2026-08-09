import {
  MOVEMENT_QUESTIONS,
  MOVEMENT_STATEMENTS,
  MOVEMENT_CHOICES,
  MOVEMENT_DEEPEN,
  MOVEMENT_BENCHMARKS,
  MOVEMENT_DIMENSION_LABELS,
  MOVEMENT_FACT_LABELS,
  MOVEMENT_FACT_ROW_ORDER,
  MOVEMENT_FACT_WHY,
  MOVEMENT_FOCUS_ORDER,
  MOVEMENT_IMPLICATIONS,
  MOVEMENT_MAINTENANCE_IMPLICATION,
  movementAnswerLabel,
  type MovementBand,
  type MovementDimensionKey,
  type MovementFactRowKey,
  type MovementFocusKey,
  type MovementStripVariant,
} from "@/data/movement-checkin";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { getUsableClaims } from "@/data/approved-claims";

export type MovementSelfReport = {
  MOV2_STR?: number;
  MOV2_CARD?: number;
  MOV2_VIG?: number;
  MOV2_SIT?: number;
  MOV2_COND?: number;
  RCV_FEEL?: number;
  MOV2_PAIN?: number;
  MOV2_MOB?: number;
  MOV2_FUNC?: number;
  MOV2_CONSIST?: number;
  MOV2_MOTIV?: number;
};
export type MovementSupplement = { comparisonPath: string; claimText: string };

export type MovementDimensionResult = {
  dimension: MovementDimensionKey;
  band: MovementBand;
  statement: string;
  choices: string[];
  deepen: string | null;
  supplement: MovementSupplement | null;
};

function bandFor(value: number): MovementBand {
  if (value <= 2) return "aandacht";
  if (value === 3) return "redelijk";
  return "sterk";
}

function creatineGate(): MovementSupplement | null {
  const comparisonPath = resolveGatedComparisonPath("creatine");
  if (!comparisonPath) return null;
  const claims = getUsableClaims("creatine");
  if (claims.length === 0) return null;
  return { comparisonPath, claimText: claims[0].text };
}

export function assessMovement(report: MovementSelfReport): MovementDimensionResult[] {
  const results: MovementDimensionResult[] = [];
  for (const q of MOVEMENT_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    const band = bandFor(value);
    const showChoice = band !== "sterk";
    results.push({
      dimension: q.dimension,
      band,
      statement: MOVEMENT_STATEMENTS[q.dimension][band],
      choices: showChoice ? MOVEMENT_CHOICES[q.dimension] : [],
      deepen: showChoice ? MOVEMENT_DEEPEN[q.dimension] : null,
      supplement: q.dimension === "kracht" && showChoice ? creatineGate() : null,
    });
  }
  return results;
}

export type MovementFocus = {
  dimension: MovementFocusKey;
  label: string;
  band: MovementBand;
  statement: string;
  choices: string[];
  deepen: string | null;
  supplement: MovementSupplement | null;
} | null;

export type MovementConclusion = {
  headline: string;
  focusLabel: string | null;
  focusDimension: MovementFocusKey | null;
  statement: string;
  actions: string[];
  /** Herstel/klachten — maximaal twee, klachten altijd eerst. */
  moderatorHints: string[];
};

const MAINTENANCE_ACTIONS = [
  "Houd je vaste beweegmomenten aan — ook in een drukke week",
  "Onderbreek lang zitten elk uur met een paar minuten staan of lopen",
  "Houd twee krachtmomenten per week vast, met 48 uur ertussen",
];

const SMALLER_START_HINT =
  "Begin kleiner dan je denkt nodig te hebben — één moment dat je zeker haalt telt zwaarder dan een plan dat je laat liggen.";

const PAIN_HINT =
  "Je geeft klachten aan die je beweging beperken. Bouw voorzichtig op en overleg bij twijfel met een fysiotherapeut.";

const RECOVERY_HINT =
  "Je voelt je vandaag niet hersteld. Een rustige dag of een korte wandeling past nu beter dan een zware sessie.";

function isFocusDimension(dimension: MovementDimensionKey): dimension is MovementFocusKey {
  return (MOVEMENT_FOCUS_ORDER as readonly MovementDimensionKey[]).includes(dimension);
}

/**
 * Volume toevoegen aan iemand die niet komt opdagen is de klassieke fout — bij
 * lage consistentie én lage motivatie verkleinen we eerst het doel. Bepaalt zowel
 * de focus-override als de toon van het vervolg (S2).
 */
export function isMovementStalled(report: MovementSelfReport): boolean {
  return (
    typeof report.MOV2_CONSIST === "number" &&
    report.MOV2_CONSIST <= 2 &&
    typeof report.MOV2_MOTIV === "number" &&
    report.MOV2_MOTIV <= 2
  );
}

function buildModeratorHints(report: MovementSelfReport): string[] {
  const hints: string[] = [];
  if (typeof report.MOV2_PAIN === "number" && report.MOV2_PAIN <= 2) {
    hints.push(PAIN_HINT);
  }
  if (typeof report.RCV_FEEL === "number" && report.RCV_FEEL <= 2) {
    hints.push(RECOVERY_HINT);
  }
  return hints;
}

export function buildMovementConclusion(
  report: MovementSelfReport,
  results: MovementDimensionResult[],
): MovementConclusion {
  const moderatorHints = buildModeratorHints(report);

  const candidates: { dimension: MovementFocusKey; band: MovementBand; normalized: number }[] = [];
  for (const q of MOVEMENT_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    if (!isFocusDimension(q.dimension)) continue;
    const result = results.find((entry) => entry.dimension === q.dimension);
    if (!result) continue;
    candidates.push({
      dimension: q.dimension,
      band: result.band,
      // Alle beweegvragen delen schaal 1–5, dus delen door 5 volstaat.
      normalized: value / 5,
    });
  }

  candidates.sort((a, b) =>
    a.normalized !== b.normalized
      ? a.normalized - b.normalized
      : MOVEMENT_FOCUS_ORDER.indexOf(a.dimension) - MOVEMENT_FOCUS_ORDER.indexOf(b.dimension),
  );

  const stalled = isMovementStalled(report);
  const override = stalled
    ? candidates.find((candidate) => candidate.dimension === "consistentie")
    : undefined;

  const weakest = override ?? candidates[0];

  if (!weakest || weakest.band === "sterk") {
    return {
      headline: "Je basis staat — houd vast wat werkt",
      focusLabel: null,
      focusDimension: null,
      statement: "Op alles wat we meten staat je beweging er goed voor.",
      actions: MAINTENANCE_ACTIONS,
      moderatorHints,
    };
  }

  const label = MOVEMENT_DIMENSION_LABELS[weakest.dimension];
  const lowMotivation = typeof report.MOV2_MOTIV === "number" && report.MOV2_MOTIV <= 2;
  const baseStatement = MOVEMENT_STATEMENTS[weakest.dimension][weakest.band];
  const statement =
    lowMotivation && weakest.dimension !== "consistentie"
      ? `${baseStatement} ${SMALLER_START_HINT}`
      : baseStatement;

  return {
    headline: `Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij ${label.toLowerCase()}.`,
    focusLabel: label,
    focusDimension: weakest.dimension,
    statement,
    actions: MOVEMENT_CHOICES[weakest.dimension].slice(0, 3),
    moderatorHints,
  };
}

const BAND_RANK: Record<MovementBand, number> = {
  aandacht: 0,
  redelijk: 1,
  sterk: 2,
};

export type MovementDeltaDirection = "up" | "down" | "same" | "new";

export type MovementDimensionDelta = {
  dimension: MovementDimensionKey;
  label: string;
  band: MovementBand;
  previousBand: MovementBand | null;
  answerValue: number;
  previousAnswerValue: number | null;
  /** Richting van de ruwe itemwaarde; bandwissel lees je uit band vs previousBand. */
  direction: MovementDeltaDirection;
};

/**
 * Ruwe itemwaarden vergelijken, niet de domeinscore. De 1–5-schaal per vraag is
 * over de RULES_VERSION-grens heen ongewijzigd — de herschaling van 1.4.0 zat in
 * de weging, niet in de items. Ontbreekt een veld in de vorige meting, dan is de
 * dimensie `new` en wordt er geen verandering gesuggereerd.
 */
export function buildMovementDimensionDeltas(
  current: MovementSelfReport,
  previous: MovementSelfReport | null,
): MovementDimensionDelta[] {
  const deltas: MovementDimensionDelta[] = [];

  for (const q of MOVEMENT_QUESTIONS) {
    const value = current[q.field];
    if (typeof value !== "number") continue;

    const previousValue = previous?.[q.field];
    const hasPrevious = typeof previousValue === "number";
    const band = bandFor(value);
    const previousBand = hasPrevious ? bandFor(previousValue) : null;

    let direction: MovementDeltaDirection = "new";
    if (hasPrevious) {
      if (value > previousValue) direction = "up";
      else if (value < previousValue) direction = "down";
      else direction = "same";
    }

    deltas.push({
      dimension: q.dimension,
      label: MOVEMENT_DIMENSION_LABELS[q.dimension],
      band,
      previousBand,
      answerValue: value,
      previousAnswerValue: hasPrevious ? previousValue : null,
      direction,
    });
  }

  return deltas;
}

/** Template-id uit de copy-tabel — meegestuurd zodat de verdeling meetbaar is. */
export type MovementDeltaTemplate = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7";

export type MovementFocusDelta = {
  template: MovementDeltaTemplate;
  label: string;
  line: string;
  alsoLine: string | null;
  /**
   * De grootste stap vooruit buiten de focus. Een dimensie die de richtlijn nu
   * haalt, is daarmee géén focus meer — zonder deze regel zou juist de winst
   * die iemand net boekte in de bijzin verdwijnen.
   */
  winLine: string | null;
  /** Niet-verwijtende vervolgzin bij een stap terug — hangt aan de richting, niet aan het template. */
  followLine: string | null;
};

function questionFieldFor(dimension: MovementDimensionKey) {
  return MOVEMENT_QUESTIONS.find((q) => q.dimension === dimension)?.field ?? null;
}

function answerLabelFor(dimension: MovementDimensionKey, value: number): string {
  const field = questionFieldFor(dimension);
  return (field && movementAnswerLabel(field, value)) ?? String(value);
}

/**
 * De richtlijn in lopende taal, per dimensie die er een heeft. Zitten ontbreekt
 * bewust: "voorkom veel stilzitten" is kwalitatief, daar valt niets aan af te
 * meten. De overige dimensies hebben geen norm — daar is het eigen antwoord de
 * enige meetlat.
 */
const FOCUS_BENCHMARK_SHORT: Partial<Record<MovementFocusKey, string>> = {
  kracht: "twee keer per week",
  conditie: "150 tot 300 minuten matig per week",
  intensiteit: "75 tot 150 minuten intensief per week",
};

const SMALLER_WEEK_LINE =
  "Dat is het moment om je week kleiner te maken, niet zwaarder — één moment dat je zeker haalt telt hier het zwaarst.";

function valuesFromDeltas(
  deltas: MovementDimensionDelta[],
  which: "current" | "previous",
): Partial<Record<MovementDimensionKey, number>> {
  const values: Partial<Record<MovementDimensionKey, number>> = {};
  for (const delta of deltas) {
    const value = which === "current" ? delta.answerValue : delta.previousAnswerValue;
    if (typeof value === "number") {
      values[delta.dimension] = value;
    }
  }
  return values;
}

function benchmarkStatusFor(
  dimension: MovementDimensionKey,
  values: Partial<Record<MovementDimensionKey, number>>,
): MovementFactStatus {
  if (dimension === "kracht") {
    return strengthStatus(values.kracht);
  }
  if (dimension === "conditie" || dimension === "intensiteit") {
    return aerobicStatus(values.conditie, values.intensiteit);
  }
  return "own";
}

/**
 * Maximaal twee andere dimensies. De selectie blijft intern op de bandwissel —
 * dat filtert ruis weg — maar de regel zelf toont uitsluitend de antwoordlabels
 * die de gebruiker zelf aanklikte. Veranderde er niets, dan valt de regel weg:
 * "er veranderde niets" schrijven we niet.
 */
function buildAlsoLine(
  deltas: MovementDimensionDelta[],
  focusDimension: MovementDimensionKey | null,
  winDimension: MovementDimensionKey | null,
): string | null {
  const moved = deltas
    .filter(
      (delta) =>
        delta.dimension !== focusDimension &&
        delta.dimension !== winDimension &&
        delta.previousBand !== null &&
        delta.previousAnswerValue !== null &&
        delta.direction !== "new" &&
        delta.band !== delta.previousBand,
    )
    .sort((a, b) => {
      const aShift = Math.abs(BAND_RANK[a.band] - BAND_RANK[a.previousBand!]);
      const bShift = Math.abs(BAND_RANK[b.band] - BAND_RANK[b.previousBand!]);
      if (aShift !== bShift) return bShift - aShift;
      return (
        MOVEMENT_QUESTIONS.findIndex((q) => q.dimension === a.dimension) -
        MOVEMENT_QUESTIONS.findIndex((q) => q.dimension === b.dimension)
      );
    })
    .slice(0, 2);

  if (moved.length === 0) return null;

  const parts = moved.map((delta) => {
    const now = answerLabelFor(delta.dimension, delta.answerValue);
    const before = answerLabelFor(delta.dimension, delta.previousAnswerValue!);
    return `${delta.label}: "${before}" → "${now}"`;
  });

  return `Ook veranderd — ${parts.join(" · ")}.`;
}

/**
 * De grootste stap vooruit buiten de focus, of null. Alleen stuurbare delen —
 * "je motivatie ging omhoog" is geen winst om te vieren. Voorwaarde: de dimensie
 * haalt de richtlijn die hij vorige keer niet haalde, of hij schoof minstens twee
 * antwoorden op.
 */
function resolveWinDelta(
  deltas: MovementDimensionDelta[],
  focusDimension: MovementDimensionKey | null,
): { delta: MovementDimensionDelta; reachedBenchmark: boolean } | null {
  const currentValues = valuesFromDeltas(deltas, "current");
  const previousValues = valuesFromDeltas(deltas, "previous");

  const candidates = deltas
    .filter(
      (delta) =>
        delta.dimension !== focusDimension &&
        delta.direction === "up" &&
        delta.previousAnswerValue !== null &&
        isFocusDimension(delta.dimension),
    )
    .map((delta) => ({
      delta,
      step: delta.answerValue - (delta.previousAnswerValue ?? delta.answerValue),
      reachedBenchmark:
        benchmarkStatusFor(delta.dimension, currentValues) === "meets" &&
        benchmarkStatusFor(delta.dimension, previousValues) !== "meets",
    }))
    .filter((entry) => entry.reachedBenchmark || entry.step >= 2)
    .sort((a, b) => {
      if (a.reachedBenchmark !== b.reachedBenchmark) return a.reachedBenchmark ? -1 : 1;
      if (a.step !== b.step) return b.step - a.step;
      return MOVEMENT_FOCUS_ORDER.indexOf(a.delta.dimension as MovementFocusKey) -
        MOVEMENT_FOCUS_ORDER.indexOf(b.delta.dimension as MovementFocusKey);
    });

  const winner = candidates[0];
  return winner ? { delta: winner.delta, reachedBenchmark: winner.reachedBenchmark } : null;
}

function buildWinLine(
  win: { delta: MovementDimensionDelta; reachedBenchmark: boolean } | null,
): string | null {
  if (!win) return null;
  const { delta, reachedBenchmark } = win;
  const previousValue = delta.previousAnswerValue;
  if (previousValue === null) return null;
  const now = answerLabelFor(delta.dimension, delta.answerValue);
  const before = answerLabelFor(delta.dimension, previousValue);
  const short = FOCUS_BENCHMARK_SHORT[delta.dimension as MovementFocusKey];
  const base = `Je grootste stap: ${delta.label} van "${before}" naar "${now}"`;
  return reachedBenchmark && short
    ? `${base} — daarmee zit je op de richtlijn van ${short}.`
    : `${base}.`;
}

function dimensionForLabel(label: string): MovementDimensionKey | null {
  const entry = Object.entries(MOVEMENT_DIMENSION_LABELS).find(
    ([, value]) => value.toLowerCase() === label.toLowerCase(),
  );
  return entry ? (entry[0] as MovementDimensionKey) : null;
}

/**
 * De delta-regel over de focus-dimensie. Geen getallen en geen intern
 * vocabulaire — alleen de antwoordlabels die de gebruiker zelf aanklikte, plus
 * een richting in gewone taal. De onderliggende buckets zijn te breed voor een
 * precisie-uitspraak.
 */
export function buildMovementFocusDelta(
  focusDimension: MovementFocusKey | null,
  deltas: MovementDimensionDelta[],
  previousFocusLabel: string | null,
): MovementFocusDelta | null {
  const win = resolveWinDelta(deltas, focusDimension);
  const winLine = buildWinLine(win);
  const alsoLine = buildAlsoLine(deltas, focusDimension, win?.delta.dimension ?? null);

  if (focusDimension === null) {
    const comparable = deltas.filter((delta) => delta.direction !== "new");
    if (comparable.length === 0) return null;
    if (previousFocusLabel) {
      const previousDimension = dimensionForLabel(previousFocusLabel);
      const previousDelta = previousDimension
        ? deltas.find((entry) => entry.dimension === previousDimension)
        : undefined;
      const nowLabel = previousDelta
        ? answerLabelFor(previousDelta.dimension, previousDelta.answerValue)
        : null;
      return {
        template: "T7",
        label: "Sinds je vorige meting",
        line: nowLabel
          ? `${previousFocusLabel} was vorige keer je grootste winst. Dat deel staat nu op "${nowLabel}" en er springt niets meer uit.`
          : `${previousFocusLabel} was vorige keer je grootste winst; nu springt er geen deel meer uit.`,
        alsoLine,
        winLine,
        followLine: null,
      };
    }
    return {
      template: "T6",
      label: "Sinds je vorige meting",
      line:
        "Je antwoorden zijn gelijk aan je vorige beweegcheck. Er springt geen deel uit dat nu aandacht vraagt.",
      alsoLine,
      winLine,
      followLine: null,
    };
  }

  const delta = deltas.find((entry) => entry.dimension === focusDimension);
  if (!delta) return null;

  const label = MOVEMENT_DIMENSION_LABELS[focusDimension];
  const answerLabel = answerLabelFor(focusDimension, delta.answerValue);
  const short = FOCUS_BENCHMARK_SHORT[focusDimension];

  if (delta.direction === "new" || delta.previousAnswerValue === null) {
    return {
      template: "T1",
      label: "Je nulpunt",
      line: short
        ? `Dit is je eerste beweegcheck. ${label} staat op "${answerLabel}". De richtlijn is ${short} — daar meet je vanaf nu tegenaf.`
        : `Dit is je eerste beweegcheck. ${label} staat op "${answerLabel}" — dat is vanaf nu je vergelijkpunt.`,
      alsoLine: null,
      winLine: null,
      followLine: null,
    };
  }

  const previousAnswerLabel = answerLabelFor(focusDimension, delta.previousAnswerValue);

  if (delta.direction === "same") {
    return {
      template: "T5",
      label: "Sinds je vorige meting",
      line: `${label} staat op hetzelfde antwoord als vorige keer — "${answerLabel}".`,
      alsoLine,
      winLine,
      followLine: null,
    };
  }

  // Een stap terug krijgt altijd dezelfde vervolgzin, ook als hij binnen
  // dezelfde antwoordgroep valt ("1 week" → "Geen"). Dat is de zwaarste daling
  // die er is; die aan het template hangen zou hem juist daar overslaan.
  const followLine = delta.direction === "down" ? SMALLER_WEEK_LINE : null;
  const statusNow = benchmarkStatusFor(focusDimension, valuesFromDeltas(deltas, "current"));
  const groupChanged = delta.previousBand !== null && delta.band !== delta.previousBand;

  if (groupChanged) {
    const forward = delta.direction === "up";
    const tail = forward && short && statusNow === "meets"
      ? ` Daarmee zit je op de richtlijn van ${short}.`
      : "";
    return {
      template: forward ? "T2" : "T3",
      label: "Sinds je vorige meting",
      line:
        `${label}: je koos vorige keer "${previousAnswerLabel}", nu "${answerLabel}". ` +
        `${forward ? "Dat is een stap vooruit." : "Dat is minder dan vorige keer."}${tail}`,
      alsoLine,
      winLine,
      followLine,
    };
  }

  const closing =
    delta.direction === "up" && short && statusNow !== "meets"
      ? `Een stap vooruit, en de richtlijn van ${short} is nog niet in beeld — dat hoeft nu ook niet.`
      : `Een stap ${delta.direction === "up" ? "vooruit" : "terug"} ten opzichte van jezelf.`;

  return {
    template: "T4",
    label: "Sinds je vorige meting",
    line: `${label}: van "${previousAnswerLabel}" naar "${answerLabel}". ${closing}`,
    alsoLine,
    winLine,
    followLine,
  };
}

export type MovementFactStatus = "below" | "near" | "meets" | "own";

export type MovementFactRow = {
  key: MovementFactRowKey;
  label: string;
  /** Letterlijk het antwoord dat hij aanklikte, hooguit aangevuld met de eenheid. */
  answerLabel: string;
  benchmarkLabel: string | null;
  benchmarkSource: string | null;
  status: MovementFactStatus;
  whyLine: string;
  footnote: string | null;
};

/**
 * De ondergrens van elk antwoordbereik, in minuten. Bewust de ondergrens en niet
 * het midden: de uitkomst mag nooit ruimer zijn dan wat hij aanklikte.
 */
const AEROBIC_MODERATE_MINUTES: Record<number, number> = { 5: 300, 4: 150, 3: 90, 2: 30, 1: 0 };
const AEROBIC_VIGOROUS_MINUTES: Record<number, number> = { 5: 150, 4: 75, 3: 30, 2: 0, 1: 0 };

/**
 * De richtlijn kent één aerobe norm met twee valuta's: 150–300 minuten matig,
 * of 75–150 intensief, of een combinatie waarin één intensieve minuut voor twee
 * telt. Twee losse rijen zouden iemand met 150 matige minuten en geen intensieve
 * minuten twee keer "onder de richtlijn" tonen terwijl hij de norm haalt.
 */
function aerobicStatus(moderate?: number, vigorous?: number): MovementFactStatus {
  if (typeof moderate !== "number" && typeof vigorous !== "number") return "own";
  const moderateMinutes = typeof moderate === "number" ? AEROBIC_MODERATE_MINUTES[moderate] ?? 0 : 0;
  const vigorousMinutes = typeof vigorous === "number" ? AEROBIC_VIGOROUS_MINUTES[vigorous] ?? 0 : 0;
  const equivalent = moderateMinutes + 2 * vigorousMinutes;
  if (equivalent >= 150) return "meets";
  if (equivalent >= 90) return "near";
  return "below";
}

function strengthStatus(value?: number): MovementFactStatus {
  if (typeof value !== "number") return "own";
  if (value >= 4) return "meets";
  if (value === 3) return "near";
  return "below";
}

function factAnswerLabel(key: MovementFactRowKey, report: MovementSelfReport): string | null {
  if (key === "aeroob") {
    const moderate =
      typeof report.MOV2_CARD === "number"
        ? movementAnswerLabel("MOV2_CARD", report.MOV2_CARD)
        : null;
    const vigorous =
      typeof report.MOV2_VIG === "number" ? movementAnswerLabel("MOV2_VIG", report.MOV2_VIG) : null;
    const parts: string[] = [];
    if (moderate) parts.push(`${moderate.toLowerCase()} matig`);
    if (vigorous) parts.push(`${vigorous.toLowerCase()} intensief`);
    return parts.length > 0 ? parts.join(" · ") : null;
  }

  const question = MOVEMENT_QUESTIONS.find((q) => q.dimension === key);
  if (!question) return null;
  const value = report[question.field];
  if (typeof value !== "number") return null;
  const label = movementAnswerLabel(question.field, value);
  if (!label) return null;

  if (key === "zitten") return `${label} per dag`;
  if (key === "consistentie") {
    return value === 1 ? "Geen week gehaald deze maand" : `${label} van de afgelopen maand`;
  }
  return label;
}

function factStatus(key: MovementFactRowKey, report: MovementSelfReport): MovementFactStatus {
  if (key === "aeroob") return aerobicStatus(report.MOV2_CARD, report.MOV2_VIG);
  if (key === "kracht") return strengthStatus(report.MOV2_STR);
  return "own";
}

function factRowKeyForFocus(focusDimension: MovementFocusKey | null): MovementFactRowKey | null {
  if (focusDimension === null) return null;
  if (focusDimension === "conditie" || focusDimension === "intensiteit") return "aeroob";
  return (MOVEMENT_FACT_ROW_ORDER as readonly string[]).includes(focusDimension)
    ? (focusDimension as MovementFactRowKey)
    : null;
}

/**
 * Het feitelijke beeld op het resultaat: per deel eerst zijn eigen antwoord, dan
 * de richtlijn waar die bestaat, dan pas een kwalificatie. De focus-rij staat
 * vooraan; de UI toont er vier en vouwt de rest op.
 */
export function buildMovementFactRows(
  report: MovementSelfReport,
  focusDimension: MovementFocusKey | null,
): MovementFactRow[] {
  const rows: MovementFactRow[] = [];

  for (const key of MOVEMENT_FACT_ROW_ORDER) {
    const answerLabel = factAnswerLabel(key, report);
    if (!answerLabel) continue;

    const status = factStatus(key, report);
    const benchmark = MOVEMENT_BENCHMARKS[key] ?? null;
    const why = MOVEMENT_FACT_WHY[key];

    rows.push({
      key,
      label: MOVEMENT_FACT_LABELS[key],
      answerLabel,
      benchmarkLabel: benchmark?.label ?? null,
      benchmarkSource: benchmark?.source ?? null,
      status,
      whyLine: status === "below" && why.below ? why.below : why.neutral,
      footnote: benchmark?.footnote ?? null,
    });
  }

  const focusKey = factRowKeyForFocus(focusDimension);
  if (!focusKey) return rows;

  const focusIndex = rows.findIndex((row) => row.key === focusKey);
  if (focusIndex <= 0) return rows;
  return [rows[focusIndex], ...rows.filter((_, index) => index !== focusIndex)];
}

/**
 * Welke toon het vervolg krijgt. Een stap terug of een vastgelopen check gaat
 * naar S2 — daar staat één deur, en die maakt de week kleiner.
 */
export function resolveMovementStripVariant(input: {
  direction: MovementDeltaDirection | null;
  focusBand: MovementBand;
  hasFocus: boolean;
  stalled: boolean;
}): MovementStripVariant {
  if (input.direction === "down" || input.stalled) return "S2";
  if (input.direction === "new" || (input.hasFocus && input.focusBand === "aandacht")) return "S1";
  return "S3";
}

export function resolveMovementImplication(
  focusDimension: MovementFocusKey | null,
  band: MovementBand,
): string {
  if (focusDimension === null || band === "sterk") {
    return MOVEMENT_MAINTENANCE_IMPLICATION;
  }
  return MOVEMENT_IMPLICATIONS[focusDimension][band];
}

const MOVEMENT_ROUTING_HINT_DEFAULT =
  "Daar stel je in waar je beweegt en hoe vaak. Wat je vandaag doet, staat er al klaar.";
const MOVEMENT_ROUTING_HINT_CONSISTENTIE =
  "Daar maak je je week kleiner: hoe vaak, en waar. Wat je vandaag doet, staat er al klaar.";

/**
 * Zelfde hint-tekst op check-in en Voortgang (L7) — consistentie krijgt de
 * verkleinvariant. Neemt `string | null` (niet `MovementFocusKey`): Voortgang
 * leest de dimensie terug uit opgeslagen `raw_inputs`, waar hij als losse
 * string staat — de enige toets hier is een gelijkheidscheck.
 */
export function resolveMovementRoutingHint(focusDimension: string | null): string {
  return focusDimension === "consistentie"
    ? MOVEMENT_ROUTING_HINT_CONSISTENTIE
    : MOVEMENT_ROUTING_HINT_DEFAULT;
}

export type MovementCheckinSnapshot = {
  focusDimension: MovementFocusKey | null;
  focusLabel: string | null;
  focusBand: MovementBand;
  answerLabel: string | null;
  answerValue: number | null;
  headline: string;
  focusStatement: string;
  focusDelta: MovementFocusDelta | null;
  dimensionDeltas: MovementDimensionDelta[];
  implicationLine: string;
  moderatorHints: string[];
  /** Het feitelijke beeld: antwoord, richtlijn, kwalificatie — in die volgorde. */
  factRows: MovementFactRow[];
  stripVariant: MovementStripVariant;
};

/**
 * Het gedeelde conclusie-blok voor het check-in resultaat én Voortgang. Bevat
 * bewust geen acties en geen routing: routing hangt aan het live plan-profiel,
 * niet aan de bevroren meting.
 */
export function buildMovementCheckinSnapshot(input: {
  report: MovementSelfReport;
  results: MovementDimensionResult[];
  conclusion: MovementConclusion;
  previousReport: MovementSelfReport | null;
  previousFocusLabel: string | null;
}): MovementCheckinSnapshot {
  const { report, results, conclusion, previousReport, previousFocusLabel } = input;
  const dimensionDeltas = buildMovementDimensionDeltas(report, previousReport);
  const focusDimension = conclusion.focusDimension;
  const focusResult = focusDimension
    ? results.find((entry) => entry.dimension === focusDimension)
    : undefined;
  const focusBand: MovementBand = focusResult?.band ?? "sterk";
  const focusDelta = dimensionDeltas.find((delta) => delta.dimension === focusDimension);
  const answerValue = focusDelta?.answerValue ?? null;

  return {
    focusDimension,
    focusLabel: conclusion.focusLabel,
    focusBand,
    answerLabel:
      focusDimension && answerValue !== null
        ? answerLabelFor(focusDimension, answerValue)
        : null,
    answerValue,
    headline: conclusion.headline,
    focusStatement: conclusion.statement,
    focusDelta: buildMovementFocusDelta(focusDimension, dimensionDeltas, previousFocusLabel),
    dimensionDeltas,
    implicationLine: resolveMovementImplication(focusDimension, focusBand),
    moderatorHints: conclusion.moderatorHints,
    factRows: buildMovementFactRows(report, focusDimension),
    stripVariant: resolveMovementStripVariant({
      direction: focusDelta?.direction ?? null,
      focusBand,
      hasFocus: focusDimension !== null,
      stalled: isMovementStalled(report),
    }),
  };
}

export function resolveMovementFocus(
  conclusion: MovementConclusion,
  results: MovementDimensionResult[],
): MovementFocus {
  const dimension = conclusion.focusDimension;
  if (dimension === null) return null;

  const result = results.find((entry) => entry.dimension === dimension);
  if (!result) return null;

  return {
    dimension,
    label: MOVEMENT_DIMENSION_LABELS[dimension],
    band: result.band,
    statement: result.statement,
    choices: result.choices,
    deepen: result.deepen,
    supplement: result.supplement,
  };
}

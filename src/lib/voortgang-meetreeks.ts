import type { DomainMeasurement, DomainMeasurementValue } from "@/types/dashboard";

/**
 * De meetreeks van één domein als matrix: meetwaarden verticaal, meetmomenten
 * horizontaal. De momenten komen binnen als oudste-eerst en worden hier
 * omgedraaid: links je laatste meting, naar rechts terug in de tijd. Dat is
 * bewust tegen de gewoonte van een tijdgrafiek in — waar je nú staat is het
 * antwoord dat telt, en dat hoort waar je begint te lezen. De UI moet die
 * richting daarom expliciet benoemen, anders leest een stijgende lijn averechts.
 *
 * Drie dingen die deze bouwer moet dragen en die de UI niet mag verzinnen:
 * · Momenten meten niet allemaal hetzelfde. Een leefstijlcheck-punt draagt geen
 *   losse waarden, en een oudere check kan een veld missen dat een nieuwe wel
 *   heeft. De rijen zijn dus de vereniging van alle sleutels, met gaten waar
 *   een moment die waarde niet mat.
 * · Een rij mag alleen een lijn krijgen als minstens twee momenten een positie
 *   op dezelfde schaal hebben. Anders is de grafiek schijnprecisie.
 * · Waar die schaal op rust (`scale`) reist mee, zodat de UI weet of ze
 *   norm-taal mag voeren. Niet elk domein heeft een gebronde grens.
 */

export const SCORE_ROW_KEY = "__score__";

export type MeetreeksCell = {
  answerLabel: string;
  benchmarkLabel: string | null;
  /** Positie op de schaal van de rij, hoger is beter. Null = geen positie. */
  level: number | null;
};

export type MeetreeksRow = {
  key: string;
  label: string;
  /** Even lang als `moments`; null waar dat moment deze waarde niet mat. */
  cells: (MeetreeksCell | null)[];
  levelMax: number;
  /** Waar de indeling op rust — bepaalt of de UI norm-taal mag gebruiken. */
  scale: DomainMeasurementValue["scale"] | "score";
  /** Of er een lijn door mag: minstens twee momenten met een positie. */
  plottable: boolean;
};

export type Meetreeks = {
  /** Nieuwste eerst — de leesrichting van de tabel en de grafiek. */
  moments: DomainMeasurement[];
  /** De domeinscore als eerste rij — het algemene beeld boven de losse waarden. */
  scoreRow: MeetreeksRow;
  /** De losse meetwaarden, in de volgorde van het meest recente moment. */
  valueRows: MeetreeksRow[];
};

/** Sleutels in de volgorde van het nieuwste moment; oudere sleutels erachteraan. */
function orderedKeys(newestFirst: DomainMeasurement[]): string[] {
  const keys: string[] = [];
  for (const moment of newestFirst) {
    for (const value of moment.values) {
      if (!keys.includes(value.key)) {
        keys.push(value.key);
      }
    }
  }
  return keys;
}

/** Het nieuwste voorkomen van een sleutel: een hernoemde vraag houdt zijn huidige naam. */
function newestValue(
  newestFirst: DomainMeasurement[],
  key: string,
): DomainMeasurementValue | null {
  for (const moment of newestFirst) {
    const hit = moment.values.find((value) => value.key === key);
    if (hit) {
      return hit;
    }
  }
  return null;
}

function toCell(value: DomainMeasurementValue): MeetreeksCell {
  return {
    answerLabel: value.answerLabel,
    benchmarkLabel: value.benchmarkLabel,
    level: value.level,
  };
}

function buildScoreRow(moments: DomainMeasurement[]): MeetreeksRow {
  const cells = moments.map<MeetreeksCell>((moment) => ({
    answerLabel: String(moment.score),
    benchmarkLabel: null,
    level: moment.score,
  }));
  return {
    key: SCORE_ROW_KEY,
    label: "Domeinscore",
    cells,
    levelMax: 100,
    scale: "score",
    plottable: cells.length >= 2,
  };
}

export function buildMeetreeks(oldestFirst: DomainMeasurement[]): Meetreeks {
  const moments = [...oldestFirst].reverse();

  const valueRows = orderedKeys(moments).map<MeetreeksRow>((key) => {
    const cells = moments.map((moment) => {
      const value = moment.values.find((entry) => entry.key === key);
      return value ? toCell(value) : null;
    });
    // Het nieuwste voorkomen bepaalt naam, schaallengte én herkomst: een
    // hernieuwde onderbouwing hoort de hele rij te gelden, niet alleen de
    // laatste kolom.
    const newest = newestValue(moments, key);

    return {
      key,
      label: newest?.label ?? key,
      cells,
      levelMax: newest?.levelMax ?? 1,
      scale: newest?.scale ?? "zelfrapportage",
      plottable: cells.filter((cell) => cell?.level != null).length >= 2,
    };
  });

  return { moments, scoreRow: buildScoreRow(moments), valueRows };
}

/** De rij die de grafiek tekent, of null als niets van deze reeks te plotten is. */
export function resolvePlotRow(reeks: Meetreeks, key: string | null): MeetreeksRow | null {
  const candidates = [reeks.scoreRow, ...reeks.valueRows];
  const chosen = candidates.find((row) => row.key === key);
  if (chosen?.plottable) {
    return chosen;
  }
  return candidates.find((row) => row.plottable) ?? null;
}

import type { MovementSelfReport } from "@/lib/movement-assessment";

const MOVEMENT_REPORT_FIELDS = [
  "MOV2_STR",
  "MOV2_CARD",
  "MOV2_VIG",
  "MOV2_SIT",
  "MOV2_COND",
  "RCV_FEEL",
  "MOV2_PAIN",
  "MOV2_MOB",
  "MOV2_FUNC",
  "MOV2_CONSIST",
  "MOV2_MOTIV",
] as const;

export type MovementCheckinMode = "full" | "pulse";

export type MovementCheckinReport = Required<
  Pick<MovementSelfReport, (typeof MOVEMENT_REPORT_FIELDS)[number]>
>;

function parseIntField(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

export function parseMovementCheckinMode(raw: unknown): MovementCheckinMode {
  return raw === "pulse" ? "pulse" : "full";
}

export function parsePulseMovementReport(raw: unknown): Pick<MovementSelfReport, "RCV_FEEL"> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const rcvFeel = parseIntField((raw as Record<string, unknown>).RCV_FEEL, 1, 5);
  if (rcvFeel === null) {
    return null;
  }
  return { RCV_FEEL: rcvFeel };
}

export type StoredMovementCheckin = {
  report: MovementSelfReport;
  focusLabel: string | null;
  focusDimension: string | null;
};

/**
 * De opgeslagen `raw_inputs` van een eerdere beweegcheck. Tolerant per veld:
 * rijen van vóór de conclusie-persistentie missen `focus_*`, en een pulse-rij
 * bevat alleen RCV_FEEL. Ontbrekende velden worden weggelaten, niet geraden —
 * de delta-engine leest ze dan als `new`.
 */
export function parseStoredMovementCheckin(raw: unknown): StoredMovementCheckin | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const report: MovementSelfReport = {};
  let found = false;

  for (const field of MOVEMENT_REPORT_FIELDS) {
    const value = parseIntField(record[field], 1, 5);
    if (value !== null) {
      report[field] = value;
      found = true;
    }
  }

  if (!found) {
    return null;
  }

  return {
    report,
    focusLabel:
      typeof record.focus_label === "string" && record.focus_label.trim()
        ? record.focus_label.trim()
        : null,
    focusDimension:
      typeof record.focus_dimension === "string" && record.focus_dimension.trim()
        ? record.focus_dimension.trim()
        : null,
  };
}

export type StoredMovementCheckinDelta = {
  label: string;
  line: string;
  alsoLine: string | null;
  winLine: string | null;
  followLine: string | null;
};

export type StoredMovementCheckinSnapshot = {
  headline: string;
  focusDimension: string | null;
  focusLabel: string | null;
  answerLabel: string | null;
  focusStatement: string;
  implicationLine: string;
  delta: StoredMovementCheckinDelta | null;
  /** Ruwe startmeting-tekst — UI formatteert als "Sinds je start: …". */
  startStatement: string | null;
};

/**
 * Leest het bevroren readout-blok terug uit `raw_inputs` — spiegelt
 * `parseSleepCheckinFocus`. Vereist `conclusion_text`; ontbreekt dat (pulse-rij,
 * of een check van vóór deze slice), dan is er niets om te tonen.
 */
export function parseStoredMovementCheckinSnapshot(
  raw: unknown,
): StoredMovementCheckinSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const headline =
    typeof record.conclusion_text === "string" ? record.conclusion_text.trim() : "";
  const focusStatement =
    typeof record.focus_statement === "string" ? record.focus_statement.trim() : "";
  if (!headline || !focusStatement) {
    return null;
  }

  const deltaLine = typeof record.delta_line === "string" ? record.delta_line.trim() : "";
  const deltaLabel = typeof record.delta_label === "string" ? record.delta_label.trim() : "";
  const delta: StoredMovementCheckinDelta | null =
    deltaLine && deltaLabel
      ? {
          label: deltaLabel,
          line: deltaLine,
          alsoLine:
            typeof record.delta_also_line === "string" && record.delta_also_line.trim()
              ? record.delta_also_line.trim()
              : null,
          winLine:
            typeof record.delta_win_line === "string" && record.delta_win_line.trim()
              ? record.delta_win_line.trim()
              : null,
          followLine:
            typeof record.delta_follow_line === "string" && record.delta_follow_line.trim()
              ? record.delta_follow_line.trim()
              : null,
        }
      : null;

  return {
    headline,
    focusDimension:
      typeof record.focus_dimension === "string" && record.focus_dimension.trim()
        ? record.focus_dimension.trim()
        : null,
    focusLabel:
      typeof record.focus_label === "string" && record.focus_label.trim()
        ? record.focus_label.trim()
        : null,
    answerLabel:
      typeof record.answer_label === "string" && record.answer_label.trim()
        ? record.answer_label.trim()
        : null,
    focusStatement,
    implicationLine:
      typeof record.implication_line === "string" ? record.implication_line.trim() : "",
    delta,
    startStatement:
      typeof record.start_statement === "string" && record.start_statement.trim()
        ? record.start_statement.trim()
        : null,
  };
}

export function parseFullMovementReport(raw: unknown): MovementCheckinReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const report: Partial<MovementCheckinReport> = {};
  for (const field of MOVEMENT_REPORT_FIELDS) {
    const value = parseIntField(record[field], 1, 5);
    if (value === null) {
      return null;
    }
    report[field] = value;
  }
  return report as MovementCheckinReport;
}

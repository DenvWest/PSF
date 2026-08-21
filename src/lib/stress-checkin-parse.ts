import type { StressCheckReport } from "@/lib/stress-ladder";

const STRESS_REPORT_FIELDS = [
  "STR_FREQ",
  "STR_RCV",
  "STR_AUTO",
  "STR_REFL",
  "STR_AWARE",
  "STR_BLOCK",
  "STR_CHARGE",
] as const;

function parseIntField(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

/**
 * Leest de opgeslagen `raw_inputs` van een eerdere stress-check terug tot een
 * `StressCheckReport`. Alle zeven velden staan al in de rij (route.ts) — dit
 * is de eerste plek die STR_AUTO, STR_REFL, STR_AWARE, STR_BLOCK en
 * STR_CHARGE weer leest sinds ze werden opgeslagen.
 */
export function parseStoredStressCheckin(raw: unknown): StressCheckReport | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const report: StressCheckReport = {};
  let found = false;

  for (const field of STRESS_REPORT_FIELDS) {
    const value = parseIntField(record[field], 1, 4);
    if (value !== null) {
      report[field] = value;
      found = true;
    }
  }

  return found ? report : null;
}

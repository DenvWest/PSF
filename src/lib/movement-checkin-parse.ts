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

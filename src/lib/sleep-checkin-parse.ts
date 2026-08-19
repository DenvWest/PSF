import type { SleepActionableKey } from "@/data/sleep-checkin";
import type { SleepPriorityId } from "@/data/sleep/lifestyle-priorities";
import {
  parseSleepCheckReport,
  type SleepCheckinReadoutDelta,
} from "@/lib/sleep-checkin-readout";
import type { SleepLayerState } from "@/lib/sleep-ladder";

export type StoredSleepCheckinSnapshot = {
  headline: string;
  focusLabel: string | null;
  focusDimension: SleepActionableKey | null;
  answerLabel: string | null;
  focusStatement: string;
  implicationLine: string;
  focusLayer: SleepPriorityId;
  layerStates: Record<SleepPriorityId, SleepLayerState>;
  kompasStatus: string;
  primaryAction: string | null;
  delta: SleepCheckinReadoutDelta | null;
};

function parseLayerStates(raw: unknown): Record<SleepPriorityId, SleepLayerState> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const result = {} as Record<SleepPriorityId, SleepLayerState>;
  const valid: SleepLayerState[] = ["winst", "ok", "watch", "wacht"];
  for (let id = 1; id <= 6; id++) {
    const state = record[String(id)];
    if (typeof state !== "string" || !valid.includes(state as SleepLayerState)) {
      return null;
    }
    result[id as SleepPriorityId] = state as SleepLayerState;
  }
  return result;
}

function parseDelta(raw: unknown): SleepCheckinReadoutDelta | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const label = typeof record.label === "string" ? record.label : "";
  const line = typeof record.line === "string" ? record.line : "";
  if (!label || !line) return null;
  return {
    label,
    line,
    alsoLine: typeof record.alsoLine === "string" ? record.alsoLine : null,
    startLine: typeof record.startLine === "string" ? record.startLine : null,
  };
}

export function parseStoredSleepCheckinSnapshot(
  raw: unknown,
): StoredSleepCheckinSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const headline =
    typeof record.conclusion_text === "string" ? record.conclusion_text.trim() : "";
  const focusStatement =
    typeof record.focus_statement === "string" ? record.focus_statement.trim() : "";
  if (!headline || !focusStatement) return null;

  const focusDimensionRaw = record.focus_dimension;
  const focusDimension =
    focusDimensionRaw === "inslapen" ||
    focusDimensionRaw === "doorslapen" ||
    focusDimensionRaw === "regelmaat"
      ? focusDimensionRaw
      : null;

  const layerStates = parseLayerStates(record.layer_states);
  const focusLayerRaw = record.focus_layer;
  const focusLayer =
    typeof focusLayerRaw === "number" && focusLayerRaw >= 1 && focusLayerRaw <= 6
      ? (focusLayerRaw as SleepPriorityId)
      : null;

  if (!layerStates || focusLayer == null) return null;

  return {
    headline,
    focusLabel:
      typeof record.focus_label === "string" && record.focus_label.trim()
        ? record.focus_label.trim()
        : null,
    focusDimension,
    answerLabel:
      typeof record.answer_label === "string" && record.answer_label.trim()
        ? record.answer_label.trim()
        : null,
    focusStatement,
    implicationLine:
      typeof record.implication_line === "string" ? record.implication_line : "",
    focusLayer,
    layerStates,
    kompasStatus:
      typeof record.kompas_status === "string" ? record.kompas_status : "",
    primaryAction:
      typeof record.primary_action === "string" ? record.primary_action : null,
    delta: parseDelta(record.delta),
  };
}

export { parseSleepCheckReport };

export function parseStoredSleepCheckinForFacts(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return parseSleepCheckReport(raw as Record<string, unknown>);
}

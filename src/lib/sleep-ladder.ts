import type { SleepActionableKey, SleepBand } from "@/data/sleep-checkin";
import {
  SLEEP_DUUR_QUESTION,
  SLEEP_CONTEXT_QUESTIONS,
  SLEEP_QUESTIONS,
} from "@/data/sleep-checkin";
import type { SleepPriorityId } from "@/data/sleep/lifestyle-priorities";
import type { SleepAssessment } from "@/lib/sleep-assessment";

export type SleepLayerState = "winst" | "ok" | "watch" | "wacht";

export type SleepCheckReport = {
  SLP_ONSET?: number;
  SLP_WAKE?: number;
  SLP_CONS?: number;
  SLP_QUAL?: number;
  duur?: number;
  winddown?: number;
  nightload?: number;
  morninglight?: number;
};

function bandFor(value: number, max: number): SleepBand {
  if (value >= max) return "sterk";
  if (value === max - 1) return "redelijk";
  return "aandacht";
}

function duurBand(duur: number | undefined): SleepBand | null {
  if (duur == null) return null;
  if (duur >= 7.5) return "sterk";
  if (duur >= 6.5) return "redelijk";
  return "aandacht";
}

function contextBand(value: number | undefined): SleepBand | null {
  if (value == null) return null;
  return bandFor(value, 4);
}

/** Bepaalt welke prioriteit nu de winst-laag is (laag 1 bovenaan). */
export function resolveSleepFocusLayer(
  report: SleepCheckReport,
  assessment: SleepAssessment,
): SleepPriorityId {
  const duur = duurBand(report.duur);
  if (duur === "aandacht") return 1;

  const regelmaat = report.SLP_CONS != null ? bandFor(report.SLP_CONS, 3) : null;
  if (regelmaat === "aandacht") return 2;

  const behaviorBands = [
    contextBand(report.winddown),
    contextBand(report.morninglight),
    contextBand(report.nightload),
  ].filter((b): b is SleepBand => b != null);

  const behaviorWeak = behaviorBands.some((b) => b === "aandacht");
  if (behaviorWeak) return 3;

  const focusDim = assessment.focus?.dimension;
  if (focusDim === "regelmaat") return 2;
  if (focusDim === "inslapen" || focusDim === "doorslapen") return 5;

  if (duur === "redelijk" || regelmaat === "redelijk") return 2;

  return 3;
}

function layerBand(layer: SleepPriorityId, report: SleepCheckReport): SleepBand | null {
  switch (layer) {
    case 1:
      return duurBand(report.duur);
    case 2:
      return report.SLP_CONS != null ? bandFor(report.SLP_CONS, 3) : null;
    case 3: {
      const bands = [
        contextBand(report.winddown),
        contextBand(report.morninglight),
        contextBand(report.nightload),
      ].filter((b): b is SleepBand => b != null);
      if (bands.length === 0) return null;
      if (bands.some((b) => b === "aandacht")) return "aandacht";
      if (bands.every((b) => b === "sterk")) return "sterk";
      return "redelijk";
    }
    case 4:
      return null;
    case 5: {
      if (report.SLP_ONSET == null && report.SLP_WAKE == null) return null;
      const bands: SleepBand[] = [];
      if (report.SLP_ONSET != null) bands.push(bandFor(report.SLP_ONSET, 4));
      if (report.SLP_WAKE != null) bands.push(bandFor(report.SLP_WAKE, 4));
      if (bands.some((b) => b === "aandacht")) return "aandacht";
      if (bands.every((b) => b === "sterk")) return "sterk";
      return "redelijk";
    }
    case 6:
      return null;
    default:
      return null;
  }
}

function bandToLayerState(band: SleepBand | null, layer: SleepPriorityId, focus: SleepPriorityId): SleepLayerState {
  if (layer === 4) return "wacht";
  if (layer === focus) return "winst";
  if (band == null) return layer > focus ? "wacht" : "watch";
  if (band === "sterk") return "ok";
  if (band === "redelijk") return "watch";
  return layer < focus ? "watch" : "wacht";
}

export function resolveSleepLayerStates(
  report: SleepCheckReport,
  assessment: SleepAssessment,
): Record<SleepPriorityId, SleepLayerState> {
  const focus = resolveSleepFocusLayer(report, assessment);
  const states = {} as Record<SleepPriorityId, SleepLayerState>;

  for (let id = 1 as SleepPriorityId; id <= 6; id = (id + 1) as SleepPriorityId) {
    if (id === 6) {
      const duurOk = duurBand(report.duur) !== "aandacht";
      const ritmeOk = report.SLP_CONS != null && bandFor(report.SLP_CONS, 3) !== "aandacht";
      states[id] = duurOk && ritmeOk && focus >= 3 ? "watch" : "wacht";
      continue;
    }
    states[id] = bandToLayerState(layerBand(id, report), id, focus);
  }

  return states;
}

export function sleepLayerWhyWait(
  layer: SleepPriorityId,
  focus: SleepPriorityId,
): string | null {
  if (layer === focus) return null;
  const defaults: Partial<Record<SleepPriorityId, string>> = {
    2: "Je tijden liggen redelijk vast. Dit weegt pas mee als je slaapduur staat.",
    3: "Avondafbouw en ochtendlicht staan open, maar ze hangen aan tijd die er nog niet is.",
    4: "Je omgeving is niet je knelpunt zolang de tijd in bed ontbreekt.",
    5: "Geen aanhoudende klachten gemeld naast het slaaptekort.",
    6: "Eerst gelegenheid, dan een potje.",
  };
  if (layer < focus) return null;
  return defaults[layer] ?? "Deze prioriteit kan wachten tot de laag erboven staat.";
}

export function labelForSleepField(
  field: keyof SleepCheckReport,
  value: number,
): string | null {
  if (field === "duur") {
    const match = SLEEP_DUUR_QUESTION.options.find((o) => o.value === value);
    return match?.label ?? null;
  }
  for (const q of SLEEP_QUESTIONS) {
    if (q.field === field) {
      return q.options.find((o) => o.value === value)?.label ?? null;
    }
  }
  for (const q of SLEEP_CONTEXT_QUESTIONS) {
    if (q.field === field) {
      return q.options.find((o) => o.value === value)?.label ?? null;
    }
  }
  return null;
}

export function sleepFocusDimensionLabel(dimension: SleepActionableKey | null): string | null {
  if (!dimension) return null;
  const q = SLEEP_QUESTIONS.find((entry) => entry.dimension === dimension);
  return q?.label ?? null;
}

import {
  SLEEP_QUESTIONS,
  SLEEP_STATEMENTS,
  SLEEP_CHOICES,
  SLEEP_DEEPEN,
  type SleepBand,
  type SleepDimensionKey,
  type SleepActionableKey,
} from "@/data/sleep-checkin";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { getUsableClaims } from "@/data/approved-claims";

export type SleepSelfReport = {
  SLP_ONSET?: number;
  SLP_WAKE?: number;
  SLP_CONS?: number;
  SLP_QUAL?: number;
};
export type SleepSupplement = { comparisonPath: string; claimText: string };

export type SleepDimensionStatus = {
  dimension: SleepDimensionKey;
  label: string;
  band: SleepBand;
};
export type SleepFocus = {
  dimension: SleepActionableKey;
  label: string;
  statement: string;
  choices: string[];
  deepen: string;
  supplement: SleepSupplement | null;
} | null;
export type SleepAssessment = { statuses: SleepDimensionStatus[]; focus: SleepFocus };

export type SleepConclusionContext = {
  winddown?: number;
  nightload?: number;
};

export type SleepConclusion = {
  headline: string;
  focusLabel: string | null;
  focusDimension: SleepActionableKey | null;
  statement: string;
  actions: string[];
  secondaryHint?: string;
};

const MAINTENANCE_ACTIONS = [
  "Houd je vaste op- en bedtijden aan — ook in het weekend",
  "Dim licht en schermen een uur voor bed",
  "Ga kort naar buiten in het ochtendlicht na het opstaan",
];

function bandFor(value: number, max: number): SleepBand {
  if (value >= max) return "sterk";
  if (value === max - 1) return "redelijk";
  return "aandacht";
}

function magnesiumGate(): SleepSupplement | null {
  const comparisonPath = resolveGatedComparisonPath("magnesium");
  if (!comparisonPath) return null;
  const claims = getUsableClaims("magnesium");
  if (claims.length === 0) return null;
  return { comparisonPath, claimText: claims[0].text };
}

export function assessSleep(report: SleepSelfReport): SleepAssessment {
  const statuses: SleepDimensionStatus[] = [];
  const actionable: {
    dimension: SleepActionableKey;
    label: string;
    band: SleepBand;
    normalized: number;
  }[] = [];

  for (const q of SLEEP_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    const band = bandFor(value, q.max);
    statuses.push({ dimension: q.dimension, label: q.label, band });
    if (q.actionable) {
      actionable.push({
        dimension: q.dimension as SleepActionableKey,
        label: q.label,
        band,
        normalized: value / q.max,
      });
    }
  }

  const ORDER: SleepActionableKey[] = ["inslapen", "doorslapen", "regelmaat"];
  actionable.sort((a, b) =>
    a.normalized !== b.normalized
      ? a.normalized - b.normalized
      : ORDER.indexOf(a.dimension) - ORDER.indexOf(b.dimension),
  );
  const weakest = actionable[0];

  let focus: SleepFocus = null;
  if (weakest && weakest.band !== "sterk") {
    focus = {
      dimension: weakest.dimension,
      label: weakest.label,
      statement: SLEEP_STATEMENTS[weakest.dimension][weakest.band],
      choices: SLEEP_CHOICES[weakest.dimension],
      deepen: SLEEP_DEEPEN[weakest.dimension],
      supplement:
        weakest.dimension === "inslapen" || weakest.dimension === "doorslapen"
          ? magnesiumGate()
          : null,
    };
  }

  return { statuses, focus };
}

function buildSecondaryHint(context?: SleepConclusionContext): string | undefined {
  const hints: string[] = [];
  if (context?.winddown != null && context.winddown <= 2) {
    hints.push("Avondafbouw");
  }
  if (context?.nightload != null && context.nightload <= 2) {
    hints.push("piekeren 's avonds");
  }
  if (hints.length === 0) {
    return undefined;
  }
  if (hints.length === 1) {
    return `Ook ${hints[0]} vraagt aandacht.`;
  }
  return `Ook ${hints[0]} en ${hints[1]} vragen aandacht.`;
}

export function buildSleepConclusion(
  assessment: SleepAssessment,
  context?: SleepConclusionContext,
): SleepConclusion {
  const secondaryHint = buildSecondaryHint(context);

  if (!assessment.focus) {
    return {
      headline: "Je basis staat goed — houd vast wat werkt",
      focusLabel: null,
      focusDimension: null,
      statement: "Je slaap staat er goed voor op de meetbare pijlers.",
      actions: MAINTENANCE_ACTIONS,
      secondaryHint,
    };
  }

  return {
    headline: `Op basis van jouw antwoorden ligt jouw grootste slaapwinst bij ${assessment.focus.label}.`,
    focusLabel: assessment.focus.label,
    focusDimension: assessment.focus.dimension,
    statement: assessment.focus.statement,
    actions: assessment.focus.choices.slice(0, 3),
    secondaryHint,
  };
}

export type ParsedSleepCheckinFocus = {
  focusLabel: string | null;
  focusDimension: SleepActionableKey | null;
  conclusionText: string;
  actions: string[];
  chosenActions: string[];
};

export function parseSleepCheckinFocus(raw: unknown): ParsedSleepCheckinFocus | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const conclusionText =
    typeof record.conclusion_text === "string" ? record.conclusion_text.trim() : "";
  if (!conclusionText) {
    return null;
  }

  const focusLabel =
    typeof record.focus_label === "string" && record.focus_label.trim()
      ? record.focus_label.trim()
      : null;
  const focusDimensionRaw = record.focus_dimension;
  const focusDimension =
    focusDimensionRaw === "inslapen" ||
    focusDimensionRaw === "doorslapen" ||
    focusDimensionRaw === "regelmaat"
      ? focusDimensionRaw
      : null;

  const actions = Array.isArray(record.conclusion_actions)
    ? record.conclusion_actions.filter((item): item is string => typeof item === "string")
    : [];
  const chosenActions = Array.isArray(record.chosen_actions)
    ? record.chosen_actions.filter((item): item is string => typeof item === "string")
    : [];

  return {
    focusLabel,
    focusDimension,
    conclusionText,
    actions,
    chosenActions,
  };
}

import { SLEEP_DUUR_QUESTION } from "@/data/sleep-checkin";
import type { SleepActionableKey } from "@/data/sleep-checkin";
import type { SleepPriorityId } from "@/data/sleep/lifestyle-priorities";
import {
  labelForSleepField,
  resolveSleepFocusLayer,
  resolveSleepLayerStates,
  type SleepCheckReport,
  type SleepLayerState,
} from "@/lib/sleep-ladder";
import type { SleepAssessment, SleepConclusion } from "@/lib/sleep-assessment";

export type SleepFactStatus = "below" | "near" | "meets" | "na";

export type SleepFactRow = {
  key: string;
  label: string;
  answerLabel: string;
  benchmarkLabel: string | null;
  status: SleepFactStatus;
  layer: SleepPriorityId | null;
  whyLine: string;
};

export type SleepCheckinReadoutDelta = {
  label: string;
  line: string;
  alsoLine: string | null;
  startLine: string | null;
};

export type SleepCheckinSnapshot = {
  focusLayer: SleepPriorityId;
  layerStates: Record<SleepPriorityId, SleepLayerState>;
  headline: string;
  focusLabel: string | null;
  focusDimension: SleepActionableKey | null;
  answerLabel: string | null;
  focusStatement: string;
  implicationLine: string;
  delta: SleepCheckinReadoutDelta | null;
  factRows: SleepFactRow[];
  kompasStatus: string;
  primaryAction: string | null;
};

const FACT_ORDER: { key: keyof SleepCheckReport; label: string; layer: SleepPriorityId; bench: string | null }[] = [
  { key: "duur", label: "Slaapduur", layer: 1, bench: "Populatierichtlijn: 7+ uur" },
  { key: "SLP_CONS", label: "Regelmaat", layer: 2, bench: null },
  { key: "winddown", label: "Avondafbouw", layer: 3, bench: null },
  { key: "morninglight", label: "Ochtendlicht", layer: 3, bench: null },
  { key: "nightload", label: "Piekeren voor bed", layer: 3, bench: null },
  { key: "SLP_ONSET", label: "Inslapen", layer: 5, bench: null },
  { key: "SLP_WAKE", label: "Doorslapen", layer: 5, bench: null },
  { key: "SLP_QUAL", label: "Uitgerust wakker", layer: 5, bench: null },
];

function factStatus(key: keyof SleepCheckReport, value: number): SleepFactStatus {
  if (key === "duur") {
    if (value >= 7.5) return "meets";
    if (value >= 6.5) return "near";
    return "below";
  }
  if (key === "SLP_CONS") {
    if (value >= 3) return "meets";
    if (value === 2) return "near";
    return "below";
  }
  if (key === "SLP_ONSET" || key === "SLP_WAKE" || key === "SLP_QUAL") {
    if (value >= 4) return "meets";
    if (value === 3) return "near";
    return "below";
  }
  if (value >= 4) return "meets";
  if (value === 3) return "near";
  return "below";
}

export function buildSleepFactRows(
  report: SleepCheckReport,
  focusDimension: SleepActionableKey | null,
): SleepFactRow[] {
  const rows: SleepFactRow[] = [];

  for (const spec of FACT_ORDER) {
    const value = report[spec.key];
    if (value == null) continue;
    const answerLabel = labelForSleepField(spec.key, value);
    if (!answerLabel) continue;
    const status = factStatus(spec.key, value);
    rows.push({
      key: spec.key,
      label: spec.label,
      answerLabel,
      benchmarkLabel: spec.bench,
      status,
      layer: spec.layer,
      whyLine:
        status === "below"
          ? "Hier valt nu de meeste winst te behalen."
          : "Dit draagt bij aan je slaapbeeld.",
    });
  }

  const focusKey =
    focusDimension === "regelmaat"
      ? "SLP_CONS"
      : focusDimension === "inslapen"
        ? "SLP_ONSET"
        : focusDimension === "doorslapen"
          ? "SLP_WAKE"
          : null;

  if (!focusKey) return rows;
  const idx = rows.findIndex((r) => r.key === focusKey);
  if (idx <= 0) return rows;
  return [rows[idx], ...rows.filter((_, i) => i !== idx)];
}

function resolveImplication(focusLayer: SleepPriorityId, conclusion: SleepConclusion): string {
  if (conclusion.secondaryHint) {
    return conclusion.secondaryHint.replace(/^Ook /, "").replace(/\.$/, "") + " — maar je winst zit elders.";
  }
  switch (focusLayer) {
    case 1:
      return "Zolang de gelegenheid onder de zes uur blijft, verandert finetunen aan je avond weinig.";
    case 2:
      return "Vaste tijden geven je klok houvast — dat maakt elke andere stap makkelijker.";
    case 3:
      return "Met tijd en ritme op orde is gedrag nu het goedkoopste ding dat nog verschil maakt.";
    case 5:
      return "Aanhoudende klachten vragen om gerichte hulp — niet om harder proberen.";
    default:
      return "Eén verandering tegelijk — anders weet je achteraf niet wat het deed.";
  }
}

function buildDeltaLine(
  current: SleepCheckReport,
  previous: SleepCheckReport | null,
): SleepCheckinReadoutDelta | null {
  if (!previous) {
    const duurLabel =
      current.duur != null ? labelForSleepField("duur", current.duur) : null;
    return {
      label: "Je nulpunt",
      line: duurLabel
        ? `Dit is je eerste slaapcheck. Slaapduur staat op "${duurLabel}" — daar meet je vanaf nu tegenaf.`
        : "Dit is je eerste slaapcheck — vanaf nu kun je je voortgang volgen.",
      alsoLine: null,
      startLine: null,
    };
  }

  const parts: string[] = [];
  if (current.duur != null && previous.duur != null && current.duur !== previous.duur) {
    parts.push(
      `Slaapduur ging van "${labelForSleepField("duur", previous.duur)}" naar "${labelForSleepField("duur", current.duur)}".`,
    );
  }
  if (
    current.SLP_CONS != null &&
    previous.SLP_CONS != null &&
    current.SLP_CONS !== previous.SLP_CONS
  ) {
    parts.push(
      `Regelmaat ging van "${labelForSleepField("SLP_CONS", previous.SLP_CONS)}" naar "${labelForSleepField("SLP_CONS", current.SLP_CONS)}".`,
    );
  }

  if (parts.length === 0) {
    return {
      label: "Sinds je vorige meting",
      line: "Je antwoorden staan ongeveer gelijk — consistentie telt ook.",
      alsoLine: null,
      startLine: null,
    };
  }

  return {
    label: "Sinds je vorige meting",
    line: parts[0],
    alsoLine: parts.length > 1 ? parts.slice(1).join(" ") : null,
    startLine: null,
  };
}

export function buildSleepKompasStatus(
  focusLayer: SleepPriorityId,
  report: SleepCheckReport,
): string {
  const duurLabel = report.duur != null ? labelForSleepField("duur", report.duur) : null;
  switch (focusLayer) {
    case 1:
      return duurLabel
        ? `Je slaapt doorgaans ${duurLabel.toLowerCase()}. De tijd die je jezelf geeft is nu je grootste winst.`
        : "De tijd die je jezelf geeft is nu je grootste winst.";
    case 2:
      return "Je ritme vraagt aandacht — vaste tijden geven je klok houvast.";
    case 3:
      return "Je basis staat beter — avondgedrag en ochtendlicht zijn nu de losse eindjes.";
    case 5:
      return "Er zijn aanhoudende klachten — kijk gericht wat je kunt aanpakken of bespreken.";
    default:
      return "Je slaapbeeld is gemeten — bekijk waar je nu het meeste winst pakt.";
  }
}

export function buildSleepCheckinSnapshot(input: {
  report: SleepCheckReport;
  assessment: SleepAssessment;
  conclusion: SleepConclusion;
  previousReport: SleepCheckReport | null;
  startStatement: string | null;
}): SleepCheckinSnapshot {
  const { report, assessment, conclusion, previousReport, startStatement } = input;
  const focusLayer = resolveSleepFocusLayer(report, assessment);
  const layerStates = resolveSleepLayerStates(report, assessment);
  const focusDimension = conclusion.focusDimension;
  const factRows = buildSleepFactRows(report, focusDimension);

  let answerLabel: string | null = null;
  if (focusLayer === 1 && report.duur != null) {
    answerLabel = labelForSleepField("duur", report.duur);
  } else if (focusLayer === 3 && report.morninglight != null) {
    answerLabel = labelForSleepField("morninglight", report.morninglight);
  } else if (focusDimension === "regelmaat" && report.SLP_CONS != null) {
    answerLabel = labelForSleepField("SLP_CONS", report.SLP_CONS);
  } else if (focusDimension === "inslapen" && report.SLP_ONSET != null) {
    answerLabel = labelForSleepField("SLP_ONSET", report.SLP_ONSET);
  } else if (focusDimension === "doorslapen" && report.SLP_WAKE != null) {
    answerLabel = labelForSleepField("SLP_WAKE", report.SLP_WAKE);
  }

  const delta = buildDeltaLine(report, previousReport);
  if (delta && startStatement) {
    delta.startLine = startStatement;
  }

  const primaryAction = conclusion.actions[0] ?? null;

  return {
    focusLayer,
    layerStates,
    headline: conclusion.headline,
    focusLabel: conclusion.focusLabel,
    focusDimension,
    answerLabel,
    focusStatement: conclusion.statement,
    implicationLine: resolveImplication(focusLayer, conclusion),
    delta,
    factRows,
    kompasStatus: buildSleepKompasStatus(focusLayer, report),
    primaryAction,
  };
}

export function parseSleepCheckReport(raw: Record<string, unknown>): SleepCheckReport | null {
  const report: SleepCheckReport = {};
  let found = false;

  const intFields: (keyof SleepCheckReport)[] = [
    "SLP_ONSET",
    "SLP_WAKE",
    "SLP_CONS",
    "SLP_QUAL",
    "winddown",
    "nightload",
    "morninglight",
  ];

  for (const field of intFields) {
    const value = raw[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      report[field] = value;
      found = true;
    }
  }

  if (typeof raw.duur === "number" && SLEEP_DUUR_QUESTION.options.some((o) => o.value === raw.duur)) {
    report.duur = raw.duur;
    found = true;
  }

  return found ? report : null;
}

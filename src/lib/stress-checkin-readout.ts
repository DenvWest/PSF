import {
  STRESS_DEEP_QUESTIONS,
  STRESS_QUESTIONS,
  STRESS_STATEMENTS,
  type StressBand,
} from "@/data/stress-checkin";
import {
  STRESS_LAYER_BY_ID,
  type StressPriorityId,
} from "@/data/stress/lifestyle-priorities";
import {
  resolveStressFocusLayer,
  resolveStressLayerStates,
  type StressCheckReport,
  type StressLayerState,
} from "@/lib/stress-ladder";

export type StressFactStatus = "below" | "near" | "meets" | "na";

export type StressFactRow = {
  key: string;
  label: string;
  answerLabel: string;
  /** Soft pillars hebben geen externe richtlijn — altijd null. */
  benchmarkLabel: null;
  status: StressFactStatus;
  layer: StressPriorityId | null;
  /** Alleen STR_FREQ/STR_RCV wegen mee in de score. */
  scoresWeight: boolean;
  whyLine: string;
};

export type StressCheckinReadoutDelta = {
  label: string;
  line: string;
  alsoLine: string | null;
  startLine: string | null;
};

export type StressCheckinSnapshot = {
  focusLayer: StressPriorityId;
  layerStates: Record<StressPriorityId, StressLayerState>;
  headline: string;
  focusLabel: string;
  answerLabel: string | null;
  focusStatement: string;
  implicationLine: string;
  delta: StressCheckinReadoutDelta | null;
  factRows: StressFactRow[];
  kompasStatus: string;
  primaryAction: string | null;
};

const FACT_ORDER: {
  key: keyof StressCheckReport;
  label: string;
  layer: StressPriorityId;
  scoresWeight: boolean;
}[] = [
  { key: "STR_FREQ", label: "Spanning", layer: 1, scoresWeight: true },
  { key: "STR_RCV", label: "Herstel", layer: 3, scoresWeight: true },
  { key: "STR_BLOCK", label: "Wat je tegenhoudt", layer: 1, scoresWeight: false },
  { key: "STR_AUTO", label: "Invloed op de opbouw", layer: 2, scoresWeight: false },
  { key: "STR_AWARE", label: "Achteraf merken", layer: 2, scoresWeight: false },
  { key: "STR_REFL", label: "Wat er dan gebeurt", layer: 3, scoresWeight: false },
  { key: "STR_CHARGE", label: "Laatst echt opgeladen", layer: 4, scoresWeight: false },
];

function bandFor(value: number): StressBand {
  if (value >= 4) return "sterk";
  if (value === 3) return "redelijk";
  return "aandacht";
}

function factStatus(value: number): StressFactStatus {
  if (value >= 4) return "meets";
  if (value === 3) return "near";
  return "below";
}

export function labelForStressField(
  field: keyof StressCheckReport,
  value: number,
): string | null {
  for (const q of STRESS_QUESTIONS) {
    if (q.field === field) {
      return q.options.find((o) => o.value === value)?.label ?? null;
    }
  }
  for (const q of STRESS_DEEP_QUESTIONS) {
    if (q.field === field) {
      return q.options.find((o) => o.value === value)?.label ?? null;
    }
  }
  return null;
}

export function buildStressFactRows(
  report: StressCheckReport,
  focusLayer: StressPriorityId,
): StressFactRow[] {
  const rows: StressFactRow[] = [];

  for (const spec of FACT_ORDER) {
    const value = report[spec.key];
    if (value == null) continue;
    const answerLabel = labelForStressField(spec.key, value);
    if (!answerLabel) continue;
    const status = factStatus(value);
    rows.push({
      key: spec.key,
      label: spec.label,
      answerLabel,
      benchmarkLabel: null,
      status,
      layer: spec.layer,
      scoresWeight: spec.scoresWeight,
      whyLine:
        status === "below"
          ? "Hier valt nu de meeste winst te behalen."
          : spec.scoresWeight
            ? "Dit weegt mee in je stand — spanning en herstel bepalen je cijfer."
            : "Dit stuurt de volgorde van je prioriteiten, niet je cijfer.",
    });
  }

  const idx = rows.findIndex((r) => r.layer === focusLayer);
  if (idx <= 0) return rows;
  return [rows[idx], ...rows.filter((_, i) => i !== idx)];
}

function resolveImplication(focusLayer: StressPriorityId): string {
  switch (focusLayer) {
    case 1:
      return "Zolang er geen vast eindpunt na werk is, landt een reset nergens.";
    case 2:
      return "Met je grens op orde is een vaste reset het goedkoopste dat nog verschil maakt.";
    case 3:
      return "Herstelmomenten overdag voorkomen dat je avond al leeg begint.";
    case 4:
      return "Als je dag staat en je voorraad leeg blijft, is je nacht de volgende vraag.";
    case 5:
      return "Voeding ondersteunt herstel — het vervangt geen grens.";
    default:
      return "Eerst iets veranderen, dan pas meten wat het deed.";
  }
}

function buildHeadline(report: StressCheckReport, focusLayer: StressPriorityId): string {
  if (focusLayer === 1 && report.STR_FREQ != null) {
    return STRESS_STATEMENTS.spanning[bandFor(report.STR_FREQ)];
  }
  if (focusLayer === 3 && report.STR_RCV != null) {
    return STRESS_STATEMENTS.herstel[bandFor(report.STR_RCV)];
  }
  if (focusLayer === 2) {
    return "Je grens staat. Wat mist is een reset die je zonder nadenken kunt inzetten.";
  }
  if (focusLayer === 4) {
    return "Je dag is op orde, maar je voorraad loopt niet meer vol.";
  }
  if (focusLayer === 6) {
    return "Alles wat je hebt gebouwd staat. Nu is het onderhoud, en dat meet je.";
  }
  return STRESS_LAYER_BY_ID[focusLayer].summary;
}

function buildFocusStatement(report: StressCheckReport, focusLayer: StressPriorityId): string {
  const layer = STRESS_LAYER_BY_ID[focusLayer];
  const freqLabel =
    report.STR_FREQ != null ? labelForStressField("STR_FREQ", report.STR_FREQ) : null;
  const rcvLabel =
    report.STR_RCV != null ? labelForStressField("STR_RCV", report.STR_RCV) : null;
  const blockLabel =
    report.STR_BLOCK != null ? labelForStressField("STR_BLOCK", report.STR_BLOCK) : null;

  if (focusLayer === 1 && freqLabel) {
    return blockLabel
      ? `Spanning staat op "${freqLabel}". Wat je het vaakst tegenhoudt: "${blockLabel}". ${layer.summary}`
      : `Spanning staat op "${freqLabel}". ${layer.summary}`;
  }
  if (focusLayer === 3 && rcvLabel) {
    return `Herstel staat op "${rcvLabel}". ${layer.summary}`;
  }
  return layer.summary;
}

function buildKompasStatus(focusLayer: StressPriorityId): string {
  switch (focusLayer) {
    case 1:
      return "Je omslagmoment na werk is nu je grootste winst.";
    case 2:
      return "Je grens staat — een vaste reset is nu het losse eindje.";
    case 3:
      return "Herstelmomenten overdag vragen aandacht.";
    case 4:
      return "Je voorraad blijft leeg — kijk naar je nacht via de slaapcheck.";
    case 6:
      return "Je basis staat — herhaal de check om te zien of het blijft.";
    default:
      return "Je stressbeeld is gemeten — bekijk waar je nu het meeste winst pakt.";
  }
}

function buildDeltaLine(
  current: StressCheckReport,
  previous: StressCheckReport | null,
): StressCheckinReadoutDelta | null {
  if (!previous) {
    const spanningLabel =
      current.STR_FREQ != null ? labelForStressField("STR_FREQ", current.STR_FREQ) : null;
    return {
      label: "Je nulpunt",
      line: spanningLabel
        ? `Dit is je eerste stress-check. Spanning staat op "${spanningLabel}" — daar meet je vanaf nu tegenaf.`
        : "Dit is je eerste stress-check — vanaf nu kun je je voortgang volgen.",
      alsoLine: null,
      startLine: null,
    };
  }

  const parts: string[] = [];
  if (
    current.STR_FREQ != null &&
    previous.STR_FREQ != null &&
    current.STR_FREQ !== previous.STR_FREQ
  ) {
    parts.push(
      `Spanning ging van "${labelForStressField("STR_FREQ", previous.STR_FREQ)}" naar "${labelForStressField("STR_FREQ", current.STR_FREQ)}".`,
    );
  }
  if (
    current.STR_RCV != null &&
    previous.STR_RCV != null &&
    current.STR_RCV !== previous.STR_RCV
  ) {
    parts.push(
      `Herstel ging van "${labelForStressField("STR_RCV", previous.STR_RCV)}" naar "${labelForStressField("STR_RCV", current.STR_RCV)}".`,
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

export function buildStressCheckinSnapshot(input: {
  report: StressCheckReport;
  previousReport: StressCheckReport | null;
  startStatement: string | null;
}): StressCheckinSnapshot {
  const { report, previousReport, startStatement } = input;
  const focusLayer = resolveStressFocusLayer(report);
  const layerStates = resolveStressLayerStates(report);
  const factRows = buildStressFactRows(report, focusLayer);
  const focusLabel = STRESS_LAYER_BY_ID[focusLayer].name;

  let answerLabel: string | null = null;
  if (focusLayer === 1 && report.STR_FREQ != null) {
    answerLabel = labelForStressField("STR_FREQ", report.STR_FREQ);
  } else if (focusLayer === 2 && report.STR_AUTO != null) {
    answerLabel = labelForStressField("STR_AUTO", report.STR_AUTO);
  } else if (focusLayer === 3 && report.STR_RCV != null) {
    answerLabel = labelForStressField("STR_RCV", report.STR_RCV);
  } else if (focusLayer === 4 && report.STR_CHARGE != null) {
    answerLabel = labelForStressField("STR_CHARGE", report.STR_CHARGE);
  }

  const delta = buildDeltaLine(report, previousReport);
  if (delta && startStatement) {
    delta.startLine = startStatement;
  }

  const primaryAction = STRESS_LAYER_BY_ID[focusLayer].actions[0] ?? null;

  return {
    focusLayer,
    layerStates,
    headline: buildHeadline(report, focusLayer),
    focusLabel,
    answerLabel,
    focusStatement: buildFocusStatement(report, focusLayer),
    implicationLine: resolveImplication(focusLayer),
    delta,
    factRows,
    kompasStatus: buildKompasStatus(focusLayer),
    primaryAction,
  };
}

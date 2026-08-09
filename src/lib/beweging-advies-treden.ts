import { getUsableClaims } from "@/data/approved-claims";
import { getDomainProductStance } from "@/data/domain-product-stance";
import { getDeficiencySignals } from "@/lib/intake-engine";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";
import type { MovementStartPattern } from "@/lib/movement-prefs";
import { WEEK_CATEGORY_OPTIONS } from "@/lib/movement-week-categories";
import { toVerdictCardCopy, type VerdictTone } from "@/lib/supplement-verdict-copy";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

/**
 * De drie treden van het beweging-advies (Pad A, slice 2). Stepped care als
 * volgorde: doen → meten → aanvullen. Geen vierde trede — locatie/partners
 * bestaan niet voor dit domein.
 *
 * Trede 1 is een readout, geen tweede poort: de enige gate op trede 3 blijft de
 * bestaande verdict-engine. Zou trede 1 zelf gaan gaten, dan staat er een tweede
 * oordeelsysteem naast supplement_verdicts.
 */
export type TredeStatus = "nu" | "wacht" | "staat" | "dicht";

export type TredeSupplementItem = {
  ingredientKey: string;
  name: string;
  open: boolean;
  label: string;
  tone: VerdictTone;
  reason: string;
  /**
   * Alleen gevuld bij een goedgekeurde, bruikbare claim. Eiwitpoeder heeft
   * `claims: []` maar kan wél `kopen` worden via protein_gap_signal — dan staat
   * hier null en toont de kaart de inname-formulering in plaats van een claim.
   */
  claimText: string | null;
  comparisonPath: string | null;
};

export type BewegingAdviesTreden = {
  trede1: {
    status: TredeStatus;
    programLabel: string | null;
    positionLine: string | null;
    proteinGap: boolean;
  };
  trede2: {
    status: TredeStatus;
    statusLabel: string;
    scoreLine: string | null;
  };
  trede3: {
    status: TredeStatus;
    items: TredeSupplementItem[];
  };
};

const MOVEMENT_STANCE = getDomainProductStance("movement");

function movementCandidateKeys(): ReadonlySet<string> {
  return MOVEMENT_STANCE.kind === "candidates" ? MOVEMENT_STANCE.slugs : new Set();
}

export function programLabelFor(startPattern: MovementStartPattern | null): string | null {
  if (!startPattern) {
    return null;
  }
  return (
    WEEK_CATEGORY_OPTIONS.find((option) => option.id === startPattern)?.label ?? null
  );
}

function buildScoreLine(
  score: number,
  baseline: number | null,
): string | null {
  if (!Number.isFinite(score)) {
    return null;
  }
  if (baseline != null && baseline !== score) {
    return `Je beweegscore staat op ${Math.round(score)}, begonnen op ${Math.round(baseline)}.`;
  }
  return `Je beweegscore staat op ${Math.round(score)}.`;
}

function buildRemeasureStatus(
  remeasure: DashboardData["remeasure"],
): { status: TredeStatus; statusLabel: string } {
  if (!remeasure) {
    return { status: "dicht", statusLabel: "nog niet gepland" };
  }
  if (remeasure.daysUntil <= 0) {
    return { status: "nu", statusLabel: "staat open" };
  }
  return { status: "wacht", statusLabel: `over ${remeasure.daysUntil} dagen` };
}

export function buildBewegingAdviesTreden(
  model: DashboardModel,
  data: DashboardData | undefined,
  baselineScore: number | null,
): BewegingAdviesTreden {
  const answers = model.answers ?? {};
  const proteinGap = getDeficiencySignals(answers).protein_gap_signal;

  const positionLine = model.movementPlanProgress
    ? buildMovementPositionLine({
        currentPhaseId: model.movementPlanProgress.currentPhaseId,
        startedAt: model.movementPlanProgress.startedAt,
      })
    : null;

  const candidates = movementCandidateKeys();
  const items: TredeSupplementItem[] = (data?.supplementVerdicts ?? [])
    .filter((row) => candidates.has(row.ingredientKey))
    .map((row) => {
      const card = toVerdictCardCopy(row);
      const open = card.verdict === "kopen";
      const claims = getUsableClaims(row.ingredientKey);
      return {
        ingredientKey: card.ingredientKey,
        name: card.name,
        open,
        label: card.label,
        tone: card.tone,
        reason: card.reason,
        claimText: open && claims.length > 0 ? claims[0].text : null,
        comparisonPath: card.comparisonPath,
      };
    })
    .sort((left, right) => Number(right.open) - Number(left.open));

  const remeasure = buildRemeasureStatus(data?.remeasure ?? null);

  return {
    trede1: {
      status: proteinGap ? "nu" : "staat",
      programLabel: programLabelFor(model.movementPrefs.startPattern),
      positionLine,
      proteinGap,
    },
    trede2: {
      status: remeasure.status,
      statusLabel: remeasure.statusLabel,
      scoreLine: buildScoreLine(model.scores.beweging ?? 0, baselineScore),
    },
    trede3: {
      status: items.some((item) => item.open) ? "nu" : "dicht",
      items,
    },
  };
}

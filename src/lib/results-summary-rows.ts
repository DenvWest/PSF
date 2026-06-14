import {
  getPillarById,
  PILLAR_SCORE_KEYS,
  SUMMARY_PILLAR_IDS,
  type PillarId,
} from "@/data/foundation-pyramid";
import type { SummaryRow } from "@/components/intake/IntakeResultPreviewCard";
import { summaryToneFromStatus } from "@/components/intake/IntakeResultPreviewCard";
import type { ThemeSlug } from "@/lib/content/themes";
import { DOMAIN_CHECKIN } from "@/lib/domain-checkin";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import { QUICK_WIN_FALLBACK_BY_DOMAIN } from "@/lib/intake-engine";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import { getDisplayStatus } from "@/lib/score-display";

function isMeasuredPillarId(pillarId: PillarId): pillarId is MeasuredPillarId {
  return pillarId in DOMAIN_CHECKIN;
}

function buildSummaryRow(
  label: string,
  scoreKey: DomainScoreKey,
  scores: DomainScores,
): SummaryRow {
  const status = getDisplayStatus(scores[scoreKey]);

  return {
    label,
    status,
    tone: summaryToneFromStatus(status),
    quickWin: QUICK_WIN_FALLBACK_BY_DOMAIN[scoreKey],
  };
}

export function buildSummaryRows(
  scores: DomainScores,
  primaryTheme: ThemeSlug,
): { rows: SummaryRow[]; primaryLabel: string } {
  const rows: SummaryRow[] = SUMMARY_PILLAR_IDS.map((pillarId) => {
    const pillar = getPillarById(pillarId);
    const label = pillar?.label ?? pillarId;
    const scoreKey = PILLAR_SCORE_KEYS[pillarId];
    if (!scoreKey) {
      const status = getDisplayStatus(Number.NaN);
      return {
        label,
        status,
        tone: summaryToneFromStatus(status),
      };
    }

    const row = buildSummaryRow(label, scoreKey, scores);
    if (isMeasuredPillarId(pillarId)) {
      return { ...row, checkinHref: DOMAIN_CHECKIN[pillarId].href };
    }
    return row;
  });

  rows.push(buildSummaryRow("Herstel", "recovery_score", scores));

  const primaryPillar = getPillarById(primaryTheme);
  const primaryLabel = primaryPillar?.label ?? rows[0]?.label ?? "Slaap";

  return { rows, primaryLabel };
}

const CHECKIN_STATUS_RANK: Record<string, number> = {
  Prioriteit: 0,
  Aandacht: 1,
};

/**
 * Beperkt de "verdiep in 1 min"-checklinks tot hoogstens één secundaire focus.
 * De hoofdpijler heeft al de prominente check-CTA; de overige domeinen blijven
 * stille context. Houdt de checkinHref alleen op de zwaarste rij (Prioriteit
 * vóór Aandacht; bij gelijke status de canonieke pijlervolgorde) en strijkt de
 * rest glad.
 */
export function focusSecondaryCheckin(rows: SummaryRow[]): SummaryRow[] {
  const candidates = rows.filter(
    (row) =>
      row.checkinHref &&
      (row.status === "Prioriteit" || row.status === "Aandacht"),
  );
  if (candidates.length === 0) {
    return rows;
  }
  const keep = [...candidates].sort(
    (a, b) =>
      (CHECKIN_STATUS_RANK[a.status] ?? 9) - (CHECKIN_STATUS_RANK[b.status] ?? 9),
  )[0];
  return rows.map((row) =>
    row.checkinHref && row !== keep ? { ...row, checkinHref: undefined } : row,
  );
}

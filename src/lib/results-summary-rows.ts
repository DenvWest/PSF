import {
  getPillarById,
  PILLAR_SCORE_KEYS,
  SUMMARY_PILLAR_IDS,
} from "@/data/foundation-pyramid";
import type { SummaryRow } from "@/components/intake/IntakeResultPreviewCard";
import { summaryToneFromStatus } from "@/components/intake/IntakeResultPreviewCard";
import type { ThemeSlug } from "@/lib/content/themes";
import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";
import { QUICK_WIN_FALLBACK_BY_DOMAIN } from "@/lib/intake-engine";
import { getDisplayStatus } from "@/lib/score-display";

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

    return buildSummaryRow(label, scoreKey, scores);
  });

  rows.push(buildSummaryRow("Herstel", "recovery_score", scores));

  const primaryPillar = getPillarById(primaryTheme);
  const primaryLabel = primaryPillar?.label ?? rows[0]?.label ?? "Slaap";

  return { rows, primaryLabel };
}

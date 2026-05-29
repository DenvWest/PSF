import {
  getPillarById,
  PILLAR_SCORE_KEYS,
  SUMMARY_PILLAR_IDS,
} from "@/data/foundation-pyramid";
import type { SummaryRow } from "@/components/intake/IntakeResultPreviewCard";
import { summaryToneFromStatus } from "@/components/intake/IntakeResultPreviewCard";
import type { ThemeSlug } from "@/lib/content/themes";
import type { DomainScores } from "@/lib/intake-engine";
import { getDisplayStatus } from "@/lib/score-display";

export function buildSummaryRows(
  scores: DomainScores,
  primaryTheme: ThemeSlug,
): { rows: SummaryRow[]; primaryLabel: string } {
  const rows: SummaryRow[] = SUMMARY_PILLAR_IDS.map((pillarId) => {
    const pillar = getPillarById(pillarId);
    const label = pillar?.label ?? pillarId;
    const scoreKey = PILLAR_SCORE_KEYS[pillarId];
    const status = scoreKey
      ? getDisplayStatus(scores[scoreKey])
      : getDisplayStatus(Number.NaN);

    return {
      label,
      status,
      tone: summaryToneFromStatus(status),
    };
  });

  const primaryPillar = getPillarById(primaryTheme);
  const primaryLabel = primaryPillar?.label ?? rows[0]?.label ?? "Slaap";

  return { rows, primaryLabel };
}

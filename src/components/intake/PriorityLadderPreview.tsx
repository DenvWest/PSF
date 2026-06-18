"use client";

import PriorityLadder from "@/components/app/PriorityLadder";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { CheckScores, Pillar } from "@/types/dashboard";

const LADDER_ROW_H = 60;

type PriorityLadderPreviewProps = {
  topLadder: Pillar[];
  scores: CheckScores;
  totalPillars: number;
  onViewDashboard: () => void;
};

export default function PriorityLadderPreview({
  topLadder,
  scores,
  totalPillars,
  onViewDashboard,
}: PriorityLadderPreviewProps) {
  const remaining = totalPillars - topLadder.length;

  return (
    <article
      className="rounded-3xl border py-2"
      style={{
        background: "var(--panel, rgba(255,255,255,0.05))",
        borderColor: "var(--panel-border, rgba(255,255,255,0.12))",
      }}
    >
      <div style={{ height: topLadder.length * LADDER_ROW_H }}>
        <PriorityLadder ladder={topLadder} scores={scores} />
      </div>
      {remaining > 0 ? (
        <button
          type="button"
          onClick={onViewDashboard}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center border-t border-intake-divider px-5 py-3 text-[13px] font-medium text-intake-sage transition-colors hover:bg-intake-sage/10"
        >
          {REVEAL_COPY.ladderMoreCta}
        </button>
      ) : null}
    </article>
  );
}

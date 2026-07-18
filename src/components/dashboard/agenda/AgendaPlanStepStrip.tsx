"use client";

import { PILLAR } from "@/data/dashboard";
import {
  deriveSuggestedTimeBucket,
  timeBucketLabel,
} from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import type { TimelineBlock } from "@/types/agenda";

type AgendaPlanStepStripProps = {
  block: TimelineBlock;
  onOpenDetail: () => void;
};

function resolveTimeHint(block: TimelineBlock): string {
  if (!block.slot) {
    return block.startTime;
  }

  if (block.slot.isToday) {
    return block.startTime;
  }

  const bucket = deriveSuggestedTimeBucket(block.slot.domain);
  return `${timeBucketLabel(bucket).toLowerCase()} · ${block.startTime}`;
}

export default function AgendaPlanStepStrip({
  block,
  onOpenDetail,
}: AgendaPlanStepStripProps) {
  const accentColor = block.domain ? PILLAR[block.domain].color : "var(--sage)";
  const timeHint = resolveTimeHint(block);

  return (
    <button
      type="button"
      onClick={() => {
        clarityTag("agenda_plan_step", "pinned_strip_open");
        onOpenDetail();
      }}
      aria-label={`Open plan-stap: ${block.title}`}
      className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[14px] border border-[#ebe7e2] bg-white px-3 py-2.5 text-left shadow-[0_2px_8px_rgba(15,28,16,0.04)] transition-opacity hover:opacity-95"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: accentColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#78716c]">
          Stap uit je plan
        </p>
        <p
          className="m-0 truncate text-[14px] font-medium leading-snug text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {block.title}
        </p>
      </div>
      <span className="shrink-0 text-[12px] tabular-nums text-[#78716c]">{timeHint}</span>
    </button>
  );
}

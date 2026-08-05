"use client";

import * as Icons from "@/components/app/icons";
import AgendaTimelineDragHandle from "@/components/dashboard/agenda/AgendaTimelineDragHandle";
import { PILLAR } from "@/data/dashboard";
import { getBlockRoleLabel } from "@/lib/agenda-timeline";
import { clarityTag } from "@/lib/clarity";
import type { AgendaTimelineDragHandleProps } from "@/lib/use-agenda-timeline-drag";
import type { TimelineBlock } from "@/types/agenda";

type AgendaPlanStepStripProps = {
  block: TimelineBlock;
  onOpenDetail: () => void;
  dragHandleProps?: AgendaTimelineDragHandleProps;
};

/**
 * De tray: je dagstap zónder gezet moment. Hij hangt bewust bóven het raster —
 * een blok in het uurraster claimt een tijd die je zelf gekozen moet hebben
 * (verdict §A2c).
 */
export default function AgendaPlanStepStrip({
  block,
  onOpenDetail,
  dragHandleProps,
}: AgendaPlanStepStripProps) {
  const accentColor = block.domain ? PILLAR[block.domain].color : "var(--sage)";

  return (
    <div
      className="flex min-h-14 w-full items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      {dragHandleProps ? (
        <button
          type="button"
          aria-label="Sleep naar je dag"
          className="inline-flex shrink-0 cursor-grab items-stretch border-none bg-white/[0.03] px-0 active:cursor-grabbing"
          {...dragHandleProps}
        >
          <AgendaTimelineDragHandle label="Sleep naar je dag" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => {
          clarityTag("agenda_plan_step", "pinned_strip_open");
          onOpenDetail();
        }}
        aria-label={`Open plan-stap: ${block.title}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: accentColor }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
            {getBlockRoleLabel(block)}
          </p>
          <p
            className="m-0 truncate text-[14px] font-medium leading-snug text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.durationLabel ? `${block.title} · ${block.durationLabel}` : block.title}
          </p>
          <p className="m-0 mt-0.5 text-[11.5px] text-[#9FB0A6]">
            {dragHandleProps
              ? "Sleep naar je dag of tik voor tijd"
              : block.durationLabel
                ? `Nog geen moment gekozen · ${block.durationLabel}`
                : "Nog geen moment gekozen · tik voor tijd"}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--sage)]"
          aria-hidden
        >
          Kies een moment
          <Icons.ChevronRight s={13} />
        </span>
      </button>
    </div>
  );
}

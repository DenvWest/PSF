"use client";

import * as Icons from "@/components/app/icons";
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

  const content = (
    <>
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
          className={`m-0 truncate text-[14px] font-medium leading-snug ${
            block.done ? "text-[#9FB0A6] line-through decoration-white/30" : "text-[#F1EFE8]"
          }`}
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {block.durationLabel ? `${block.title} · ${block.durationLabel}` : block.title}
        </p>
        <p className="m-0 mt-0.5 text-[11.5px] text-[#9FB0A6]">
          {block.done
            ? "Gedaan vandaag"
            : dragHandleProps
              ? "Sleep naar je dag of tik voor tijd"
              : block.durationLabel
                ? `Nog geen moment gekozen · ${block.durationLabel}`
                : "Nog geen moment gekozen · tik voor tijd"}
        </p>
      </div>
      {/* Readout, geen tweede grootboek: de tray toont wat daily_action_log al
          zegt en schrijft zelf niets (verdict-KILL "tweede completion-bron"). */}
      {block.done ? (
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--sage)]"
          aria-hidden
        >
          <Icons.Check s={13} />
          Gedaan
        </span>
      ) : (
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--sage)]"
          aria-hidden
        >
          Kies een moment
          <Icons.ChevronRight s={13} />
        </span>
      )}
    </>
  );

  if (dragHandleProps) {
    return (
      <div
        className="flex min-h-14 w-full cursor-grab touch-none items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left active:cursor-grabbing"
        role="button"
        tabIndex={0}
        aria-label={`Sleep ${block.title} naar je dag of open details`}
        onPointerDown={dragHandleProps.onPointerDown}
        style={{
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
          ...dragHandleProps.style,
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            clarityTag("agenda_plan_step", "pinned_strip_open");
            onOpenDetail();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-14 w-full items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      <button
        type="button"
        onClick={() => {
          clarityTag("agenda_plan_step", "pinned_strip_open");
          onOpenDetail();
        }}
        aria-label={`Open plan-stap: ${block.title}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
      >
        {content}
      </button>
    </div>
  );
}

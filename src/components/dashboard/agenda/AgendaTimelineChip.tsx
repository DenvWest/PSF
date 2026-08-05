"use client";

import type { AgendaTimelineDragHandleProps } from "@/lib/use-agenda-timeline-drag";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { getAgendaCategory } from "@/data/agenda/categories";
import { PILLAR } from "@/data/dashboard";
import { getBlockRoleLabel, resolveBlockRole } from "@/lib/agenda-timeline";
import type { TimelineBlock } from "@/types/agenda";

type AgendaTimelineChipProps = {
  block: TimelineBlock;
  /** Korte blokken: alleen starttijd i.p.v. volledig bereik; herkomst en titel blijven. */
  compact?: boolean;
  onOpenDetail: () => void;
  dragHandleProps?: AgendaTimelineDragHandleProps;
};

function CategoryIcon({
  iconName,
  color,
}: {
  iconName: keyof typeof Icons;
  color: string;
}) {
  const Icon = Icons[iconName] as ComponentType<{ s?: number; style?: CSSProperties }>;
  return <Icon s={12} style={{ color }} />;
}

function ChipContent({
  block,
  compact,
  isAnalysis,
  accentColor,
  eyebrow,
}: {
  block: TimelineBlock;
  compact: boolean;
  isAnalysis: boolean;
  accentColor: string;
  eyebrow: string;
}) {
  const category = getAgendaCategory(block.categoryId);

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col text-left ${
        compact ? "px-2 py-1.5" : "p-2"
      }`}
    >
      <div className="flex min-h-0 flex-1 items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1">
            {!isAnalysis ? (
              <CategoryIcon iconName={category.icon} color={accentColor} />
            ) : (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accentColor }}
                aria-hidden
              />
            )}
            <span className="truncate text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
              {eyebrow}
            </span>
          </div>
          <p
            className={`m-0 text-[13px] font-medium leading-snug text-[#F1EFE8] ${
              compact ? "line-clamp-1" : "line-clamp-2"
            } ${block.done ? "line-through decoration-white/30" : ""}`}
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.title}
          </p>
          {compact ? (
            <p className="mt-0.5 truncate text-[10px] tabular-nums text-[#9FB0A6]">
              {block.startTime.slice(0, 5)}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-[10.5px] tabular-nums text-[#9FB0A6]">
              {block.startTime} – {block.endTime}
            </p>
          )}
        </div>
        {block.done ? (
          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(90,143,106,0.22)] p-1"
            aria-hidden
          >
            <Icons.Check s={12} style={{ color: "#7FB28E" }} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function AgendaTimelineChip({
  block,
  compact = false,
  onOpenDetail,
  dragHandleProps,
}: AgendaTimelineChipProps) {
  const isAnalysis = block.kind === "analysis";
  const category = getAgendaCategory(block.categoryId);
  const isBasis = resolveBlockRole(block) === "basis";
  const accentColor = isAnalysis && block.domain ? PILLAR[block.domain].color : category.color;
  const eyebrow = getBlockRoleLabel(block);

  const shellClassName = `flex h-full w-full overflow-hidden rounded-xl border bg-[#1d3120] ${
    isBasis ? "border-white/15" : "border-white/10"
  } ${block.done ? "opacity-70" : ""}`;

  const shellStyle = {
    borderLeftWidth: isBasis ? 3 : 2,
    borderLeftColor: isBasis ? accentColor : `${accentColor}99`,
  };

  if (dragHandleProps) {
    return (
      <div
        className={`${shellClassName} cursor-grab touch-none active:cursor-grabbing`}
        role="button"
        tabIndex={0}
        aria-label={`Versleep ${block.title} of open details`}
        onPointerDown={dragHandleProps.onPointerDown}
        style={{ ...shellStyle, ...dragHandleProps.style }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetail();
          }
        }}
      >
        <ChipContent
          block={block}
          compact={compact}
          isAnalysis={isAnalysis}
          accentColor={accentColor}
          eyebrow={eyebrow}
        />
      </div>
    );
  }

  return (
    <div className={shellClassName} style={shellStyle}>
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label={`Open ${block.title}`}
        className="flex min-w-0 flex-1 cursor-pointer flex-col text-left transition-colors hover:border-white/20"
      >
        <ChipContent
          block={block}
          compact={compact}
          isAnalysis={isAnalysis}
          accentColor={accentColor}
          eyebrow={eyebrow}
        />
      </button>
    </div>
  );
}

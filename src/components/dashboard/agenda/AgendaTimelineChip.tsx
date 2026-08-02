"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { getAgendaCategory } from "@/data/agenda/categories";
import { PILLAR } from "@/data/dashboard";
import type { TimelineBlock } from "@/types/agenda";

type AgendaTimelineChipProps = {
  block: TimelineBlock;
  onOpenDetail: () => void;
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

export default function AgendaTimelineChip({
  block,
  onOpenDetail,
}: AgendaTimelineChipProps) {
  const isAnalysis = block.kind === "analysis";
  const category = getAgendaCategory(block.categoryId);
  const accentColor = isAnalysis && block.domain ? PILLAR[block.domain].color : category.color;
  const eyebrow = isAnalysis ? "Uit je plan" : category.label;

  return (
    <button
      type="button"
      onClick={onOpenDetail}
      aria-label={`Open ${block.title}`}
      className={`flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1d3120] p-2 text-left transition-colors hover:border-white/20 ${
        block.done ? "opacity-70" : ""
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
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
            className={`m-0 line-clamp-2 text-[13px] font-medium leading-snug text-[#F1EFE8] ${
              block.done ? "line-through decoration-white/30" : ""
            }`}
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.title}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] tabular-nums text-[#9FB0A6]">
            {block.startTime} – {block.endTime}
          </p>
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
    </button>
  );
}

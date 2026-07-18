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
  const eyebrow = isAnalysis ? "Stap uit je plan" : category.label;

  return (
    <button
      type="button"
      onClick={onOpenDetail}
      aria-label={`Open ${block.title}`}
      className={`flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[#ebe7e2] bg-white p-2 text-left shadow-[0_2px_8px_rgba(15,28,16,0.04)] transition-opacity hover:opacity-95 ${
        block.done ? "opacity-75" : ""
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
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.05em] text-[#78716c]">
              {eyebrow}
            </span>
          </div>
          <p
            className="m-0 line-clamp-2 text-[13px] font-medium leading-snug text-[#1c1917]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.title}
          </p>
          <p className="mt-0.5 truncate text-[11px] tabular-nums text-[#78716c]">
            {block.startTime} – {block.endTime}
          </p>
        </div>
        {block.done ? (
          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(90,143,106,0.15)] p-1"
            aria-hidden
          >
            <Icons.Check s={12} style={{ color: "var(--sage)" }} />
          </span>
        ) : null}
      </div>
    </button>
  );
}

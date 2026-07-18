"use client";

import { useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import { getAgendaCategory } from "@/data/agenda/categories";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { TimelineBlock } from "@/types/agenda";
import type { DashboardModel } from "@/types/dashboard";

type AgendaBlockCardProps = {
  block: TimelineBlock;
  model: DashboardModel;
  prefBusy?: boolean;
  busy?: boolean;
  onCompletionChange?: () => void;
  onScheduledTimeChange?: (scheduledTime: string) => void;
  onToggleDone?: (blockId: string, done: boolean) => void;
  onDelete?: (blockId: string) => void;
};

function CategoryIcon({
  iconName,
  color,
}: {
  iconName: keyof typeof Icons;
  color: string;
}) {
  const Icon = Icons[iconName] as ComponentType<{ s?: number; style?: CSSProperties }>;
  return <Icon s={14} style={{ color }} />;
}

function RoutineBlockCard({
  block,
  busy = false,
  onToggleDone,
  onDelete,
}: {
  block: TimelineBlock;
  busy?: boolean;
  onToggleDone?: (blockId: string, done: boolean) => void;
  onDelete?: (blockId: string) => void;
}) {
  const category = getAgendaCategory(block.categoryId);
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="flex h-full min-h-[72px] flex-col overflow-hidden rounded-[14px] border border-[#ebe7e2] bg-white p-3 shadow-[0_2px_10px_rgba(15,28,16,0.05)]"
      style={{ borderLeftWidth: 3, borderLeftColor: category.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <CategoryIcon iconName={category.icon} color={category.color} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78716c]">
              {category.label}
            </span>
          </div>
          <h3
            className="m-0 truncate text-[15px] font-medium leading-snug text-[#1c1917]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {block.title}
          </h3>
          <p className="mt-1 text-[12px] tabular-nums text-[#78716c]">
            {block.startTime} – {block.endTime}
          </p>
        </div>
        {block.isEditable ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center border-none bg-transparent px-1 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {expanded ? "Sluit" : "Meer"}
          </button>
        ) : null}
      </div>

      {expanded && block.isEditable ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const nextDone = !block.done;
              onToggleDone?.(block.id, nextDone);
              trackEvent("agenda_block_toggled", {
                category_id: block.categoryId,
                done: nextDone,
                surface: "agenda_timeline",
              });
              clarityTag("agenda_block", nextDone ? "done" : "undone");
            }}
            className="inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-none px-3 text-[13px] font-semibold disabled:opacity-60"
            style={{
              background: block.done ? "rgba(90, 143, 106, 0.15)" : "var(--sage)",
              color: "#0f1c10",
              fontFamily: "var(--f-sans)",
            }}
          >
            {block.done ? (
              <>
                <Icons.Check s={14} />
                Gedaan
              </>
            ) : (
              "Markeer als gedaan"
            )}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              onDelete?.(block.id);
              trackEvent("agenda_block_deleted", {
                category_id: block.categoryId,
                surface: "agenda_timeline",
              });
              clarityTag("agenda_block", "deleted");
            }}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-3 text-[13px] font-medium text-[#78716c] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            Verwijder
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default function AgendaBlockCard({
  block,
  model,
  prefBusy = false,
  busy = false,
  onCompletionChange,
  onScheduledTimeChange,
  onToggleDone,
  onDelete,
}: AgendaBlockCardProps) {
  if (block.kind === "analysis" && block.slot) {
    return (
      <div className="h-full min-h-[120px]">
        <AgendaTodayHero
          model={model}
          slot={block.slot}
          prefBusy={prefBusy}
          onCompletionChange={onCompletionChange}
          onScheduledTimeChange={onScheduledTimeChange}
        />
      </div>
    );
  }

  return (
    <RoutineBlockCard
      block={block}
      busy={busy}
      onToggleDone={onToggleDone}
      onDelete={onDelete}
    />
  );
}

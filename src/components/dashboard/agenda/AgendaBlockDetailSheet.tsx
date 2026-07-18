"use client";

import { useEffect, useId, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import { getAgendaCategory } from "@/data/agenda/categories";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { TimelineBlock } from "@/types/agenda";
import type { DashboardModel } from "@/types/dashboard";

type AgendaBlockDetailSheetProps = {
  block: TimelineBlock | null;
  model: DashboardModel;
  prefBusy?: boolean;
  busy?: boolean;
  onClose: () => void;
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
  return <Icon s={16} style={{ color }} />;
}

export default function AgendaBlockDetailSheet({
  block,
  model,
  prefBusy = false,
  busy = false,
  onClose,
  onCompletionChange,
  onScheduledTimeChange,
  onToggleDone,
  onDelete,
}: AgendaBlockDetailSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!block) {
      return;
    }

    clarityTag("agenda_block", "detail_open");

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      clarityTag("agenda_block", "detail_close");
    };
  }, [block, onClose]);

  if (!block) {
    return null;
  }

  const isAnalysis = block.kind === "analysis" && block.slot;
  const category = getAgendaCategory(block.categoryId);

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit details"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-[#ebe7e2] bg-[#fcfbfa] shadow-2xl outline-none md:bottom-auto md:left-auto md:top-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ebe7e2] px-4 py-4 md:px-6">
          <h2
            id={titleId}
            className="m-0 text-[15px] font-semibold text-[#1c1917]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {isAnalysis ? "Stap uit je plan" : block.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#78716c] transition-colors hover:text-[#1c1917]"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 md:px-6">
          {isAnalysis ? (
            <AgendaTodayHero
              model={model}
              slot={block.slot!}
              prefBusy={prefBusy}
              variant="detail"
              actionSurface="agenda_block_detail"
              onCompletionChange={onCompletionChange}
              onScheduledTimeChange={onScheduledTimeChange}
            />
          ) : (
            <article
              className="rounded-[16px] border border-[#ebe7e2] bg-white p-4 shadow-[0_2px_12px_rgba(15,28,16,0.04)]"
              style={{ borderLeftWidth: 3, borderLeftColor: category.color }}
            >
              <div className="mb-3 flex items-center gap-1.5">
                <CategoryIcon iconName={category.icon} color={category.color} />
                <span className="text-[12px] font-medium text-[#78716c]">{category.label}</span>
              </div>

              <h3
                className="m-0 text-[18px] font-medium leading-snug text-[#1c1917] text-pretty"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {block.title}
              </h3>

              <p className="mt-2 text-[14px] tabular-nums text-[#78716c]">
                {block.startTime} – {block.endTime}
              </p>

              {block.isEditable ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const nextDone = !block.done;
                        onToggleDone?.(block.id, nextDone);
                        trackEvent("agenda_block_toggled", {
                          category_id: block.categoryId,
                          done: nextDone,
                          surface: "agenda_block_detail",
                        });
                        clarityTag("agenda_block", nextDone ? "done" : "undone");
                      }}
                      className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border-none px-3 text-[15px] font-semibold disabled:opacity-60"
                      style={{
                        background: block.done ? "rgba(90, 143, 106, 0.15)" : "var(--sage)",
                        color: "#0f1c10",
                        fontFamily: "var(--f-sans)",
                      }}
                    >
                      {block.done ? (
                        <>
                          <Icons.Check s={16} />
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
                          surface: "agenda_block_detail",
                        });
                        clarityTag("agenda_block", "archived");
                        onClose();
                      }}
                      className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[12px] border border-[#e4e0da] bg-[#faf9f7] px-4 text-[14px] font-medium text-[#78716c] disabled:opacity-60"
                      style={{ fontFamily: "var(--f-sans)" }}
                    >
                      Verberg
                    </button>
                  </div>
                  <p className="mt-2 text-[12px] leading-normal text-[#78716c]">
                    Verborgen momenten kun je terugzetten via Moment.
                  </p>
                </>
              ) : null}
            </article>
          )}
        </div>
      </aside>
    </div>
  );
}

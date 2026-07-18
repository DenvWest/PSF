"use client";

import * as Icons from "@/components/app/icons";
import { KompasLooseCard } from "@/components/dashboard/agenda/KompasLooseCard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel } from "@/types/dashboard";

type AgendaTeaserProps = {
  model: DashboardModel;
  onOpenAgenda: () => void;
};

export default function AgendaTeaser({ model, onOpenAgenda }: AgendaTeaserProps) {
  const title = model.activeHabit?.title ?? model.priority.quickWin.title;

  return (
    <KompasLooseCard>
      <button
        type="button"
        onClick={() => {
          trackEvent("dashboard_agenda_teaser_click", {
            priority: model.priority.id,
          });
          clarityTag("dashboard_agenda", "kompas_teaser");
          onOpenAgenda();
        }}
        className="flex w-full cursor-pointer items-start gap-3 border-none bg-transparent p-0 text-left"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#ebe7e2] bg-[#faf9f7] text-[#78716c]"
          aria-hidden
        >
          <Icons.RouteMap s={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[15px] font-medium leading-snug text-[#1c1917]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            Jouw stap vandaag
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#78716c] text-pretty">
            {title}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[13px] font-semibold"
          style={{ color: "var(--sage)" }}
        >
          Agenda
          <Icons.ArrowRight s={15} />
        </span>
      </button>
    </KompasLooseCard>
  );
}

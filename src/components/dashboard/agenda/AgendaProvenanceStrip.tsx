"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

type AgendaProvenanceStripProps = {
  model: DashboardModel;
  slot: WeekDaySlot;
};

function FlowStep({
  label,
  domainLabel,
  color,
  muted = false,
}: {
  label: string;
  domainLabel: string;
  color: string;
  muted?: boolean;
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${muted ? "opacity-70" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a8a29e]">
        {label}
      </span>
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="truncate text-[12px] font-medium text-[#1c1917]">{domainLabel}</span>
    </span>
  );
}

export default function AgendaProvenanceStrip({ model, slot }: AgendaProvenanceStripProps) {
  const planHref = model.activeHabit?.planHref;
  const agendaLabel = slot.isToday ? "Vandaag" : slot.dayLabel;

  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-1 pt-5">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <FlowStep
          label="Kompas"
          domainLabel={model.enginePriority.label}
          color={model.enginePriority.color}
        />
        <span className="text-[#d6d3d1]" aria-hidden>
          →
        </span>
        <FlowStep
          label={model.priorityIsUserChosen ? "Jij" : "Plan"}
          domainLabel={model.priority.label}
          color={model.priority.color}
        />
        <span className="text-[#d6d3d1]" aria-hidden>
          →
        </span>
        <FlowStep label="Agenda" domainLabel={agendaLabel} color={model.priority.color} />
      </div>
      {planHref ? (
        <Link
          href={planHref}
          className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[12px] font-medium no-underline"
          style={{ color: "var(--sage)" }}
        >
          Plan
          <Icons.ArrowRight s={12} />
        </Link>
      ) : null}
    </div>
  );
}

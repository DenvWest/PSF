"use client";

import { useEffect } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import type { MovementWeekRoadmapModel } from "@/lib/movement-week-roadmap";
import type { WeekCategory } from "@/lib/movement-week-categories";

type MovementWeekRoadmapProps = {
  roadmap: MovementWeekRoadmapModel;
  readOnly?: boolean;
  onSpoorSelect: (category: WeekCategory) => void;
  onOndersteuningSelect: () => void;
  onTodaySelect?: () => void;
};

function StatusDot({
  status,
}: {
  status: MovementWeekRoadmapModel["spoorRows"][number]["status"];
}) {
  if (status === "na") {
    return null;
  }
  const tone =
    status === "done"
      ? "bg-intake-sage"
      : status === "partial"
        ? "bg-intake-terra/80"
        : "bg-intake-ink-subtle/40";
  return (
    <span
      className={`ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${tone}`}
      aria-hidden
    />
  );
}

function RoadmapRow({
  title,
  subtitle,
  status,
  readOnly = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  status?: MovementWeekRoadmapModel["spoorRows"][number]["status"];
  readOnly?: boolean;
  onClick: () => void;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center">
          <span className="text-sm font-semibold text-intake-ink">{title}</span>
          {status ? <StatusDot status={status} /> : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-intake-ink-subtle">{subtitle}</p>
      </div>
      {!readOnly ? (
        <Icons.ChevronRight
          s={18}
          style={{ color: "var(--intake-ink-subtle, #78716c)" }}
        />
      ) : null}
    </>
  );

  if (readOnly) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl border border-intake-card-border bg-intake-bg/60 px-4 py-3.5">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-intake-card-border bg-intake-bg px-4 py-3.5 text-left transition-colors hover:border-intake-sage/35 hover:bg-intake-sage/5"
    >
      {content}
    </button>
  );
}

export default function MovementWeekRoadmap({
  roadmap,
  readOnly = false,
  onSpoorSelect,
  onOndersteuningSelect,
  onTodaySelect,
}: MovementWeekRoadmapProps) {
  useEffect(() => {
    clarityTag("plan_surface", "week_roadmap");
  }, []);

  return (
    <section aria-labelledby="movement-week-roadmap-heading" className="space-y-3">
      <div>
        <h3 id="movement-week-roadmap-heading" className="text-sm font-semibold text-intake-ink">
          Deze week
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-intake-ink-subtle">
          {roadmap.trackLine}
        </p>
        <p className="mt-2 text-xs font-medium text-intake-ink-muted">
          {roadmap.progressLabel}
        </p>
      </div>

      {roadmap.todayLine ? (
        <RoadmapRow
          title="Vandaag"
          subtitle={roadmap.todayLine}
          readOnly={readOnly}
          onClick={() => onTodaySelect?.()}
        />
      ) : null}

      <nav aria-label="Bewegingssporen deze week" className="space-y-2">
        {roadmap.spoorRows.map((row) => (
          <RoadmapRow
            key={row.id}
            title={row.label}
            subtitle={row.subtitle}
            status={row.status}
            readOnly={readOnly}
            onClick={() => onSpoorSelect(row.id)}
          />
        ))}
      </nav>

      <RoadmapRow
        title="Voeding & supplementen"
        subtitle="Eerst tafel, dan potje — alleen waar nodig"
        readOnly={readOnly}
        onClick={onOndersteuningSelect}
      />
    </section>
  );
}

"use client";

import { useEffect } from "react";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import type { MovementWeekRoadmapModel } from "@/lib/movement-week-roadmap";
import type { WeekCategory } from "@/lib/movement-week-categories";

type PanelVariant = "intake" | "cockpit";

type MovementWeekRoadmapProps = {
  roadmap: MovementWeekRoadmapModel;
  readOnly?: boolean;
  variant?: PanelVariant;
  onSpoorSelect: (category: WeekCategory) => void;
  onOndersteuningSelect: () => void;
  onTodaySelect?: () => void;
};

function roadmapStyles(variant: PanelVariant) {
  if (variant === "cockpit") {
    return {
      heading: "text-sm font-semibold text-[#E7EDE8]",
      subtitle: "mt-1 text-xs leading-relaxed text-[#9FB0A6]",
      progress: "mt-2 text-xs font-medium text-[#7E8C82]",
      rowTitle: "text-sm font-semibold text-[#E7EDE8]",
      rowSubtitle: "mt-0.5 text-xs leading-relaxed text-[#9FB0A6]",
      rowReadOnly:
        "flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5",
      rowButton:
        "flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-left transition-colors hover:border-[color:var(--ac)]/35 hover:bg-[color:var(--ac)]/5",
      chevronColor: "#9FB0A6",
      dotDone: "bg-[color:var(--ac)]",
      dotPartial: "bg-[color:var(--ac)]/60",
      dotTodo: "bg-white/25",
    };
  }

  return {
    heading: "text-sm font-semibold text-intake-ink",
    subtitle: "mt-1 text-xs leading-relaxed text-intake-ink-subtle",
    progress: "mt-2 text-xs font-medium text-intake-ink-muted",
    rowTitle: "text-sm font-semibold text-intake-ink",
    rowSubtitle: "mt-0.5 text-xs leading-relaxed text-intake-ink-subtle",
    rowReadOnly:
      "flex w-full items-center gap-3 rounded-2xl border border-intake-card-border bg-intake-bg/60 px-4 py-3.5",
    rowButton:
      "flex w-full items-center gap-3 rounded-2xl border border-intake-card-border bg-intake-bg px-4 py-3.5 text-left transition-colors hover:border-intake-sage/35 hover:bg-intake-sage/5",
    chevronColor: "var(--intake-ink-subtle, #78716c)",
    dotDone: "bg-intake-sage",
    dotPartial: "bg-intake-terra/80",
    dotTodo: "bg-intake-ink-subtle/40",
  };
}

function StatusDot({
  status,
  variant,
}: {
  status: MovementWeekRoadmapModel["spoorRows"][number]["status"];
  variant: PanelVariant;
}) {
  if (status === "na") {
    return null;
  }
  const styles = roadmapStyles(variant);
  const tone =
    status === "done"
      ? styles.dotDone
      : status === "partial"
        ? styles.dotPartial
        : styles.dotTodo;
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
  variant,
  onClick,
}: {
  title: string;
  subtitle: string;
  status?: MovementWeekRoadmapModel["spoorRows"][number]["status"];
  readOnly?: boolean;
  variant: PanelVariant;
  onClick: () => void;
}) {
  const styles = roadmapStyles(variant);
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center">
          <span className={styles.rowTitle}>{title}</span>
          {status ? <StatusDot status={status} variant={variant} /> : null}
        </div>
        <p className={styles.rowSubtitle}>{subtitle}</p>
      </div>
      {!readOnly ? (
        <Icons.ChevronRight s={18} style={{ color: styles.chevronColor }} />
      ) : null}
    </>
  );

  if (readOnly) {
    return <div className={styles.rowReadOnly}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={styles.rowButton}>
      {content}
    </button>
  );
}

export default function MovementWeekRoadmap({
  roadmap,
  readOnly = false,
  variant = "intake",
  onSpoorSelect,
  onOndersteuningSelect,
  onTodaySelect,
}: MovementWeekRoadmapProps) {
  const styles = roadmapStyles(variant);

  useEffect(() => {
    clarityTag("plan_surface", "week_roadmap");
  }, []);

  return (
    <section aria-labelledby="movement-week-roadmap-heading" className="space-y-3">
      <div>
        <h3 id="movement-week-roadmap-heading" className={styles.heading}>
          Deze week
        </h3>
        <p className={styles.subtitle}>{roadmap.trackLine}</p>
        <p className={styles.progress}>{roadmap.progressLabel}</p>
      </div>

      {roadmap.todayLine ? (
        <RoadmapRow
          title="Vandaag"
          subtitle={roadmap.todayLine}
          readOnly={readOnly}
          variant={variant}
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
            variant={variant}
            onClick={() => onSpoorSelect(row.id)}
          />
        ))}
      </nav>

      <RoadmapRow
        title="Voeding & supplementen"
        subtitle="Eerst tafel, dan potje — alleen waar nodig"
        readOnly={readOnly}
        variant={variant}
        onClick={onOndersteuningSelect}
      />
    </section>
  );
}

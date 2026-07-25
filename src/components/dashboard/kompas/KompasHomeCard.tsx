"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasVandaagPanel, {
  KompasLogboekSection,
} from "@/components/dashboard/kompas/KompasVandaagPanel";
import { buildWeekSchedulePreview, isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { supportsKompasDeepView } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import { isUsableFirstName } from "@/lib/intake-greetings";
import {
  buildKompasDomainRows,
  buildKompasMilestone,
  KOMPAS_LINES_EXPLAINER,
  type KompasDomainRow,
} from "@/lib/kompas-home";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getNextVitalityBand, getVitalityBand } from "@/lib/vitality-gauge";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const RING_SIZE = 240;
const RING_CENTER = RING_SIZE / 2;
const RING_STROKE = 9;
const RING_RADII = [92, 76, 60, 44, 28];

type WeekPayload = {
  today: string;
  dates: string[];
  completedKeys: string[];
};

type KompasHomeCardProps = {
  model: DashboardModel;
  firstName?: string | null;
  remeasureDue?: boolean;
  nutritionLogCompleted?: boolean;
  hasNutritionIntake?: boolean;
  onOpenDomain: (domain: PillarId) => void;
  onOpenPriority?: (domain: PillarId) => void;
  onGoVoortgang: () => void;
  onGoAgenda: () => void;
  onRemeasure?: () => void;
};

function ringMetrics(score: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const progress = (clamped / 100) * circumference;
  return { circumference, progress };
}

function getStatusHeading(vitality: number, firstName?: string | null): string {
  const band = getVitalityBand(vitality);
  let phrase: string;
  switch (band.id) {
    case "optimaal":
    case "sterk":
      phrase = "Je bent sterk onderweg.";
      break;
    case "goed":
      phrase = "Je bent goed onderweg.";
      break;
    default:
      phrase = "Je bent op gang.";
  }

  if (isUsableFirstName(firstName)) {
    const lower = phrase.charAt(0).toLowerCase() + phrase.slice(1);
    return `${firstName!.trim()}, ${lower}`;
  }
  return phrase;
}

function formatTrendLabel(delta: number | null, note: string | null): string {
  if (note?.trim()) {
    return note.trim();
  }
  if (delta == null || delta === 0) {
    return "Stabiel sinds je laatste meting.";
  }
  const arrow = delta > 0 ? "↑" : "↓";
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return `${arrow} ${signed} sinds je laatste meting.`;
}

function buildDomainTags(model: DashboardModel): Map<PillarId, string> {
  const rows = buildKompasDomainRows(model);
  const others = rows.filter((row) => !row.isPriority);
  const weakest = [...others].sort((a, b) => a.score - b.score)[0];
  const strongest = [...others].sort((a, b) => b.score - a.score)[0];
  const tags = new Map<PillarId, string>();

  if (weakest && weakest.id !== strongest?.id) {
    tags.set(weakest.id, "Aandacht");
  }
  if (strongest) {
    tags.set(strongest.id, "Sterk");
  }

  return tags;
}

function KompasRings({
  rows,
  vitality,
}: {
  rows: KompasDomainRow[];
  vitality: number;
}) {
  const band = getVitalityBand(vitality);

  return (
    <span className="relative block h-[200px] w-[200px] shrink-0 lg:h-[176px] lg:w-[176px]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[10%] rounded-full opacity-70 blur-lg"
        style={{
          background: "radial-gradient(closest-side, rgba(90,143,106,0.5), transparent 72%)",
        }}
      />
      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="relative h-full w-full"
        role="img"
        aria-label={`Leefstijl: ${Math.round(vitality)} van de 100 (${band.label}), samengesteld uit slaap, beweging, voeding, stress en verbinding`}
      >
        {rows.map((row, index) => {
          const radius = RING_RADII[index] ?? RING_RADII[RING_RADII.length - 1]!;
          const { circumference, progress } = ringMetrics(row.score, radius);
          const strokeWidth = row.isPriority ? RING_STROKE + 2 : RING_STROKE;

          return (
            <g key={row.id} aria-hidden>
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={radius}
                fill="none"
                stroke={row.color}
                strokeWidth={strokeWidth}
                opacity={0.12}
              />
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={radius}
                fill="none"
                stroke={row.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${circumference}`}
                transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
              />
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER - radius}
                r={2.5}
                fill="#F1EFE8"
                opacity={0.55}
              />
            </g>
          );
        })}

        <text
          x={RING_CENTER}
          y={RING_CENTER - 5}
          textAnchor="middle"
          fill="#F1EFE8"
          fontSize="34"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {Math.round(vitality)}
        </text>
        <text
          x={RING_CENTER}
          y={RING_CENTER + 13}
          textAnchor="middle"
          fill="#7E8C82"
          fontSize="9"
          letterSpacing="2.4"
        >
          LEEFSTIJL
        </text>
      </svg>
    </span>
  );
}

function RingTrendChip({ model }: { model: DashboardModel }) {
  const band = getVitalityBand(model.vitality);
  const label = formatTrendLabel(model.vitalityDelta, model.vitalityDeltaNote);

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11.5px] font-semibold"
      style={{
        color: band.color,
        borderColor: `${band.color}55`,
        background: `${band.color}1a`,
        fontFamily: "var(--f-sans)",
      }}
    >
      {label}
    </span>
  );
}

function DomainMeterBar({
  row,
  tag,
  isFocus,
  onOpenDomain,
}: {
  row: KompasDomainRow;
  tag?: string;
  isFocus: boolean;
  onOpenDomain: (domain: PillarId) => void;
}) {
  const fillWidth = Math.min(100, Math.max(0, row.score));

  return (
    <button
      type="button"
      onClick={() => onOpenDomain(row.id)}
      aria-label={`Open ${row.label}`}
      className={`w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition ${
        isFocus
          ? "border-[color:var(--ac)]/40 bg-[color:var(--ac)]/[0.08]"
          : "border-white/8 bg-black/15 hover:border-white/14 hover:bg-white/[0.03]"
      }`}
      style={
        {
          "--ac": row.color,
          fontFamily: "var(--f-sans)",
          ...(isFocus ? { boxShadow: `inset 3px 0 0 ${row.color}` } : {}),
        } as CSSProperties
      }
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: row.color }}
        />
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="shrink-0 font-serif text-[15px] text-[#F1EFE8]">{row.label}</span>
          <span className="hidden truncate text-[11.5px] text-[#7E8C82] sm:inline">
            {row.descriptor}
          </span>
        </span>
        {isFocus ? (
          <span
            className="shrink-0 rounded-md border px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: row.color, borderColor: `${row.color}66` }}
          >
            Focus
          </span>
        ) : tag ? (
          <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
            {tag}
          </span>
        ) : null}
        <span className="shrink-0 font-serif text-[17px] tabular-nums text-[#F1EFE8]">
          {row.score}
        </span>
        <DeltaBadge delta={row.delta} empty={row.delta == null} />
      </span>
      <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${fillWidth}%`,
            background: `linear-gradient(90deg, ${row.color}c4, ${row.color})`,
          }}
        />
      </span>
    </button>
  );
}

function LeefstijlHeader({
  model,
  firstName,
}: {
  model: DashboardModel;
  firstName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const trackedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const statusHeading = getStatusHeading(model.vitality, firstName);
  const trendLine = formatTrendLabel(model.vitalityDelta, model.vitalityDeltaNote);

  const handleToggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next && !trackedRef.current) {
        trackedRef.current = true;
        trackEvent("dashboard_kompas_lines_info_expand", { surface: "kompas_home" });
        clarityTag("dashboard_kompas_home", "lines_info");
      }
      return next;
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Hoe werkt je leefstijlscore?"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={handleToggle}
          className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
            open
              ? "border-[#5A8F6A]/40 bg-[#5A8F6A]/10 text-[#CDD7D0]"
              : "border-white/10 bg-black/20 text-[#7E8C82] hover:border-white/20 hover:text-[#CDD7D0]"
          }`}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          <span aria-hidden className="mt-px font-serif text-[14px] leading-none">
            !
          </span>
        </button>
        <h2
          className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8] text-pretty sm:text-[20px]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je leefstijl in vijf domeinen
        </h2>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="Hoe werkt je leefstijlscore?"
          className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(340px,calc(100vw-2.5rem))] space-y-3 rounded-xl border border-white/10 bg-[#101a1b] px-3.5 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        >
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
              Waar je nu staat
            </p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#F1EFE8] text-pretty">
              {statusHeading}
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
              {trendLine}
            </p>
          </div>
          <div className="border-t border-white/8 pt-3">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
              Hoe je dit leest
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
              {KOMPAS_LINES_EXPLAINER}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FocusVoortgangPanel({
  model,
  onOpenPriority,
}: {
  model: DashboardModel;
  onOpenPriority: (domain: PillarId) => void;
}) {
  const priorityRow = buildKompasDomainRows(model).find((row) => row.isPriority);

  if (!priorityRow) {
    return null;
  }

  const score = Math.round(priorityRow.score);
  const delta = priorityRow.delta;
  const band = getVitalityBand(score);
  const nextBand = getNextVitalityBand(score);
  const target = nextBand ? nextBand.min : 100;
  const baseline = delta != null ? Math.min(100, Math.max(0, score - delta)) : null;
  const hasStappenplan = supportsKompasDeepView(priorityRow.id);
  const linkLabel = hasStappenplan ? "Stappenplan" : `Open ${priorityRow.label.toLowerCase()}`;

  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id] ?? 0,
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const painLine = explainer[1] ?? null;

  const handleClick = () => {
    clarityTag("dashboard_kompas_home", `focus_${priorityRow.id}`);
    onOpenPriority(priorityRow.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full cursor-pointer rounded-xl border border-white/8 bg-black/15 px-3.5 py-3.5 text-left transition hover:border-white/14 hover:bg-white/[0.03]"
      style={{ fontFamily: "var(--f-sans)" }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Focus: {priorityRow.label}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              className="font-serif text-[34px] leading-none tabular-nums text-[#F1EFE8]"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              {score}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: band.color,
                borderColor: `${band.color}55`,
                background: `${band.color}1a`,
              }}
            >
              {band.label}
            </span>
          </p>
        </div>
        {delta != null && delta !== 0 ? (
          <span
            className="mb-0.5 inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums"
            style={{ color: delta > 0 ? "#5FA872" : "#C8956C" }}
          >
            {delta > 0 ? <Icons.TrendUp s={14} /> : <Icons.ArrowDown s={14} />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        ) : null}
      </div>

      <div className="mt-3.5">
        <div className="relative h-2 rounded-full bg-white/[0.08]">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${band.color}, #5FA872)`,
            }}
          />
          {baseline != null ? (
            <span
              aria-hidden
              className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
              style={{ left: `${baseline}%` }}
              title="Waar je begon"
            />
          ) : null}
          <span
            aria-hidden
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5FA872] bg-[#0f1c10]"
            style={{ left: `${target}%` }}
            title="Doel"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#9FB0A6]">
          <span>{baseline != null ? `Start ${baseline}` : "Je startpunt"}</span>
          <span className="font-medium text-[#CDD7D0]">
            {nextBand ? `Doel ${target} · ${nextBand.label}` : "Behoud je niveau"}
          </span>
        </div>
      </div>

      {painLine ? (
        <div className="mt-3.5 flex items-start gap-2 border-t border-white/8 pt-3">
          <span
            aria-hidden
            className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: priorityRow.color }}
          />
          <p className="m-0 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
            {painLine}
          </p>
        </div>
      ) : null}

      <span
        className="mt-3.5 flex items-center gap-1.5 border-t border-white/8 pt-3 text-[13px] font-semibold"
        style={{ color: priorityRow.color }}
      >
        {linkLabel}
        <Icons.ArrowRight s={14} />
      </span>
    </button>
  );
}

function VoortgangSection({
  model,
  remeasureDue,
  onRemeasure,
  onOpenPriority,
}: {
  model: DashboardModel;
  remeasureDue: boolean;
  onRemeasure?: () => void;
  onOpenPriority: (domain: PillarId) => void;
}) {
  const reminderShownRef = useRef(false);
  const [weekState, setWeekState] = useState<WeekPayload | null>(null);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/daily-log?range=7", {
          credentials: "include",
        });
        if (cancelled) {
          return;
        }
        if (response.ok) {
          const payload = (await response.json()) as WeekPayload;
          setWeekState(payload);
        }
      } catch {
        /* non-blocking read */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [model]);

  useEffect(() => {
    if (!remeasureDue || reminderShownRef.current) {
      return;
    }
    reminderShownRef.current = true;
    trackEvent("dashboard_hermeting_reminder_shown", { surface: "kompas_home" });
  }, [remeasureDue]);

  const completedSet = useMemo(
    () => new Set(weekState?.completedKeys ?? []),
    [weekState?.completedKeys],
  );

  const completedCount = slots.filter((slot) =>
    isWeekSlotCompleted(slot, completedSet),
  ).length;

  const milestone = buildKompasMilestone(model, completedCount, remeasureDue);

  const handleRemeasureClick = () => {
    trackEvent("dashboard_hermeting_reminder_click", { surface: "kompas_home" });
    clarityTag("dashboard_hermeting", "kompas_voortgang");
    onRemeasure?.();
  };

  return (
    <div>
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
        Voortgang
      </p>

      <div className="mt-3">
        <FocusVoortgangPanel model={model} onOpenPriority={onOpenPriority} />
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-black/15 px-3.5 py-3">
        <p className="m-0 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {milestone.line}
        </p>
        {milestone.kind === "hermeting" && milestone.ctaLabel && onRemeasure ? (
          <button
            type="button"
            onClick={handleRemeasureClick}
            className="mt-2.5 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#5A8F6A] px-3.5 py-2 text-[13px] font-semibold text-[#0f1c10]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {milestone.ctaLabel}
            <Icons.ArrowRight s={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function KompasHomeCard({
  model,
  firstName,
  remeasureDue = false,
  nutritionLogCompleted = false,
  hasNutritionIntake = false,
  onOpenDomain,
  onOpenPriority,
  onGoVoortgang,
  onGoAgenda,
  onRemeasure,
}: KompasHomeCardProps) {
  const rows = useMemo(() => buildKompasDomainRows(model), [model]);
  const domainTags = useMemo(() => buildDomainTags(model), [model]);

  const handleOpenDomain = (domain: PillarId) => {
    clarityTag("dashboard_kompas_home", `ring_row_${domain}`);
    onOpenDomain(domain);
  };

  const handleOpenPriority = onOpenPriority ?? onOpenDomain;

  return (
    <CockpitTile className="p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <section aria-label="Je leefstijl" className="order-1 min-w-0">
          <LeefstijlHeader model={model} firstName={firstName} />

          <div className="mt-4 flex flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <KompasRings rows={rows} vitality={model.vitality} />
              <RingTrendChip model={model} />
            </div>
            <div className="flex w-full min-w-0 flex-1 flex-col gap-2 lg:max-w-[400px]">
              {rows.map((row) => (
                <DomainMeterBar
                  key={row.id}
                  row={row}
                  tag={domainTags.get(row.id)}
                  isFocus={row.isPriority}
                  onOpenDomain={handleOpenDomain}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="Vandaag"
          className="order-2 min-w-0 border-t border-white/10 pt-5 lg:col-start-2 lg:row-span-2 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <KompasVandaagPanel
            model={model}
            nutritionLogCompleted={nutritionLogCompleted}
            hasNutritionIntake={hasNutritionIntake}
            onOpenDomain={handleOpenDomain}
            onGoAgenda={onGoAgenda}
          />
          <div className="mt-4 hidden lg:block">
            <KompasLogboekSection model={model} onGoVoortgang={onGoVoortgang} />
          </div>
        </section>

        <section
          aria-label="Voortgang"
          className="order-3 min-w-0 border-t border-white/10 pt-5 lg:col-start-1 lg:row-start-2"
        >
          <VoortgangSection
            model={model}
            remeasureDue={remeasureDue}
            onRemeasure={onRemeasure}
            onOpenPriority={handleOpenPriority}
          />
        </section>

        <section
          aria-label="Logboek"
          className="order-4 min-w-0 border-t border-white/10 pt-5 lg:hidden"
        >
          <KompasLogboekSection model={model} onGoVoortgang={onGoVoortgang} />
        </section>
      </div>
    </CockpitTile>
  );
}

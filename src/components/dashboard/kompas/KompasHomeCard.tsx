"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasVandaagPanel, {
  KompasLogboekSection,
} from "@/components/dashboard/kompas/KompasVandaagPanel";
import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview, isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { supportsKompasDeepView } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import { isUsableFirstName } from "@/lib/intake-greetings";
import {
  buildKompasDomainRows,
  buildKompasMilestone,
  KOMPAS_LINES_EXPLAINER,
  KOMPAS_PILLAR_DESCRIPTORS,
  type KompasDomainRow,
} from "@/lib/kompas-home";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getNextVitalityBand, getVitalityBand } from "@/lib/vitality-gauge";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const RING_SIZE = 240;
const RING_CENTER = RING_SIZE / 2;
const RING_STROKE = 7;
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

function DomainSparkline({ trend, color }: { trend: number[]; color: string }) {
  if (trend.length < 2) {
    return (
      <span className="hidden h-[13px] w-9 shrink-0 items-center justify-center min-[381px]:flex">
        <span className="h-px w-full border-t border-dashed border-white/20" aria-hidden />
        <span className="sr-only">Nog geen lijn</span>
      </span>
    );
  }

  return (
    <span className="hidden h-[13px] w-9 shrink-0 opacity-80 min-[381px]:block">
      <Sparkline data={trend} w={36} h={13} color={color} />
    </span>
  );
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
    <span className="relative block h-[128px] w-[128px] shrink-0 sm:h-[140px] sm:w-[140px] lg:h-[152px] lg:w-[152px]">
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
          y={RING_CENTER - 4}
          textAnchor="middle"
          fill="#F1EFE8"
          fontSize="30"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {Math.round(vitality)}
        </text>
        <text
          x={RING_CENTER}
          y={RING_CENTER + 12}
          textAnchor="middle"
          fill="#7E8C82"
          fontSize="8.5"
          letterSpacing="2.2"
        >
          LEEFSTIJL
        </text>
      </svg>
    </span>
  );
}

function DomainLineRow({
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
  return (
    <button
      type="button"
      onClick={() => onOpenDomain(row.id)}
      aria-label={`Open ${row.label}`}
      className={`flex min-h-[36px] w-full cursor-pointer items-center gap-2 rounded-lg border bg-transparent px-2 py-1.5 text-left transition hover:bg-white/[0.03] ${
        isFocus ? "border-[color:var(--ac)]/35 bg-[color:var(--ac)]/[0.06]" : "border-white/8"
      }`}
      style={
        isFocus
          ? ({ "--ac": row.color, fontFamily: "var(--f-sans)" } as CSSProperties)
          : { fontFamily: "var(--f-sans)" }
      }
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: row.color }}
      />
      <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
        <span className="truncate font-serif text-[13px] text-[#F1EFE8]">{row.label}</span>
        <span className="shrink-0 font-serif text-[14px] tabular-nums text-[#F1EFE8]">
          {row.score}
        </span>
        <DeltaBadge delta={row.delta} empty={row.delta == null} />
        {tag ? (
          <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
            {tag}
          </span>
        ) : null}
      </span>
      <DomainSparkline trend={row.trend} color={row.color} />
      <Icons.ChevronRight s={13} style={{ color: "#7E8C82" }} />
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

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h2
          className="m-0 font-serif text-[19px] leading-snug text-[#F1EFE8] text-pretty sm:text-[21px]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je leefstijl in vijf lijnen
        </h2>
        <button
          type="button"
          aria-label="Hoe werkt je leefstijlscore?"
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
      </div>

      {open ? (
        <div className="mt-3 space-y-3 rounded-xl border border-white/8 bg-black/15 px-3.5 py-3">
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

function FocusBar({
  model,
  onOpenPriority,
}: {
  model: DashboardModel;
  onOpenPriority: (domain: PillarId) => void;
}) {
  const priority = model.priority;
  const descriptor =
    KOMPAS_PILLAR_DESCRIPTORS[priority.id as keyof typeof KOMPAS_PILLAR_DESCRIPTORS] ?? null;
  const hasStappenplan = supportsKompasDeepView(priority.id);
  const linkLabel = hasStappenplan ? "Stappenplan" : `Open ${priority.label.toLowerCase()}`;

  const handleClick = () => {
    clarityTag("dashboard_kompas_home", `focus_${priority.id}`);
    onOpenPriority(priority.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--ac)]/30 bg-[color:var(--ac)]/[0.08] px-3.5 py-3 text-left transition hover:border-[color:var(--ac)]/50 hover:bg-[color:var(--ac)]/[0.12]"
      style={{ "--ac": priority.color, fontFamily: "var(--f-sans)" } as CSSProperties}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--ac)]/40 text-[color:var(--ac)]"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <Icons.Target s={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
          Focus deze week
        </span>
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-serif text-[16px] text-[#F1EFE8]" style={{ fontFamily: "var(--f-serif)" }}>
            {priority.label}
          </span>
          {descriptor ? (
            <span className="text-[12px] text-[#9FB0A6]">{descriptor}</span>
          ) : null}
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[color:var(--ac)]">
        {linkLabel}
        <Icons.ArrowRight s={14} />
      </span>
    </button>
  );
}

function TrajectoryPanel({ model }: { model: DashboardModel }) {
  const vitality = Math.round(model.vitality);
  const delta = model.vitalityDelta;
  const band = getVitalityBand(vitality);
  const nextBand = getNextVitalityBand(vitality);
  const target = nextBand ? nextBand.min : 100;
  const baseline =
    delta != null && model.vitalityDeltaNote == null
      ? Math.min(100, Math.max(0, vitality - delta))
      : null;

  const priorityRow = buildKompasDomainRows(model).find((row) => row.isPriority);
  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id] ?? 0,
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const painLine = explainer[1] ?? null;

  return (
    <div className="rounded-xl border border-white/8 bg-black/15 px-3.5 py-3.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Waar je nu staat
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              className="font-serif text-[34px] leading-none tabular-nums text-[#F1EFE8]"
              style={{ fontFamily: "var(--f-serif)" }}
            >
              {vitality}
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
              width: `${vitality}%`,
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

      {priorityRow && painLine ? (
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
    </div>
  );
}

function VoortgangSection({
  model,
  remeasureDue,
  onGoVoortgang,
  onRemeasure,
}: {
  model: DashboardModel;
  remeasureDue: boolean;
  onGoVoortgang: () => void;
  onRemeasure?: () => void;
}) {
  const reminderShownRef = useRef(false);
  const [weekState, setWeekState] = useState<WeekPayload | null>(null);
  const [streak, setStreak] = useState(0);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);
  const domain = model.priority.id;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [weekResponse, streakResponse] = await Promise.all([
          fetch("/api/account/daily-log?range=7", { credentials: "include" }),
          fetch(`/api/account/daily-log?domain=${encodeURIComponent(domain)}`, {
            credentials: "include",
          }),
        ]);
        if (cancelled) {
          return;
        }
        if (weekResponse.ok) {
          const payload = (await weekResponse.json()) as WeekPayload;
          setWeekState(payload);
        }
        if (streakResponse.ok) {
          const state = (await streakResponse.json()) as { streak: number };
          setStreak(state.streak);
        }
      } catch {
        /* non-blocking read */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [domain, model.priority.id]);

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

  const handleVoortgangClick = () => {
    trackEvent("dashboard_kompas_voortgang_link_click", { surface: "kompas_home" });
    clarityTag("dashboard_kompas_home", "voortgang_link");
    onGoVoortgang();
  };

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
        <TrajectoryPanel model={model} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Streak
          </p>
          <p
            className="mt-1 m-0 font-serif text-[22px] leading-none tabular-nums text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {streak > 0 ? streak : "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-[#9FB0A6]">
            {streak === 1 ? "dag op rij" : "dagen op rij"}
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Deze week
          </p>
          <p className="mt-1 text-[12px] text-[#9FB0A6]">
            {weekState ? `${completedCount} van 7 dagen` : "Je stappen"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5" aria-hidden>
            {slots.map((slot) => {
              const pillar = PILLAR[slot.domain];
              const completed = isWeekSlotCompleted(slot, completedSet);
              return (
                <span
                  key={slot.date}
                  className="h-2.5 w-2.5 rounded-full transition-opacity"
                  style={{
                    background: pillar.color,
                    opacity: completed ? 1 : 0.2,
                    boxShadow: slot.isToday ? `0 0 0 1px ${pillar.color}88` : undefined,
                  }}
                  title={slot.isToday ? "Vandaag" : slot.dayLabel}
                />
              );
            })}
          </div>
        </div>
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

      <button
        type="button"
        onClick={handleVoortgangClick}
        className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[#5A8F6A]"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        Bekijk je voortgang
        <Icons.ArrowRight s={14} />
      </button>
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

          <div className="mt-4 flex items-center gap-4 sm:gap-5">
            <KompasRings rows={rows} vitality={model.vitality} />
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[300px] lg:max-w-[340px]">
              {rows.map((row) => (
                <DomainLineRow
                  key={row.id}
                  row={row}
                  tag={domainTags.get(row.id)}
                  isFocus={row.isPriority}
                  onOpenDomain={handleOpenDomain}
                />
              ))}
            </div>
          </div>

          <FocusBar model={model} onOpenPriority={handleOpenPriority} />
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
            onGoVoortgang={onGoVoortgang}
            onRemeasure={onRemeasure}
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

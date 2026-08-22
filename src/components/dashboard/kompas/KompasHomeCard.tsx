"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { DeltaBadge } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import KompasVoortgangFocusBlock from "@/components/dashboard/kompas/KompasVoortgangFocusBlock";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { buildWeekSchedulePreview, isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import { buildDashboardVoortgangHref } from "@/lib/dashboard-url";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { isUsableFirstName } from "@/lib/intake-greetings";
import {
  buildDomainCheckStates,
  type DomainCheckState,
  type DomainCheckTimings,
} from "@/lib/kompas-domain-check";
import {
  buildKompasDomainRows,
  buildKompasMilestone,
  KOMPAS_LINES_EXPLAINER,
  type KompasCycleContext,
  type KompasDomainRow,
} from "@/lib/kompas-home";
import { getVitalityBand } from "@/lib/vitality-gauge";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

const RING_SIZE = 240;
const RING_CENTER = RING_SIZE / 2;
const RING_STROKE = 9;
const RING_RADII = [104, 87, 70, 53, 36];

type WeekPayload = {
  today: string;
  dates: string[];
  completedKeys: string[];
};

type KompasHomeCardProps = {
  model: DashboardModel;
  firstName?: string | null;
  cycleContext?: KompasCycleContext | null;
  domainCheckDaysAgo?: DomainCheckTimings;
  remeasureDaysUntil?: number | null;
  onOpenDomain: (domain: PillarId) => void;
  onOpenPriority?: (domain: PillarId) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
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
    <span className="relative block h-[208px] w-[208px] shrink-0 @[560px]/leefstijl:h-[236px] @[560px]/leefstijl:w-[236px] @[820px]/leefstijl:h-[280px] @[820px]/leefstijl:w-[280px]">
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

function CheckCountdownRing({
  progress,
  color,
  ready,
  done = false,
}: {
  progress: number;
  color: string;
  ready: boolean;
  done?: boolean;
}) {
  const radius = 6.25;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(1, Math.max(0, progress)) * circumference;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <circle
        cx="8"
        cy="8"
        r={radius}
        fill="none"
        stroke={ready || done ? color : "#FFFFFF"}
        strokeOpacity={ready || done ? 0.35 : 0.14}
        strokeWidth="1.5"
      />
      {done ? (
        <path
          d="M5 8.2 L7.2 10.4 L11.2 5.9"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : ready ? (
        <circle cx="8" cy="8" r="3.25" fill={color} />
      ) : (
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity={0.85}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 8 8)"
        />
      )}
    </svg>
  );
}

function DomainCheckStrip({
  check,
  color,
  domainLabel,
  onCheckClick,
}: {
  check: DomainCheckState;
  color: string;
  domainLabel: string;
  onCheckClick: (check: DomainCheckState) => void;
}) {
  const ready = check.actionable;
  const body = (
    <>
      <CheckCountdownRing
        progress={check.progress}
        color={color}
        ready={ready}
        done={check.status === "fresh"}
      />
      <span
        className={`min-w-0 flex-1 truncate text-[11.5px] ${
          ready ? "text-[#CDD7D0]" : "text-[#7E8C82]"
        }`}
      >
        {check.label}
      </span>
      {check.ctaLabel ? (
        check.highlighted ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-[#0f1c10]"
            style={{ background: color }}
          >
            {check.ctaLabel}
            <Icons.ArrowRight s={12} />
          </span>
        ) : (
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold"
            style={{ color }}
          >
            Doe de check
            <Icons.ArrowRight s={12} />
          </span>
        )
      ) : null}
    </>
  );

  const sharedClass =
    "flex min-h-[36px] w-full items-center gap-2 border-t px-3 py-1.5 text-left";

  if (!ready || !check.href) {
    return (
      <div
        className={`${sharedClass} border-white/8`}
        style={{ fontFamily: "var(--f-sans)" }}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={check.href}
      aria-label={`${check.ctaLabel} — ${domainLabel}`}
      onClick={() => onCheckClick(check)}
      className={`${sharedClass} cursor-pointer border-white/8 no-underline transition hover:bg-white/[0.05]`}
      style={{
        fontFamily: "var(--f-sans)",
        color: "inherit",
        ...(check.highlighted ? { background: `${color}14` } : {}),
      }}
    >
      {body}
    </Link>
  );
}

/**
 * Compacte variant van de check-strip: één kolom rechts in de balk in plaats van
 * een eigen rij. Alleen de uitgelichte check houdt de volledige strip, zodat er
 * per scherm precies één check-CTA staat.
 */
function DomainCheckChip({
  check,
  color,
  domainLabel,
  onCheckClick,
}: {
  check: DomainCheckState;
  color: string;
  domainLabel: string;
  onCheckClick: (check: DomainCheckState) => void;
}) {
  const ready = check.actionable;
  const countdown =
    check.status === "counting" && check.daysUntil != null ? `${check.daysUntil}d` : null;

  const body = (
    <>
      <CheckCountdownRing
        progress={check.progress}
        color={color}
        ready={ready}
        done={check.status === "fresh"}
      />
      {ready ? (
        <span className="text-[11.5px] font-semibold" style={{ color }}>
          Check
        </span>
      ) : countdown ? (
        <span className="text-[11.5px] tabular-nums text-[#7E8C82]">{countdown}</span>
      ) : null}
    </>
  );

  const sharedClass = "flex shrink-0 items-center gap-1.5 self-stretch border-l px-2.5";

  if (!ready || !check.href) {
    return (
      <span
        title={check.label}
        className={`${sharedClass} border-white/8`}
        style={{ fontFamily: "var(--f-sans)" }}
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={check.href}
      title={check.label}
      aria-label={`${check.ctaLabel} — ${domainLabel}`}
      onClick={() => onCheckClick(check)}
      className={`${sharedClass} cursor-pointer border-white/8 no-underline transition hover:bg-white/[0.05]`}
      style={{ fontFamily: "var(--f-sans)", color: "inherit" }}
    >
      {body}
    </Link>
  );
}

function DomainMeterBar({
  row,
  tag,
  isFocus,
  check,
  onOpenDomain,
  onCheckClick,
}: {
  row: KompasDomainRow;
  tag?: string;
  isFocus: boolean;
  check?: DomainCheckState;
  onOpenDomain: (domain: PillarId) => void;
  onCheckClick: (check: DomainCheckState) => void;
}) {
  const fillWidth = Math.min(100, Math.max(0, row.score));
  const baseline =
    row.delta != null && row.delta !== 0
      ? Math.min(100, Math.max(0, row.score - row.delta))
      : null;
  const openLabel =
    check && !check.actionable ? `Open ${row.label} — ${check.label}` : `Open ${row.label}`;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        isFocus
          ? "border-[color:var(--ac)]/40 bg-[color:var(--ac)]/[0.08]"
          : "border-white/8 bg-black/15 hover:border-white/14"
      }`}
      style={
        {
          "--ac": row.color,
          fontFamily: "var(--f-sans)",
          ...(isFocus ? { boxShadow: `inset 3px 0 0 ${row.color}` } : {}),
        } as CSSProperties
      }
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => onOpenDomain(row.id)}
          aria-label={openLabel}
          className="min-w-0 flex-1 cursor-pointer bg-transparent px-3 py-2.5 text-left transition hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: row.color }}
            />
            <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
              <span className="shrink-0 font-serif text-[15px] text-[#F1EFE8]">{row.label}</span>
              <span className="hidden truncate text-[11.5px] text-[#7E8C82] @[740px]/leefstijl:inline">
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
          <span className="relative mt-2 block h-1.5 w-full rounded-full bg-white/[0.08]">
            <span
              className="absolute inset-y-0 left-0 block rounded-full"
              style={{
                width: `${fillWidth}%`,
                background: `linear-gradient(90deg, ${row.color}c4, ${row.color})`,
              }}
            />
            {baseline != null ? (
              <span
                aria-hidden
                title="Waar je begon"
                className="absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45"
                style={{ left: `${baseline}%` }}
              />
            ) : null}
          </span>
        </button>

        {check && !check.highlighted ? (
          <DomainCheckChip
            check={check}
            color={row.color}
            domainLabel={row.label}
            onCheckClick={onCheckClick}
          />
        ) : null}
      </div>

      {check?.highlighted ? (
        <DomainCheckStrip
          check={check}
          color={row.color}
          domainLabel={row.label}
          onCheckClick={onCheckClick}
        />
      ) : null}
    </div>
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

function VoortgangSection({
  model,
  cycleContext,
  onOpenPriority,
  onPrefUpdated,
}: {
  model: DashboardModel;
  cycleContext?: KompasCycleContext | null;
  onOpenPriority: (domain: PillarId) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
}) {
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

  const completedSet = useMemo(
    () => new Set(weekState?.completedKeys ?? []),
    [weekState?.completedKeys],
  );

  const completedCount = slots.filter((slot) =>
    isWeekSlotCompleted(slot, completedSet),
  ).length;

  const milestone = buildKompasMilestone(model, completedCount, cycleContext);

  return (
    <div>
      <KompasVoortgangFocusBlock
        model={model}
        onPrefUpdated={onPrefUpdated}
        onOpenPriority={onOpenPriority}
        surface="kompas_voortgang"
      />

      <div className="mt-3 rounded-xl border border-white/8 bg-black/15 px-3.5 py-3">
        <p className="m-0 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {milestone.line}
        </p>
      </div>
    </div>
  );
}

export default function KompasHomeCard({
  model,
  firstName,
  cycleContext = null,
  domainCheckDaysAgo,
  remeasureDaysUntil = null,
  onOpenDomain,
  onOpenPriority,
  onPrefUpdated,
}: KompasHomeCardProps) {
  const rows = useMemo(() => buildKompasDomainRows(model), [model]);
  const domainTags = useMemo(() => buildDomainTags(model), [model]);
  const checkStates = useMemo(
    () =>
      buildDomainCheckStates({
        timings: domainCheckDaysAgo ?? {},
        priorityId: model.priority.id,
        remeasureDaysUntil,
      }),
    [domainCheckDaysAgo, model.priority.id, remeasureDaysUntil],
  );
  const highlightedCheck = useMemo(
    () => [...checkStates.values()].find((state) => state.highlighted) ?? null,
    [checkStates],
  );
  const checkShownRef = useRef<PillarId | null>(null);

  useEffect(() => {
    if (!highlightedCheck || checkShownRef.current === highlightedCheck.domain) {
      return;
    }
    checkShownRef.current = highlightedCheck.domain;
    trackEvent("dashboard_kompas_domain_check_shown", {
      surface: "kompas_home",
      domain: highlightedCheck.domain,
      check_status: highlightedCheck.status,
    });
  }, [highlightedCheck]);

  const handleOpenDomain = (domain: PillarId) => {
    clarityTag("dashboard_kompas_home", `ring_row_${domain}`);
    onOpenDomain(domain);
  };

  const handleCheckClick = (check: DomainCheckState) => {
    trackEvent("dashboard_kompas_domain_check_click", {
      surface: "kompas_home",
      domain: check.domain,
      check_status: check.status,
      highlighted: check.highlighted,
    });
    clarityTag("dashboard_kompas_home", `check_${check.domain}_${check.status}`);
    emitAccountClientEvent("dashboard.domain_check_cta_clicked", {
      surface: "kompas_home",
      domain: check.domain,
      status: check.status,
      highlighted: check.highlighted,
    });
  };

  const handleOpenPriority = onOpenPriority ?? onOpenDomain;

  return (
    <CockpitTile className="p-4 sm:p-5 lg:p-6">
      {/*
        Container queries in plaats van viewport-breakpoints: deze tegel staat in
        de midden-zone van de cockpit, die smaller of breder wordt zodra de
        contextkolom open- of dichtklapt. Een `lg:`-splitsing weet daar niets van
        en perste ring + balken samen in een kolom van ~320px.
      */}
      <div className="@container/tile">
        <div className="flex flex-col gap-5 @[720px]/tile:grid @[720px]/tile:grid-cols-[minmax(0,1fr)_minmax(0,320px)] @[720px]/tile:gap-x-6 @[720px]/tile:gap-y-0 @[1200px]/tile:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          {/*
            Twee tegel-standen. Tot @920px staat Je leefstijl over de volle
            breedte met Voortgang eronder; daarboven blijft er naast de ring en
            de balken genoeg over voor een echte kolom, en loopt Voortgang over
            de hele rechterhoogte mee. Mijn keuze stond hier tot 22 augustus
            als derde sectie; die is van héél Kompas af (roadmap §7, R1) en
            leeft nu op Favorieten — met één regel hieronder als terugweg.
          */}
          <section
            aria-label="Je leefstijl"
            className="@container/leefstijl order-1 min-w-0 @[720px]/tile:col-span-2 @[720px]/tile:col-start-1 @[720px]/tile:row-start-1 @[920px]/tile:col-span-1"
          >
            <div className="grid max-w-[1000px] grid-cols-1 gap-4 @[560px]/leefstijl:grid-cols-[minmax(0,260px)_minmax(0,1fr)] @[560px]/leefstijl:gap-x-6 @[820px]/leefstijl:grid-cols-[minmax(0,300px)_minmax(0,1fr)] @[820px]/leefstijl:gap-x-8">
              <div className="min-w-0 @[560px]/leefstijl:col-start-1 @[560px]/leefstijl:row-start-1">
                <LeefstijlHeader model={model} firstName={firstName} />
              </div>

              <div className="flex flex-col items-center gap-3 @[560px]/leefstijl:col-start-1 @[560px]/leefstijl:row-start-2 @[560px]/leefstijl:items-start @[560px]/leefstijl:self-start">
                <KompasRings rows={rows} vitality={model.vitality} />
                <RingTrendChip model={model} />
              </div>

              <div className="flex min-w-0 flex-col gap-2 @[560px]/leefstijl:col-start-2 @[560px]/leefstijl:row-span-2 @[560px]/leefstijl:row-start-1 @[560px]/leefstijl:self-start">
                {rows.map((row) => (
                  <DomainMeterBar
                    key={row.id}
                    row={row}
                    tag={domainTags.get(row.id)}
                    isFocus={row.isPriority}
                    check={checkStates.get(row.id)}
                    onOpenDomain={handleOpenDomain}
                    onCheckClick={handleCheckClick}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            aria-label="Voortgang"
            className="order-2 min-w-0 border-t border-white/10 pt-5 @[720px]/tile:col-span-2 @[720px]/tile:col-start-1 @[720px]/tile:row-start-2 @[720px]/tile:mt-5 @[920px]/tile:col-span-1 @[920px]/tile:col-start-2 @[920px]/tile:row-span-2 @[920px]/tile:row-start-1 @[920px]/tile:mt-0 @[920px]/tile:border-l @[920px]/tile:border-t-0 @[920px]/tile:pl-6 @[920px]/tile:pt-0"
          >
            <VoortgangSection
              model={model}
              cycleContext={cycleContext}
              onOpenPriority={handleOpenPriority}
              onPrefUpdated={onPrefUpdated}
            />
          </section>
        </div>

        <KeuzeArchiefRegel
          onOpenPriorityDomain={() => handleOpenDomain(model.priority.id)}
        />
      </div>
    </CockpitTile>
  );
}

/**
 * Wat je koos, als één regel — niet als tegel.
 *
 * `MijnKeuzeTile` stond hier tot 22 augustus met de volledige lijst erin. Die
 * lijst leeft nu op Favorieten (over alle domeinen) en in de contextkolom (voor
 * de laag die je leest); op de home hoort alleen nog de terugweg, in dezelfde
 * vorm die het ecosysteem-verdict §H voor de Voortgang-hub voorschrijft.
 */
function KeuzeArchiefRegel({
  onOpenPriorityDomain,
}: {
  onOpenPriorityDomain: () => void;
}) {
  const { items } = useVoortgangFavorites();
  const domeinen = new Set(items.map((item) => item.domain).filter(Boolean)).size;

  if (items.length === 0) {
    return (
      <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-[#7E8C82]">
        Nog niets gekozen — open een domein en zet iets op je lijst.
        <button
          type="button"
          onClick={() => {
            clarityTag("dashboard_kompas_home", "keuzes_leeg_open_domein");
            onOpenPriorityDomain();
          }}
          className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[#9CC5A9]"
        >
          Open je prioriteitsdomein <Icons.ChevronRight s={12} />
        </button>
      </p>
    );
  }

  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-[#7E8C82]">
      <span>
        Je koos {items.length} {items.length === 1 ? "handeling" : "handelingen"}
        {domeinen > 1 ? `, over ${domeinen} domeinen` : ""}.
      </span>
      <Link
        href={buildDashboardVoortgangHref("favorieten")}
        onClick={() => {
          trackEvent("dashboard_kompas_keuzes_click", {
            surface: "kompas_home",
            count: items.length,
            domains: domeinen,
          });
          clarityTag("dashboard_kompas_home", "keuzes_naar_favorieten");
        }}
        className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#9CC5A9] no-underline"
      >
        Bekijk je keuzes <Icons.ChevronRight s={12} />
      </Link>
    </p>
  );
}

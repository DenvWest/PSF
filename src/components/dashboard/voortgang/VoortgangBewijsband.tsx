"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type CSSProperties,
} from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildBandCaption,
  buildWachtendCaption,
  CYCLE_LENGTH,
  dayToDate,
  formatIsoShortDate,
  formatShortDate,
  measurementsOf,
  scrubZone,
  type BandMeasurement,
} from "@/lib/voortgang-bewijsband";
import type { DashboardData, PillarId } from "@/types/dashboard";

type VoortgangBewijsbandProps = {
  cycleEvidence: DashboardData["cycleEvidence"];
  remeasure: DashboardData["remeasure"];
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined;
  priorityLabel: string;
  /** Welk domein onder de band open staat — de band markeert dat meetmoment. */
  selectedDomain?: PillarId | null;
  /** Een meting aanklikken opent datzelfde domein in de reeks eronder. */
  onSelectDomain?: (domain: PillarId) => void;
};

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

const VB = { w: 340, h: 112, l: 16, r: 324, axis: 58, lane: 36 } as const;

function xOf(day: number): number {
  return VB.l + (VB.r - VB.l) * ((day - 1) / (CYCLE_LENGTH - 1));
}

/** Positie binnen de HTML-laag die exact over de SVG-viewBox ligt. */
function pctX(day: number): string {
  return `${(xOf(day) / VB.w) * 100}%`;
}

const LANE_PCT = `${(VB.lane / VB.h) * 100}%`;

function iconOf(name: string): IconComp | null {
  return (Icons[name as keyof typeof Icons] as IconComp | undefined) ?? null;
}

/**
 * Het meetmoment zelf: het domein-icoon uit de zijbalk, in zijn eigen kleur.
 * Een render-functie, geen component — het icoon wordt per meting opgezocht,
 * en dat mag niet in een componentlichaam gebeuren (react-hooks/static-components).
 */
function renderMeasurementMarker({
  measurement,
  active,
  onSelect,
}: {
  measurement: BandMeasurement;
  active: boolean;
  onSelect: () => void;
}) {
  const pillar = measurement.pillarId ? PILLAR[measurement.pillarId] : null;
  const color = pillar?.color ?? "#E7EDE8";
  const Icon = iconOf(pillar?.icon ?? "Compass");

  return (
    <button
      key={`${measurement.day}-${measurement.pillarId ?? "check"}`}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${measurement.label} — dag ${measurement.day}`}
      title={measurement.label}
      className="pointer-events-auto absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-0"
      style={{ left: pctX(measurement.day), top: LANE_PCT }}
    >
      <span
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full transition"
        style={{
          background: active ? color : "#132414",
          border: `1.5px solid ${color}`,
          boxShadow: active ? `0 0 0 3px ${color}33` : "none",
          color: active ? "#0E1C10" : color,
        }}
      >
        {Icon ? <Icon s={14} /> : null}
      </span>
    </button>
  );
}

type BandSvgProps = {
  cycleEvidence: NonNullable<DashboardData["cycleEvidence"]>;
  remeasure: NonNullable<DashboardData["remeasure"]>;
  measurements: BandMeasurement[];
  headDay: number;
};

function FullBandSvg({
  cycleEvidence,
  remeasure,
  measurements,
  headDay,
}: BandSvgProps) {
  const today = cycleEvidence.cycleDay;
  const xToday = xOf(today);
  const startDate = formatShortDate(dayToDate(cycleEvidence.cycleStartDate, 1));
  const endDate = formatIsoShortDate(remeasure.dueDateIso);
  const xh = xOf(headDay);

  const ariaLabel = `Tijdband van je cyclus van ${startDate}${
    endDate != null ? ` tot je hermeting op ${endDate}` : " tot je hermeting"
  }. Dag ${today} van nu. ${measurements.length} meetmomenten.`;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      role="img"
      aria-label={ariaLabel}
      className="block h-auto w-full overflow-visible"
    >
      <circle cx={VB.r} cy={VB.axis} r={15} fill="#5A8F6A" opacity={0.1} />

      <line
        x1={VB.l}
        y1={VB.axis}
        x2={xToday}
        y2={VB.axis}
        stroke="rgba(255,255,255,0.30)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={xToday}
        y1={VB.axis}
        x2={VB.r}
        y2={VB.axis}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={1}
        strokeDasharray="1 5"
        strokeLinecap="round"
      />

      {/* Alleen de ophanging staat in de SVG; het meetmoment zelf is een knop. */}
      {measurements.map((m) => {
        const x = xOf(m.day);
        return (
          <line
            key={`${m.day}-${m.pillarId ?? "check"}`}
            x1={x}
            y1={VB.lane + 14}
            x2={x}
            y2={VB.axis - 4}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={1}
          />
        );
      })}

      <circle cx={VB.l} cy={VB.axis} r={4} fill="#5A8F6A" opacity={0.6} />
      <text
        x={VB.l}
        y={94}
        fontSize={9}
        fontWeight={600}
        letterSpacing="0.10em"
        fill="rgba(255,255,255,0.40)"
      >
        START
      </text>
      <text x={VB.l} y={106} fontSize={10.5} fill="rgba(255,255,255,0.60)">
        {startDate}
      </text>

      <circle
        cx={VB.r}
        cy={VB.axis}
        r={5.5}
        fill="none"
        stroke="#5A8F6A"
        strokeWidth={1.5}
      />
      <text
        x={VB.r}
        y={94}
        textAnchor="end"
        fontSize={9}
        fontWeight={600}
        letterSpacing="0.10em"
        fill="rgba(255,255,255,0.40)"
      >
        HERMETING
      </text>
      <text
        x={VB.r}
        y={106}
        textAnchor="end"
        fontSize={10.5}
        fill="#A9C6B2"
      >
        {endDate}
      </text>

      <line
        x1={xToday}
        y1={VB.axis - 10}
        x2={xToday}
        y2={82}
        stroke="#5A8F6A"
        strokeWidth={1}
        opacity={0.5}
      />
      <circle
        cx={xToday}
        cy={VB.axis}
        r={4}
        fill="#5A8F6A"
        stroke="#132414"
        strokeWidth={2}
      />

      <path
        d={`M${xh - 5} 16 L${xh + 5} 16 L${xh} 24 Z`}
        fill="rgba(255,255,255,0.80)"
      />
      <line
        x1={xh}
        y1={24}
        x2={xh}
        y2={84}
        stroke="rgba(255,255,255,0.42)"
        strokeWidth={1}
      />
    </svg>
  );
}

type WachtendBandSvgProps = {
  remeasure: NonNullable<DashboardData["remeasure"]>;
};

function WachtendBandSvg({ remeasure }: WachtendBandSvgProps) {
  const endDate = formatIsoShortDate(remeasure.dueDateIso);
  const ariaLabel =
    endDate != null
      ? `Cyclusband in afwachting. Je hermeting staat op ${endDate}.`
      : "Cyclusband in afwachting. Je hermeting volgt.";

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      role="img"
      aria-label={ariaLabel}
      className="block h-auto w-full overflow-visible"
    >
      <circle cx={VB.r} cy={VB.axis} r={15} fill="#5A8F6A" opacity={0.1} />

      <line
        x1={VB.l}
        y1={VB.axis}
        x2={VB.r}
        y2={VB.axis}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={1}
        strokeDasharray="1 5"
        strokeLinecap="round"
      />

      <circle cx={VB.l} cy={VB.axis} r={4} fill="#5A8F6A" opacity={0.6} />
      <text
        x={VB.l}
        y={94}
        fontSize={9}
        fontWeight={600}
        letterSpacing="0.10em"
        fill="rgba(255,255,255,0.40)"
      >
        START
      </text>

      <circle
        cx={VB.r}
        cy={VB.axis}
        r={5.5}
        fill="none"
        stroke="#5A8F6A"
        strokeWidth={1.5}
      />
      <text
        x={VB.r}
        y={94}
        textAnchor="end"
        fontSize={9}
        fontWeight={600}
        letterSpacing="0.10em"
        fill="rgba(255,255,255,0.40)"
      >
        HERMETING
      </text>
      <text
        x={VB.r}
        y={106}
        textAnchor="end"
        fontSize={10.5}
        fill="#A9C6B2"
      >
        {endDate}
      </text>
    </svg>
  );
}

export default function VoortgangBewijsband({
  cycleEvidence,
  remeasure,
  domainCheckDaysAgo,
  priorityLabel,
  selectedDomain = null,
  onSelectDomain,
}: VoortgangBewijsbandProps) {
  if (!remeasure) {
    return null;
  }

  const isWachtend = cycleEvidence == null;
  const defaultHeadDay = cycleEvidence?.cycleDay ?? 1;

  return (
    <VoortgangBewijsbandInner
      key={cycleEvidence?.cycleDay ?? "wachtend"}
      cycleEvidence={cycleEvidence}
      remeasure={remeasure}
      domainCheckDaysAgo={domainCheckDaysAgo}
      priorityLabel={priorityLabel}
      isWachtend={isWachtend}
      defaultHeadDay={defaultHeadDay}
      selectedDomain={selectedDomain}
      onSelectDomain={onSelectDomain}
    />
  );
}

function VoortgangBewijsbandInner({
  cycleEvidence,
  remeasure,
  domainCheckDaysAgo,
  priorityLabel,
  isWachtend,
  defaultHeadDay,
  selectedDomain,
  onSelectDomain,
}: {
  cycleEvidence: DashboardData["cycleEvidence"];
  remeasure: NonNullable<DashboardData["remeasure"]>;
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined;
  priorityLabel: string;
  isWachtend: boolean;
  defaultHeadDay: number;
  selectedDomain: PillarId | null;
  onSelectDomain?: (domain: PillarId) => void;
}) {
  const [headDay, setHeadDay] = useState(defaultHeadDay);
  const scrubDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubFiredRef = useRef(false);

  const measurements = useMemo(() => {
    if (!cycleEvidence) {
      return [];
    }
    return measurementsOf({
      cycleDayRaw: cycleEvidence.cycleDayRaw,
      domainCheckDaysAgo: domainCheckDaysAgo ?? {},
    });
  }, [cycleEvidence, domainCheckDaysAgo]);

  const caption = useMemo(() => {
    if (isWachtend) {
      return buildWachtendCaption(remeasure.dueDateIso);
    }
    if (!cycleEvidence) {
      return { title: "", body: "" };
    }
    return buildBandCaption({
      cycleStartDate: cycleEvidence.cycleStartDate,
      cycleDay: cycleEvidence.cycleDay,
      remeasureDueDateIso: remeasure.dueDateIso,
      measurements,
      headDay,
      activeDays: cycleEvidence.activeDays,
      priorityLabel,
    });
  }, [
    isWachtend,
    cycleEvidence,
    remeasure.dueDateIso,
    measurements,
    headDay,
    priorityLabel,
  ]);

  const fireScrubEvent = useCallback(
    (day: number) => {
      if (!cycleEvidence || scrubFiredRef.current) {
        return;
      }
      scrubFiredRef.current = true;
      const zone = scrubZone(cycleEvidence.cycleDay, day);
      trackEvent("dashboard_voortgang_band_scrub", { zone });
      clarityTag("dashboard_voortgang", "band_scrub");
      scrubDebounceRef.current = setTimeout(() => {
        scrubFiredRef.current = false;
      }, 1200);
    },
    [cycleEvidence],
  );

  useEffect(() => {
    return () => {
      if (scrubDebounceRef.current) {
        clearTimeout(scrubDebounceRef.current);
      }
    };
  }, []);

  const handleScrubChange = (event: ChangeEvent<HTMLInputElement>) => {
    const day = Number(event.target.value);
    setHeadDay(day);
    fireScrubEvent(day);
  };

  const handleSelectMeasurement = (measurement: BandMeasurement) => {
    setHeadDay(measurement.day);
    trackEvent("dashboard_voortgang_band_meting_click", {
      ...(measurement.pillarId ? { domain: measurement.pillarId } : { domain: "leefstijlcheck" }),
      day: measurement.day,
    });
    clarityTag(
      "dashboard_voortgang",
      `band_meting_${measurement.pillarId ?? "leefstijlcheck"}`,
    );
    if (measurement.pillarId) {
      onSelectDomain?.(measurement.pillarId);
    }
  };

  return (
    <div className="mt-[26px] lg:mt-0 lg:rounded-[20px] lg:border lg:border-white/10 lg:bg-black/22 lg:p-[22px]">
      <h2
        className="mb-2.5 font-serif text-[18px] leading-[1.3]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Je cyclus
      </h2>

      <div className="relative">
        {isWachtend ? (
          <WachtendBandSvg remeasure={remeasure} />
        ) : cycleEvidence ? (
          <FullBandSvg
            cycleEvidence={cycleEvidence}
            remeasure={remeasure}
            measurements={measurements}
            headDay={headDay}
          />
        ) : null}

        {measurements.length > 0 ? (
          <div className="pointer-events-none absolute inset-0">
            {measurements.map((m) =>
              renderMeasurementMarker({
                measurement: m,
                active:
                  m.day === headDay || (m.pillarId != null && m.pillarId === selectedDomain),
                onSelect: () => handleSelectMeasurement(m),
              }),
            )}
          </div>
        ) : null}
      </div>

      <input
        type="range"
        min={1}
        max={CYCLE_LENGTH}
        step={1}
        value={headDay}
        disabled={isWachtend}
        aria-label="Dag in je cyclus"
        aria-valuetext={`dag ${headDay} van je cyclus`}
        onChange={handleScrubChange}
        className="mt-1 h-11 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none disabled:cursor-default disabled:opacity-30 [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[#132414] [&::-moz-range-thumb]:bg-[var(--sage)] [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/15 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/15 [&::-webkit-slider-thumb]:mt-[-21px] [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#132414] [&::-webkit-slider-thumb]:bg-[var(--sage)]"
      />

      <div
        className="mt-0.5 min-h-[76px]"
        aria-live="polite"
      >
        <p className="m-0 text-[15px] font-semibold text-[rgba(255,255,255,0.95)]">
          {caption.title}
        </p>
        <p className="mt-[3px] text-[14px] leading-snug text-[#CDD7D0] text-pretty">
          {caption.body}
        </p>
        {"future" in caption && caption.future ? (
          <p
            className="mt-2 font-serif text-[15.5px] italic leading-snug text-[#A9C6B2] text-pretty"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {caption.future}
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildBandCaption,
  buildWachtendCaption,
  CYCLE_LENGTH,
  dayToDate,
  formatShortDate,
  measurementsOf,
  scrubZone,
  type BandMeasurement,
} from "@/lib/voortgang-bewijsband";
import type { DashboardData } from "@/types/dashboard";

type VoortgangBewijsbandProps = {
  cycleEvidence: DashboardData["cycleEvidence"];
  remeasure: DashboardData["remeasure"];
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined;
  priorityLabel: string;
};

const VB = { w: 340, h: 112, l: 16, r: 324, axis: 58, lane: 36 } as const;

function xOf(day: number): number {
  return VB.l + (VB.r - VB.l) * ((day - 1) / (CYCLE_LENGTH - 1));
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatRemeasureDueDate(dueDate: string): string {
  return formatShortDate(parseIsoDate(dueDate));
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
  const lastMeasureDay =
    measurements.length > 0 ? measurements[measurements.length - 1].day : null;
  const startDate = formatShortDate(dayToDate(cycleEvidence.cycleStartDate, 1));
  const endDate = formatRemeasureDueDate(remeasure.dueDate);
  const xh = xOf(headDay);

  const ariaLabel = `Tijdband van je cyclus van ${startDate} tot je hermeting op ${endDate}. Dag ${today} van nu. ${measurements.length} meetmomenten.`;

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

      {measurements.map((m) => {
        const x = xOf(m.day);
        const color = m.pillarId ? PILLAR[m.pillarId].color : "#E7EDE8";
        return (
          <g key={`${m.day}-${m.pillarId ?? "check"}`}>
            <line
              x1={x}
              y1={VB.lane + 6}
              x2={x}
              y2={VB.axis - 4}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={1}
            />
            {m.day === lastMeasureDay ? (
              <circle
                cx={x}
                cy={VB.lane}
                r={9}
                fill="none"
                stroke="rgba(255,255,255,0.26)"
                strokeWidth={1}
              />
            ) : null}
            <rect
              x={x - 4.2}
              y={VB.lane - 4.2}
              width={8.4}
              height={8.4}
              fill={color}
              stroke="#132414"
              strokeWidth={1.5}
              transform={`rotate(45 ${x} ${VB.lane})`}
            />
          </g>
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
  const endDate = formatRemeasureDueDate(remeasure.dueDate);
  const ariaLabel = `Cyclusband in afwachting. Je hermeting staat op ${endDate}.`;

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
}: {
  cycleEvidence: DashboardData["cycleEvidence"];
  remeasure: NonNullable<DashboardData["remeasure"]>;
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined;
  priorityLabel: string;
  isWachtend: boolean;
  defaultHeadDay: number;
}) {
  const [headDay, setHeadDay] = useState(defaultHeadDay);
  const scrubDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubFiredRef = useRef(false);

  const measurements = useMemo(() => {
    if (!cycleEvidence) {
      return [];
    }
    return measurementsOf({
      cycleDay: cycleEvidence.cycleDay,
      domainCheckDaysAgo: domainCheckDaysAgo ?? {},
    });
  }, [cycleEvidence, domainCheckDaysAgo]);

  const caption = useMemo(() => {
    if (isWachtend) {
      return buildWachtendCaption(remeasure.dueDate);
    }
    if (!cycleEvidence) {
      return { title: "", body: "" };
    }
    return buildBandCaption({
      cycleStartDate: cycleEvidence.cycleStartDate,
      cycleDay: cycleEvidence.cycleDay,
      remeasureDueDate: remeasure.dueDate,
      measurements,
      headDay,
      activeDays: cycleEvidence.activeDays,
      priorityLabel,
    });
  }, [
    isWachtend,
    cycleEvidence,
    remeasure.dueDate,
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

  return (
    <div className="mt-[26px] lg:mt-0 lg:rounded-[20px] lg:border lg:border-white/10 lg:bg-black/22 lg:p-[22px]">
      <h2
        className="mb-2.5 font-serif text-[18px] leading-[1.3]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Je cyclus
      </h2>

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

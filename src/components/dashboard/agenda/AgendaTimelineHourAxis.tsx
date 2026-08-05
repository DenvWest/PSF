"use client";

import { formatTimelineHour, getHourMarkerTopPx } from "@/lib/agenda-timeline";

type AgendaTimelineHourAxisProps = {
  hourLabels: number[];
  hourHeightPx: number;
  trackHeightPx: number;
  /** Sm: day-view (10.5px); week: 10px */
  compact?: boolean;
};

/**
 * Uur-labels op dezelfde px-coördinaten als het raster (-translate-y-1/2 centreert op de lijn).
 */
export default function AgendaTimelineHourAxis({
  hourLabels,
  hourHeightPx,
  trackHeightPx,
  compact = false,
}: AgendaTimelineHourAxisProps) {
  return (
    <div
      className={`relative shrink-0 ${compact ? "w-9" : "w-10 sm:w-11"}`}
      style={{ height: trackHeightPx }}
      aria-hidden
    >
      {hourLabels.map((hour) => (
        <span
          key={hour}
          className={`absolute right-0 -translate-y-1/2 font-medium tabular-nums leading-none text-[#7E8C82] ${
            compact ? "text-[10px]" : "text-[10.5px]"
          }`}
          style={{ top: getHourMarkerTopPx(hour, hourHeightPx) }}
        >
          {formatTimelineHour(hour)}
        </span>
      ))}
    </div>
  );
}

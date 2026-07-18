"use client";

import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import {
  deriveDefaultTimeBucket,
  deriveSuggestedTimeBucket,
  type TimeBucket,
} from "@/lib/account-priority-pref";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

type AgendaDayTimelineProps = {
  model: DashboardModel;
  slot: WeekDaySlot;
  prefBusy: boolean;
  onCompletionChange?: () => void;
  onTimeBucketChange: (bucket: TimeBucket) => void;
};

type ZoneConfig = {
  bucket: TimeBucket;
  label: string;
  start: string;
  end: string;
};

const ZONES: ZoneConfig[] = [
  { bucket: "ochtend", label: "Ochtend", start: "07:00", end: "12:00" },
  { bucket: "middag", label: "Middag", start: "12:00", end: "17:00" },
  { bucket: "avond", label: "Avond", start: "17:00", end: "22:00" },
];

function formatDayHeading(isoDate: string, isToday: boolean): string {
  const formatted = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));

  return isToday ? `Vandaag · ${formatted}` : formatted;
}

function resolveActiveBucket(model: DashboardModel, slot: WeekDaySlot): TimeBucket {
  if (slot.isToday) {
    return model.timeBucket ?? deriveDefaultTimeBucket();
  }
  return deriveSuggestedTimeBucket(slot.domain);
}

function FreeSpaceZone() {
  return (
    <div
      className="min-h-[52px] rounded-xl border border-dashed border-[#e4e0da] px-3 py-3"
      aria-hidden
    >
      <p className="m-0 text-[11px] text-[#a8a29e]">Ruimte voor een leefstijlmoment</p>
    </div>
  );
}

export default function AgendaDayTimeline({
  model,
  slot,
  prefBusy,
  onCompletionChange,
  onTimeBucketChange,
}: AgendaDayTimelineProps) {
  const activeBucket = resolveActiveBucket(model, slot);

  return (
    <section aria-label="Dagtijdlijn">
      <h2
        className="mb-4 text-[18px] font-medium capitalize text-[#1c1917]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {formatDayHeading(slot.date, slot.isToday)}
      </h2>

      <div className="relative">
        <div
          className="absolute bottom-3 left-[18px] top-3 w-px bg-[#e4e0da]"
          aria-hidden
        />

        <div className="flex flex-col gap-0">
          {ZONES.map((zone, index) => {
            const isActive = zone.bucket === activeBucket;
            const isLast = index === ZONES.length - 1;

            return (
              <div key={zone.bucket} className="relative pb-5 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="flex w-9 shrink-0 flex-col items-end pt-0.5">
                    <span className="text-[11px] font-medium tabular-nums text-[#78716c]">
                      {zone.start}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                        {zone.label}
                      </p>
                      {!isLast ? (
                        <span className="text-[10px] tabular-nums text-[#a8a29e]">
                          {zone.end}
                        </span>
                      ) : (
                        <span className="text-[10px] tabular-nums text-[#a8a29e]">
                          22:00
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl bg-[#faf9f7] p-2">
                      {isActive ? (
                        <AgendaTodayHero
                          key={slot.date}
                          model={model}
                          slot={slot}
                          prefBusy={prefBusy}
                          onCompletionChange={onCompletionChange}
                          onTimeBucketChange={onTimeBucketChange}
                        />
                      ) : (
                        <FreeSpaceZone />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

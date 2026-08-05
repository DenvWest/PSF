"use client";

import { useRef, useState } from "react";
import type { AgendaTimePopoverPlacement } from "@/components/dashboard/agenda/AgendaTimePopover";
import AgendaTimePopover from "@/components/dashboard/agenda/AgendaTimePopover";
import {
  adjustDurationMinutes,
  adjustPickerTime,
  BUCKET_SHORTCUTS,
  DURATION_STEP_MINUTES,
  endTimeFromStartAndDuration,
  resolveNowPickerTime,
  resolvePickerDisplayTime,
} from "@/lib/agenda-time-picker";
import type { TimeBucket } from "@/lib/account-priority-pref";
import { deriveDefaultScheduledTime, isValidLocalTime } from "@/lib/account-priority-pref";

type AgendaScheduleFieldsProps = {
  startTime: string | null;
  onStartTimeChange: (time: string) => void;
  defaultBucket?: TimeBucket;
  endTime?: string;
  durationMinutes?: number;
  onDurationChange?: (minutes: number) => void;
  showDuration?: boolean;
  showBucketShortcuts?: boolean;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact" | "compact-dark";
  preferPlacement?: "top" | "bottom" | "auto";
};

function chipClass(selected: boolean, isDark: boolean): string {
  const base =
    "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border px-3 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (selected) {
    return isDark
      ? `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]`
      : `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)] text-[#1c1917]`;
  }
  return isDark
    ? `${base} border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:border-white/25`
    : `${base} border-[#e4e0da] bg-[#faf9f7] text-[#78716c] hover:border-[#d6d3d1]`;
}

function rowStepperClass(isDark: boolean): string {
  return isDark
    ? "inline-flex min-h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[15px] font-semibold tabular-nums text-[#F1EFE8] transition-colors hover:border-white/25 disabled:opacity-60"
    : "inline-flex min-h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e4e0da] bg-[#faf9f7] text-[15px] font-semibold tabular-nums text-[#1c1917] transition-colors hover:border-[#d6d3d1] disabled:opacity-60";
}

function readOnlyFieldClass(isDark: boolean): string {
  return isDark
    ? "flex min-h-9 items-center rounded-[10px] border border-white/10 bg-black/25 px-3 text-[15px] tabular-nums text-[#F1EFE8]"
    : "flex min-h-9 items-center rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-3 text-[15px] tabular-nums text-[#1c1917]";
}

function triggerFieldClass(isDark: boolean): string {
  return isDark
    ? "flex min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-white/10 bg-black/25 px-3 text-[15px] tabular-nums text-[#F1EFE8] transition-colors hover:border-white/25 disabled:opacity-60"
    : "flex min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-3 text-[15px] tabular-nums text-[#1c1917] transition-colors hover:border-[#d6d3d1] disabled:opacity-60";
}

export default function AgendaScheduleFields({
  startTime,
  onStartTimeChange,
  defaultBucket = "middag",
  endTime,
  durationMinutes = 30,
  onDurationChange,
  showDuration = false,
  showBucketShortcuts = true,
  busy = false,
  disabled = false,
  variant = "default",
  preferPlacement,
}: AgendaScheduleFieldsProps) {
  const isCompact = variant === "compact" || variant === "compact-dark";
  const isDark = variant === "compact-dark";
  const inactive = busy || disabled;
  const resolvedPreferPlacement =
    preferPlacement ?? (isDark ? "top" : "auto");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPlacement, setPopoverPlacement] =
    useState<AgendaTimePopoverPlacement>("bottom");
  const [draftTime, setDraftTime] = useState("12:00");

  const displayStart = resolvePickerDisplayTime(startTime, defaultBucket);
  const resolvedEnd =
    endTime ??
    (showDuration
      ? endTimeFromStartAndDuration(displayStart, durationMinutes)
      : displayStart);

  const labelClass = isDark
    ? "text-[12px] font-medium text-[#9FB0A6]"
    : "text-[12px] font-medium text-[#78716c]";

  const applyTime = (time: string) => {
    if (inactive || !isValidLocalTime(time)) {
      return;
    }
    onStartTimeChange(time);
  };

  const openPopover = () => {
    if (inactive) {
      return;
    }
    setDraftTime(displayStart);
    setPopoverOpen(true);
  };

  const closePopover = () => {
    setPopoverOpen(false);
  };

  const handleConfirm = () => {
    applyTime(draftTime);
    closePopover();
  };

  const handleNow = () => {
    const nowTime = resolveNowPickerTime();
    applyTime(nowTime);
    closePopover();
  };

  const handleClear = () => {
    setDraftTime(deriveDefaultScheduledTime(defaultBucket));
  };

  const bucketRow =
    showBucketShortcuts ? (
      <div className={`${isCompact ? "mb-3" : "mb-4"} flex flex-wrap gap-2`}>
        {BUCKET_SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.bucket}
            type="button"
            disabled={inactive}
            aria-pressed={displayStart === shortcut.time}
            onClick={() => applyTime(shortcut.time)}
            className={chipClass(displayStart === shortcut.time, isDark)}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {shortcut.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div>
      {!isCompact ? (
        <p
          className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${
            isDark ? "text-[#9FB0A6]" : "text-[#78716c]"
          }`}
        >
          Wanneer
        </p>
      ) : null}

      {bucketRow}

      <div className="grid grid-cols-[88px_1fr] items-center gap-x-3 gap-y-3">
        <span className={labelClass} style={{ fontFamily: "var(--f-sans)" }}>
          Begintijd
        </span>
        <div className="relative flex items-center gap-2">
          <button
            ref={triggerRef}
            type="button"
            disabled={inactive}
            aria-expanded={popoverOpen}
            aria-haspopup="dialog"
            onClick={openPopover}
            className={triggerFieldClass(isDark)}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            <span>{displayStart}</span>
            <span aria-hidden className={isDark ? "text-[#9FB0A6]" : "text-[#78716c]"}>
              {popoverOpen && popoverPlacement === "top" ? "▴" : "▾"}
            </span>
          </button>
          <button
            type="button"
            disabled={inactive}
            aria-label="Vijftien minuten eerder"
            onClick={() => applyTime(adjustPickerTime(displayStart, -15))}
            className={rowStepperClass(isDark)}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            −
          </button>
          <button
            type="button"
            disabled={inactive}
            aria-label="Vijftien minuten later"
            onClick={() => applyTime(adjustPickerTime(displayStart, 15))}
            className={rowStepperClass(isDark)}
            style={{ fontFamily: "var(--f-sans)" }}
          >
            +
          </button>

          {popoverOpen ? (
            <AgendaTimePopover
              draftTime={draftTime}
              isDark={isDark}
              disabled={inactive}
              anchorRef={triggerRef}
              preferPlacement={resolvedPreferPlacement}
              onDraftChange={setDraftTime}
              onConfirm={handleConfirm}
              onNow={handleNow}
              onClear={handleClear}
              onClose={closePopover}
              onPlacementResolved={setPopoverPlacement}
            />
          ) : null}
        </div>

        <span className={labelClass} style={{ fontFamily: "var(--f-sans)" }}>
          Eindtijd
        </span>
        <div
          className={readOnlyFieldClass(isDark)}
          aria-live="polite"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          {resolvedEnd}
        </div>

        {showDuration && onDurationChange ? (
          <>
            <span className={labelClass} style={{ fontFamily: "var(--f-sans)" }}>
              Duur
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={inactive}
                aria-label="Korter maken"
                onClick={() =>
                  onDurationChange(
                    adjustDurationMinutes(durationMinutes, -DURATION_STEP_MINUTES),
                  )
                }
                className={rowStepperClass(isDark)}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                −
              </button>
              <span
                className={`min-w-[3.5rem] text-center text-[15px] font-medium tabular-nums ${
                  isDark ? "text-[#F1EFE8]" : "text-[#1c1917]"
                }`}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                {durationMinutes} min
              </span>
              <button
                type="button"
                disabled={inactive}
                aria-label="Langer maken"
                onClick={() =>
                  onDurationChange(
                    adjustDurationMinutes(durationMinutes, DURATION_STEP_MINUTES),
                  )
                }
                className={rowStepperClass(isDark)}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                +
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

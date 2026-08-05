"use client";

import {
  BUCKET_SHORTCUTS,
  buildQuarterHourSlots,
  adjustPickerTime,
  resolvePickerDisplayTime,
} from "@/lib/agenda-time-picker";
import type { TimeBucket } from "@/lib/account-priority-pref";
import { isValidLocalTime } from "@/lib/account-priority-pref";

const QUARTER_HOUR_SLOTS = buildQuarterHourSlots();

type AgendaTimePickerProps = {
  value: string | null;
  defaultBucket?: TimeBucket;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact" | "compact-dark";
  showBucketShortcuts?: boolean;
  onChange: (time: string) => void;
};

function chipClass(selected: boolean, isDark: boolean): string {
  const base =
    "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3 text-[12.5px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (selected) {
    return isDark
      ? `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]`
      : `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)] text-[#1c1917]`;
  }
  return isDark
    ? `${base} border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:border-white/25`
    : `${base} border-[#e4e0da] bg-[#faf9f7] text-[#78716c] hover:border-[#d6d3d1]`;
}

function slotChipClass(selected: boolean, isDark: boolean): string {
  const base =
    "inline-flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg border text-[12.5px] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  if (selected) {
    return isDark
      ? `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.2)] text-[#F1EFE8]`
      : `${base} border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)] text-[#1c1917]`;
  }
  return isDark
    ? `${base} border-white/10 bg-white/[0.03] text-[#CDD7D0] hover:border-white/20`
    : `${base} border-[#ebe7e2] bg-white text-[#57534e] hover:border-[#d6d3d1]`;
}

export default function AgendaTimePicker({
  value,
  defaultBucket = "middag",
  busy = false,
  disabled = false,
  variant = "default",
  showBucketShortcuts = true,
  onChange,
}: AgendaTimePickerProps) {
  const isCompact = variant === "compact" || variant === "compact-dark";
  const isDark = variant === "compact-dark";
  const inactive = busy || disabled;
  const displayTime = resolvePickerDisplayTime(value, defaultBucket);

  const handleSelect = (time: string) => {
    if (inactive || !isValidLocalTime(time)) {
      return;
    }
    onChange(time);
  };

  const mutedClass = isDark ? "text-[#9FB0A6]" : "text-[#78716c]";
  const readoutClass = isDark
    ? "text-[22px] font-semibold tabular-nums text-[#F1EFE8]"
    : "text-[22px] font-semibold tabular-nums text-[#1c1917]";
  const stepperClass = isDark
    ? "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[15px] font-semibold tabular-nums text-[#F1EFE8] transition-colors hover:border-white/25 disabled:opacity-60"
    : "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-[#e4e0da] bg-[#faf9f7] text-[15px] font-semibold tabular-nums text-[#1c1917] transition-colors hover:border-[#d6d3d1] disabled:opacity-60";

  return (
    <div>
      {!isCompact ? (
        <p className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${mutedClass}`}>
          Wanneer
        </p>
      ) : null}

      {showBucketShortcuts ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {BUCKET_SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut.bucket}
              type="button"
              disabled={inactive}
              aria-pressed={displayTime === shortcut.time}
              onClick={() => handleSelect(shortcut.time)}
              className={chipClass(displayTime === shortcut.time, isDark)}
              style={{ fontFamily: "var(--f-sans)" }}
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={inactive}
          aria-label="Vijftien minuten eerder"
          onClick={() => handleSelect(adjustPickerTime(displayTime, -15))}
          className={stepperClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          −15
        </button>
        <span
          className={readoutClass}
          aria-live="polite"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          {displayTime}
        </span>
        <button
          type="button"
          disabled={inactive}
          aria-label="Vijftien minuten later"
          onClick={() => handleSelect(adjustPickerTime(displayTime, 15))}
          className={stepperClass}
          style={{ fontFamily: "var(--f-sans)" }}
        >
          +15
        </button>
      </div>

      <div
        className={`max-h-40 overflow-y-auto rounded-xl border p-2 ${
          isDark ? "border-white/10 bg-black/20" : "border-[#ebe7e2] bg-[#faf9f7]"
        }`}
      >
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
          {QUARTER_HOUR_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              disabled={inactive}
              aria-pressed={displayTime === slot}
              aria-label={`Kies ${slot}`}
              onClick={() => handleSelect(slot)}
              className={slotChipClass(displayTime === slot, isDark)}
              style={{ fontFamily: "var(--f-sans)" }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  deriveDefaultScheduledTime,
  isValidLocalTime,
  type TimeBucket,
} from "@/lib/account-priority-pref";

type AgendaTimeBucketPickerProps = {
  value: string | null;
  defaultBucket: TimeBucket;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact" | "compact-dark";
  onChange: (scheduledTime: string) => void;
};

export default function AgendaTimeBucketPicker({
  value,
  defaultBucket,
  busy = false,
  disabled = false,
  variant = "default",
  onChange,
}: AgendaTimeBucketPickerProps) {
  const displayValue = value ?? deriveDefaultScheduledTime(defaultBucket);
  const isCompact = variant === "compact" || variant === "compact-dark";
  const isDark = variant === "compact-dark";

  return (
    <div>
      {!isCompact ? (
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
          Wanneer
        </p>
      ) : null}
      <input
        type="time"
        value={displayValue}
        disabled={busy || disabled}
        aria-label="Kies tijdstip"
        onChange={(event) => {
          const next = event.target.value;
          if (isValidLocalTime(next)) {
            onChange(next);
          }
        }}
        className={`min-h-11 w-full cursor-pointer rounded-[10px] border px-3 text-[15px] font-medium tabular-nums disabled:opacity-60 ${
          isCompact ? "rounded-xl text-[14px]" : "rounded-2xl"
        } ${
          isDark
            ? "border-white/10 bg-black/20 text-[#F1EFE8]"
            : "border-[#e4e0da] bg-[#faf9f7] text-[#1c1917]"
        }`}
        style={{ fontFamily: "var(--f-sans)" }}
      />
    </div>
  );
}
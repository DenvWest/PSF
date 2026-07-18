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
  variant?: "default" | "compact";
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
  const isCompact = variant === "compact";

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
        className={`min-h-11 w-full cursor-pointer rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-3 text-[15px] font-medium tabular-nums text-[#1c1917] disabled:opacity-60 ${
          isCompact ? "rounded-xl" : "rounded-2xl"
        }`}
        style={{ fontFamily: "var(--f-sans)" }}
      />
    </div>
  );
}
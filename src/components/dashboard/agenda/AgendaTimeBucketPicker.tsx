"use client";

import {
  TIME_BUCKETS,
  deriveDefaultTimeBucket,
  type TimeBucket,
} from "@/lib/account-priority-pref";

type AgendaTimeBucketPickerProps = {
  value: TimeBucket | null;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact";
  onChange: (bucket: TimeBucket) => void;
};

export default function AgendaTimeBucketPicker({
  value,
  busy = false,
  disabled = false,
  variant = "default",
  onChange,
}: AgendaTimeBucketPickerProps) {
  const activeBucket = value ?? deriveDefaultTimeBucket();
  const isCompact = variant === "compact";

  return (
    <div>
      {!isCompact ? (
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
          Wanneer
        </p>
      ) : null}
      <div
        className={`grid grid-cols-3 gap-1 ${isCompact ? "rounded-xl bg-[#faf9f7] p-1" : "rounded-2xl border border-[#e4e0da] bg-[#faf9f7] p-1"}`}
        role="group"
        aria-label="Kies tijdvak"
      >
        {TIME_BUCKETS.map((bucket) => {
          const selected = bucket === activeBucket;
          return (
            <button
              key={bucket}
              type="button"
              disabled={busy || disabled}
              aria-pressed={selected}
              onClick={() => onChange(bucket)}
              className="min-h-11 cursor-pointer rounded-[10px] border-none px-2 text-[13px] font-semibold capitalize transition-colors disabled:opacity-60"
              style={{
                background: selected ? "var(--sage)" : "transparent",
                color: selected ? "#0f1c10" : "#78716c",
                fontFamily: "var(--f-sans)",
              }}
            >
              {bucket}
            </button>
          );
        })}
      </div>
    </div>
  );
}

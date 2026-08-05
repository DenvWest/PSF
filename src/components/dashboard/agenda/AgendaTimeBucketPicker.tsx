"use client";

import AgendaTimePicker from "@/components/dashboard/agenda/AgendaTimePicker";
import type { TimeBucket } from "@/lib/account-priority-pref";

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
  return (
    <AgendaTimePicker
      value={value}
      defaultBucket={defaultBucket}
      busy={busy}
      disabled={disabled}
      variant={variant}
      onChange={onChange}
    />
  );
}

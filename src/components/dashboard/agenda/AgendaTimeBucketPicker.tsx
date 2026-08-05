"use client";

import AgendaScheduleFields from "@/components/dashboard/agenda/AgendaScheduleFields";
import type { TimeBucket } from "@/lib/account-priority-pref";

type AgendaTimeBucketPickerProps = {
  value: string | null;
  defaultBucket: TimeBucket;
  endTime?: string;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact" | "compact-dark";
  onChange: (scheduledTime: string) => void;
};

export default function AgendaTimeBucketPicker({
  value,
  defaultBucket,
  endTime,
  busy = false,
  disabled = false,
  variant = "default",
  onChange,
}: AgendaTimeBucketPickerProps) {
  return (
    <AgendaScheduleFields
      startTime={value}
      onStartTimeChange={onChange}
      defaultBucket={defaultBucket}
      endTime={endTime}
      showDuration={false}
      busy={busy}
      disabled={disabled}
      variant={variant}
    />
  );
}

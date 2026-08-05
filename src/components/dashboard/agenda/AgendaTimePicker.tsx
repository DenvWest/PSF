"use client";

import AgendaScheduleFields from "@/components/dashboard/agenda/AgendaScheduleFields";
import type { TimeBucket } from "@/lib/account-priority-pref";

type AgendaTimePickerProps = {
  value: string | null;
  defaultBucket?: TimeBucket;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact" | "compact-dark";
  showBucketShortcuts?: boolean;
  onChange: (time: string) => void;
};

export default function AgendaTimePicker({
  value,
  defaultBucket = "middag",
  busy = false,
  disabled = false,
  variant = "default",
  showBucketShortcuts = true,
  onChange,
}: AgendaTimePickerProps) {
  return (
    <AgendaScheduleFields
      startTime={value}
      onStartTimeChange={onChange}
      defaultBucket={defaultBucket}
      showDuration={false}
      showBucketShortcuts={showBucketShortcuts}
      busy={busy}
      disabled={disabled}
      variant={variant}
    />
  );
}

import type {
  AccountPriorityPrefData,
  PillarId,
  TimeBucket,
} from "@/types/dashboard";
import type { PriorityPrefSource } from "@/lib/account-priority-pref";

export type PriorityPrefResponse = AccountPriorityPrefData | { pillarId: null };

export async function fetchPriorityPref(): Promise<PriorityPrefResponse> {
  const response = await fetch("/api/account/priority-pref", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Kon focus-voorkeur niet laden.");
  }
  return (await response.json()) as PriorityPrefResponse;
}

export async function postPrioritySelection(input: {
  pillarId: PillarId;
  source: PriorityPrefSource;
  surface: string;
  timeBucket?: TimeBucket | null;
  scheduledTime?: string | null;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      pillarId: input.pillarId,
      source: input.source,
      surface: input.surface,
      timeBucket: input.timeBucket,
      scheduledTime: input.scheduledTime,
    }),
  });
  if (!response.ok) {
    throw new Error("Kon focus niet opslaan.");
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return {
    pillarId: payload.pillarId,
    source: payload.source,
    timeBucket: payload.timeBucket ?? null,
    scheduledTime: payload.scheduledTime ?? null,
    updatedAt: payload.updatedAt,
  };
}

export async function postTimeBucket(input: {
  timeBucket: TimeBucket;
  surface: string;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "set_time_bucket",
      timeBucket: input.timeBucket,
      surface: input.surface,
    }),
  });
  if (!response.ok) {
    throw new Error("Kon tijdvak niet opslaan.");
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return {
    pillarId: payload.pillarId,
    source: payload.source,
    timeBucket: payload.timeBucket ?? null,
    scheduledTime: payload.scheduledTime ?? null,
    updatedAt: payload.updatedAt,
  };
}

export async function postScheduledTime(input: {
  scheduledTime: string;
  surface: string;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "set_scheduled_time",
      scheduledTime: input.scheduledTime,
      surface: input.surface,
    }),
  });
  if (!response.ok) {
    throw new Error("Kon tijdstip niet opslaan.");
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return {
    pillarId: payload.pillarId,
    source: payload.source,
    timeBucket: payload.timeBucket ?? null,
    scheduledTime: payload.scheduledTime ?? null,
    updatedAt: payload.updatedAt,
  };
}

export async function resetPriorityPref(): Promise<void> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "reset" }),
  });
  if (!response.ok) {
    throw new Error("Kon focus niet resetten.");
  }
}

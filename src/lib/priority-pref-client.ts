import type {
  AccountPriorityPrefData,
  PillarId,
  TimeBucket,
} from "@/types/dashboard";
import type { PriorityPrefSource } from "@/lib/account-priority-pref";

export type PriorityPrefResponse = AccountPriorityPrefData | { pillarId: null };

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error?.trim()) {
      return payload.error.trim();
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export async function fetchPriorityPref(): Promise<PriorityPrefResponse> {
  const response = await fetch("/api/account/priority-pref", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon focus-voorkeur niet laden."));
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
    throw new Error(await readApiError(response, "Kon focus niet opslaan."));
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
}

function mapPriorityPrefResponse(
  payload: AccountPriorityPrefData & { ok?: boolean },
): AccountPriorityPrefData {
  return {
    pillarId: payload.pillarId,
    source: payload.source,
    timeBucket: payload.timeBucket ?? null,
    scheduledTime: payload.scheduledTime ?? null,
    planStepDismissedDate: payload.planStepDismissedDate ?? null,
    planStepsHidden: payload.planStepsHidden ?? false,
    updatedAt: payload.updatedAt,
  };
}

export async function postDismissPlanStep(input: {
  date: string;
  surface: string;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "dismiss_plan_step",
      date: input.date,
      surface: input.surface,
    }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon plan-stap niet verbergen."));
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
}

export async function postRestorePlanStep(input: {
  surface: string;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: "restore_plan_step",
      surface: input.surface,
    }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon plan-stap niet terugzetten."));
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
}

export async function postSetPlanStepsHidden(input: {
  hidden: boolean;
  surface: string;
}): Promise<AccountPriorityPrefData> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      action: input.hidden ? "hide_all_plan_steps" : "show_all_plan_steps",
      surface: input.surface,
    }),
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        input.hidden
          ? "Kon plan-stappen niet verbergen."
          : "Kon plan-stappen niet weer tonen.",
      ),
    );
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
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
    throw new Error(await readApiError(response, "Kon tijdvak niet opslaan."));
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
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
    throw new Error(await readApiError(response, "Kon tijdstip niet opslaan."));
  }
  const payload = (await response.json()) as AccountPriorityPrefData & { ok?: boolean };
  return mapPriorityPrefResponse(payload);
}

export async function resetPriorityPref(): Promise<void> {
  const response = await fetch("/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "reset" }),
  });
  if (!response.ok) {
    throw new Error(await readApiError(response, "Kon focus niet resetten."));
  }
}

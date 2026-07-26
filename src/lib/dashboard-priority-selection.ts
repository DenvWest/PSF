import type { PriorityPrefSource } from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  postPrioritySelection,
  resetPriorityPref,
} from "@/lib/priority-pref-client";
import type { AccountPriorityPrefData, PillarId, TimeBucket } from "@/types/dashboard";

export type PrioritySelectionSurface =
  | "agenda"
  | "kompas_voortgang"
  | "kompas_voortgang_tab"
  | "kompas_beweging"
  | "statistieken";

export async function saveDashboardPrioritySelection(input: {
  pillarId: PillarId;
  source: PriorityPrefSource;
  surface: PrioritySelectionSurface;
  timeBucket?: TimeBucket | null;
  scheduledTime?: string | null;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
}): Promise<AccountPriorityPrefData> {
  const pref = await postPrioritySelection({
    pillarId: input.pillarId,
    source: input.source,
    surface: input.surface,
    timeBucket: input.timeBucket,
    scheduledTime: input.scheduledTime,
  });
  input.onPrefUpdated(pref);
  trackEvent("dashboard_priority_selected", {
    pillar_id: input.pillarId,
    source: input.source,
    surface: input.surface,
  });
  clarityTag("dashboard_priority", input.pillarId);
  return pref;
}

export async function resetDashboardPriorityFocus(
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void,
): Promise<void> {
  await resetPriorityPref();
  onPrefUpdated(null);
}

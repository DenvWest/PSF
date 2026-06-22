import { PILLAR } from "@/data/dashboard";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { derivePriority } from "@/lib/dashboard-model";
import type { PillarId } from "@/types/dashboard";

export type InzichtenVisitorContext = {
  priorityPillarId: PillarId;
  priorityLabel: string;
  orderedPillarIds: PillarId[];
  profileLabel: string | null;
};

export async function getInzichtenVisitorContext(): Promise<InzichtenVisitorContext | null> {
  const account = await getAccountFromCookie();
  if (!account) {
    return null;
  }

  const dashboard = await loadAccountDashboardData(account.id);
  if (dashboard.empty || !dashboard.current) {
    return null;
  }

  const ordered = derivePriority(dashboard.current.scores);
  const priority = ordered[0];

  return {
    priorityPillarId: priority.id,
    priorityLabel: PILLAR[priority.id].label,
    orderedPillarIds: ordered.map((pillar) => pillar.id),
    profileLabel: null,
  };
}

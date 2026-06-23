import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  derivePersonalization,
  type VisitorPersonalization,
} from "@/lib/visitor-personalization";

export type InzichtenVisitorContext = VisitorPersonalization;

export async function getInzichtenVisitorContext(): Promise<InzichtenVisitorContext | null> {
  const account = await getAccountFromCookie();
  if (!account) {
    return null;
  }

  const dashboard = await loadAccountDashboardData(account.id);
  if (dashboard.empty || !dashboard.current) {
    return null;
  }

  return derivePersonalization(dashboard.current.scores, dashboard.profileLabel);
}

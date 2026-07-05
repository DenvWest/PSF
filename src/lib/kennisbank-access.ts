import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";

export async function canAccessVerdieping(): Promise<boolean> {
  const account = await getAccountFromCookie();
  if (!account) {
    return false;
  }

  const dashboard = await loadAccountDashboardData(account.id);
  if (dashboard.empty || !dashboard.current) {
    return false;
  }

  return true;
}

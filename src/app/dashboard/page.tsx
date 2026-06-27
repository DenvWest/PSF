import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import type { VoortgangScreen } from "@/components/dashboard/VoortgangHub";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";
import type { DashboardTabId } from "@/types/dashboard";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type DashboardPageProps = {
  searchParams: Promise<{ state?: string; tab?: string; screen?: string }>;
};

const VALID_TABS = new Set<DashboardTabId>(["vandaag", "voortgang", "hermeting"]);
const VALID_VOORTGANG_SCREENS = new Set<VoortgangScreen>([
  "hub",
  "inzichten",
  "favorieten",
  "statistieken",
  "lichaamssamenstelling",
]);

function parseInitialTab(tab?: string): DashboardTabId | undefined {
  if (tab && VALID_TABS.has(tab as DashboardTabId)) {
    return tab as DashboardTabId;
  }
  return undefined;
}

function parseInitialVoortgangScreen(screen?: string): VoortgangScreen | undefined {
  if (screen && VALID_VOORTGANG_SCREENS.has(screen as VoortgangScreen)) {
    return screen as VoortgangScreen;
  }
  return undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const account = await getAccountFromCookie();
  if (!account) {
    redirect("/account/login");
  }

  const { state, tab, screen } = await searchParams;
  const initialTab = parseInitialTab(tab);
  const initialVoortgangScreen = parseInitialVoortgangScreen(screen);

  const dashboardProps = {
    initialTab,
    initialVoortgangScreen,
  };

  if (state === "empty") {
    return (
      <div className="ps-dark">
        <Dashboard empty {...dashboardProps} />
      </div>
    );
  }

  if (state === "scored") {
    return (
      <div className="ps-dark">
        <Dashboard data={buildDevDashboardData("scored")} {...dashboardProps} />
      </div>
    );
  }

  if (state === "retest") {
    return (
      <div className="ps-dark">
        <Dashboard data={buildDevDashboardData("retest")} {...dashboardProps} />
      </div>
    );
  }

  const data = await loadAccountDashboardData(account.id);

  return (
    <div className="ps-dark">
      <Dashboard empty={data.empty} data={data} {...dashboardProps} />
    </div>
  );
}

import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import type { VoortgangScreen } from "@/components/dashboard/VoortgangHub";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { hasFeature } from "@/lib/db/entitlements";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";
import type { DashboardTabId, PillarId } from "@/types/dashboard";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type DashboardPageProps = {
  searchParams: Promise<{
    state?: string;
    tab?: string;
    screen?: string;
    kompas?: string;
  }>;
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

const VALID_KOMPAS_VIEWS = new Set<PillarId>([
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
]);

function parseInitialKompasView(kompas?: string): PillarId | undefined {
  if (kompas && VALID_KOMPAS_VIEWS.has(kompas as PillarId)) {
    return kompas as PillarId;
  }
  return undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { state, tab, screen, kompas } = await searchParams;

  const account = await getAccountFromCookie();
  if (!account) {
    if (tab === "voortgang") {
      redirect("/account/login?from=voortgang");
    }
    redirect("/account/login");
  }
  const initialTab = parseInitialTab(tab);
  const initialVoortgangScreen = parseInitialVoortgangScreen(screen);
  const initialKompasView = parseInitialKompasView(kompas);

  const dashboardProps = {
    initialTab,
    initialVoortgangScreen,
    initialKompasView,
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
  const hasTrendsFeature = await hasFeature(account.id, "trends");

  return (
    <div className="ps-dark">
      <Dashboard
        empty={data.empty}
        data={data}
        hasTrendsFeature={hasTrendsFeature}
        {...dashboardProps}
      />
    </div>
  );
}

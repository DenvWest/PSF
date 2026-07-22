import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import type { VoortgangScreen } from "@/components/dashboard/VoortgangHub";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { hasFeature } from "@/lib/db/entitlements";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";
import { parseSleepFocus, SLEEP_FOCUS_COOKIE_NAME } from "@/lib/sleep-focus";
import type { KompasDeepView } from "@/lib/dashboard-url";
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
    view?: string;
  }>;
};

const VALID_TABS = new Set<DashboardTabId>(["vandaag", "agenda", "voortgang", "hermeting"]);
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

function parseInitialKompasDeepView(
  kompas?: string,
  view?: string,
): KompasDeepView | undefined {
  if (kompas === "beweging" && view === "stappenplan") {
    return "stappenplan";
  }
  return undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { state, tab, screen, kompas, view } = await searchParams;

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
  const initialKompasDeepView = parseInitialKompasDeepView(kompas, view);

  const dashboardProps = {
    initialTab,
    initialVoortgangScreen,
    initialKompasView,
    initialKompasDeepView,
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

  const [data, hasTrendsFeature] = await Promise.all([
    loadAccountDashboardData(account.id),
    hasFeature(account.id, "trends"),
  ]);

  const cookieStore = await cookies();
  const sleepFocus = data.empty
    ? parseSleepFocus(cookieStore.get(SLEEP_FOCUS_COOKIE_NAME)?.value)
    : null;

  return (
    <div className="ps-dark">
      <Dashboard
        empty={data.empty}
        data={data}
        hasTrendsFeature={hasTrendsFeature}
        sleepFocus={sleepFocus}
        {...dashboardProps}
      />
    </div>
  );
}

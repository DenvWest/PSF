import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { isStatistiekenBlik } from "@/lib/statistieken-blik";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { hasFeature } from "@/lib/db/entitlements";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";
import { parseSleepFocus, SLEEP_FOCUS_COOKIE_NAME } from "@/lib/sleep-focus";
import { syncSupplementVerdicts } from "@/lib/supplement-verdict-producer";
import {
  isAgendaViewId,
  parseVoortgangScreenFromUrl,
  type AgendaViewId,
} from "@/lib/dashboard-url";
import type { DashboardTabId, PillarId, StatistiekenBlik } from "@/types/dashboard";

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
    blik?: string;
    kompas?: string;
    view?: string;
  }>;
};

const VALID_TABS = new Set<DashboardTabId>(["vandaag", "agenda", "voortgang", "hermeting"]);

function parseInitialTab(tab?: string): DashboardTabId | undefined {
  if (tab && VALID_TABS.has(tab as DashboardTabId)) {
    return tab as DashboardTabId;
  }
  return undefined;
}

function parseInitialStatistiekenBlik(
  screen?: string,
  blik?: string,
): StatistiekenBlik | undefined {
  if (screen !== "statistieken" || !blik || !isStatistiekenBlik(blik)) {
    return undefined;
  }
  return blik;
}

function parseInitialVoortgangScreen(screen?: string) {
  if (!screen) {
    return undefined;
  }
  const parsed = parseVoortgangScreenFromUrl(
    `http://localhost/dashboard?tab=voortgang&screen=${encodeURIComponent(screen)}`,
  );
  return parsed === "hub" ? undefined : parsed;
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

function parseInitialAgendaView(tab?: string, view?: string): AgendaViewId | undefined {
  if (tab !== "agenda" || !isAgendaViewId(view)) {
    return undefined;
  }
  return view;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { state, tab, screen, blik, kompas, view } = await searchParams;

  const account = await getAccountFromCookie();
  if (!account) {
    if (tab === "voortgang") {
      redirect("/account/login?from=voortgang");
    }
    redirect("/account/login");
  }
  const initialTab = parseInitialTab(tab);
  const initialVoortgangScreen = parseInitialVoortgangScreen(screen);
  const initialStatistiekenBlik = parseInitialStatistiekenBlik(screen, blik);
  const initialKompasView = parseInitialKompasView(kompas);
  const initialAgendaView = parseInitialAgendaView(tab, view);

  const dashboardProps = {
    initialTab,
    initialVoortgangScreen,
    initialStatistiekenBlik,
    initialKompasView,
    initialAgendaView,
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

  const supplementVerdicts = await syncSupplementVerdicts(account.id, data);

  return (
    <div className="ps-dark">
      <Dashboard
        empty={data.empty}
        data={{ ...data, supplementVerdicts }}
        hasTrendsFeature={hasTrendsFeature}
        sleepFocus={sleepFocus}
        {...dashboardProps}
      />
    </div>
  );
}

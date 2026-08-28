import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import { getAccountFromCookie } from "@/lib/account-server";
import { hasFeature } from "@/lib/db/entitlements";
import { buildDevDashboardData } from "@/lib/dashboard-dev-data";
import { parseSleepFocus, SLEEP_FOCUS_COOKIE_NAME } from "@/lib/sleep-focus";
import {
  loadSupplementVerdicts,
  syncSupplementVerdicts,
} from "@/lib/supplement-verdict-producer";
import {
  isAgendaViewId,
  parseVoortgangScreenFromUrl,
  type AgendaViewId,
} from "@/lib/dashboard-url";
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
    blik?: string;
    kompas?: string;
    view?: string;
  }>;
};

const VALID_TABS = new Set<DashboardTabId>(["vandaag", "agenda", "voortgang", "keuze"]);

/**
 * Routes van vóór 27 augustus: `tab=hermeting` was een eigen tabblad en het
 * schap een Voortgang-scherm. Beide landen nu op hun huidige plek — de client
 * schrijft de URL daarna zelf schoon (`canonicalizeDashboardTabParam`), dus
 * hier alleen de eerste render goed zetten.
 */
function parseInitialTab(tab?: string, screen?: string): DashboardTabId | undefined {
  if (tab === "hermeting") {
    return "voortgang";
  }
  if (tab === "voortgang" && (screen === "schap" || screen === "favorieten")) {
    return "keuze";
  }
  if (tab && VALID_TABS.has(tab as DashboardTabId)) {
    return tab as DashboardTabId;
  }
  return undefined;
}

function parseInitialVoortgangScreen(tab?: string, screen?: string) {
  if (tab === "hermeting") {
    return "hermeting" as const;
  }
  if (!screen) {
    return undefined;
  }
  const parsed = parseVoortgangScreenFromUrl(
    `http://localhost/dashboard?tab=voortgang&screen=${encodeURIComponent(screen)}`,
  );
  if (parsed === "hub" || parsed === "schap") {
    return undefined;
  }
  return parsed;
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
  const { state, tab, screen, kompas, view } = await searchParams;

  const account = await getAccountFromCookie();
  if (!account) {
    if (tab === "voortgang") {
      redirect("/account/login?from=voortgang");
    }
    redirect("/account/login");
  }
  const initialTab = parseInitialTab(tab, screen);
  const initialVoortgangScreen = parseInitialVoortgangScreen(tab, screen);
  const initialKompasView = parseInitialKompasView(kompas);
  const initialAgendaView = parseInitialAgendaView(tab, view);

  const dashboardProps = {
    initialTab,
    initialVoortgangScreen,
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

  // De oordelen hangen alleen aan het account, niet aan `data` — dus lezen we
  // ze hier mee in plaats van erna. `syncSupplementVerdicts` doet daarna geen
  // enkele query zolang er niets omslaat, en dat is het normale geval.
  const [data, hasTrendsFeature, storedVerdicts, cookieStore] = await Promise.all([
    loadAccountDashboardData(account.id),
    hasFeature(account.id, "trends"),
    loadSupplementVerdicts(account.id),
    cookies(),
  ]);

  const sleepFocus = data.empty
    ? parseSleepFocus(cookieStore.get(SLEEP_FOCUS_COOKIE_NAME)?.value)
    : null;

  const supplementVerdicts = await syncSupplementVerdicts(
    account.id,
    data,
    storedVerdicts,
  );

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

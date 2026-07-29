import { isStatistiekenBlik } from "@/lib/statistieken-blik";
import type {
  DashboardTabId,
  PillarId,
  StatistiekenBlik,
  VoortgangScreen,
} from "@/types/dashboard";

const VALID_VOORTGANG_SCREENS = new Set<VoortgangScreen>([
  "hub",
  "inzichten",
  "favorieten",
  "statistieken",
  "lichaamssamenstelling",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidAgendaDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseDagFromUrl(url: string | URL): string | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const dag = parsed.searchParams.get("dag");
  if (dag && isValidAgendaDate(dag)) {
    return dag;
  }
  return null;
}

const KOMPAS_DOMAIN_IDS = new Set<PillarId>([
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
]);

export type KompasDeepView = "cockpit" | "stappenplan";

const KOMPAS_DEEP_VIEW_PILLARS = new Set<PillarId>(["beweging"]);

export function supportsKompasDeepView(domain: PillarId): boolean {
  return KOMPAS_DEEP_VIEW_PILLARS.has(domain);
}

export function parseKompasFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const kompas = parsed.searchParams.get("kompas");
  if (kompas && KOMPAS_DOMAIN_IDS.has(kompas as PillarId)) {
    return kompas as PillarId;
  }
  return null;
}

export function parseKompasDeepViewFromUrl(url: string | URL): KompasDeepView {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const kompas = parseKompasFromUrl(parsed);
  const view = parsed.searchParams.get("view");
  if (kompas === "beweging" && view === "stappenplan") {
    return "stappenplan";
  }
  return "cockpit";
}

export function buildDashboardVandaagHref(
  kompas?: PillarId | null,
  dag?: string | null,
): string {
  const params = new URLSearchParams({ tab: "vandaag" });
  if (kompas) {
    params.set("kompas", kompas);
  }
  if (dag && isValidAgendaDate(dag)) {
    params.set("dag", dag);
  }
  return `/dashboard?${params.toString()}`;
}

export function parseVoortgangScreenFromUrl(url: string | URL): VoortgangScreen {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const screen = parsed.searchParams.get("screen");
  if (
    screen &&
    screen !== "hub" &&
    VALID_VOORTGANG_SCREENS.has(screen as VoortgangScreen)
  ) {
    return screen as VoortgangScreen;
  }
  return "hub";
}

export function parseStatistiekenBlikFromUrl(url: string | URL): StatistiekenBlik | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const blik = parsed.searchParams.get("blik");
  return isStatistiekenBlik(blik) ? blik : null;
}

export function buildDashboardVoortgangHref(
  screen?: VoortgangScreen | null,
  blik?: StatistiekenBlik | null,
): string {
  const params = new URLSearchParams({ tab: "voortgang" });
  if (screen && screen !== "hub") {
    params.set("screen", screen);
  }
  if (screen === "statistieken" && blik) {
    params.set("blik", blik);
  }
  return `/dashboard?${params.toString()}`;
}

export type SyncDashboardVoortgangOptions = {
  blik?: StatistiekenBlik | null;
};

export function syncDashboardVoortgangScreenParam(
  screen: VoortgangScreen,
  options?: SyncDashboardVoortgangOptions,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("tab", "voortgang");
  url.searchParams.delete("kompas");
  url.searchParams.delete("view");
  url.searchParams.delete("dag");

  if (screen === "hub") {
    url.searchParams.delete("screen");
    url.searchParams.delete("blik");
  } else {
    url.searchParams.set("screen", screen);
    if (screen === "statistieken" && options?.blik) {
      url.searchParams.set("blik", options.blik);
    } else {
      url.searchParams.delete("blik");
    }
  }

  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function syncDashboardStatistiekenBlikParam(blik: StatistiekenBlik): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get("tab") !== "voortgang") {
    return;
  }
  if (parseVoortgangScreenFromUrl(url) !== "statistieken") {
    return;
  }

  url.searchParams.set("blik", blik);
  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function buildDashboardAgendaHref(dag?: string | null): string {
  const params = new URLSearchParams({ tab: "agenda" });
  if (dag && isValidAgendaDate(dag)) {
    params.set("dag", dag);
  }
  return `/dashboard?${params.toString()}`;
}

export function buildDashboardBewegingStappenplanHref(): string {
  return "/dashboard?tab=vandaag&kompas=beweging&view=stappenplan";
}

export function buildDashboardPlanHref(planDomain: string): string {
  if (planDomain === "movement") {
    return buildDashboardBewegingStappenplanHref();
  }
  return `/intake/plan/${planDomain}?from=dashboard`;
}

function syncDashboardUrlParams(
  domain: PillarId | null,
  deepView: KompasDeepView = "cockpit",
): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const dag = url.searchParams.get("dag");
  url.searchParams.set("tab", "vandaag");
  if (domain) {
    url.searchParams.set("kompas", domain);
  } else {
    url.searchParams.delete("kompas");
  }

  if (domain && supportsKompasDeepView(domain) && deepView === "stappenplan") {
    url.searchParams.set("view", "stappenplan");
  } else {
    url.searchParams.delete("view");
  }

  if (dag && isValidAgendaDate(dag)) {
    url.searchParams.set("dag", dag);
  }

  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function syncDashboardKompasParam(domain: PillarId | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const current = new URL(window.location.href);
  const currentTab = current.searchParams.get("tab");
  const currentKompas = parseKompasFromUrl(current);
  const currentDeepView = parseKompasDeepViewFromUrl(current);

  if (currentTab === "vandaag" && currentKompas === domain && currentDeepView === "cockpit") {
    return;
  }

  syncDashboardUrlParams(domain, "cockpit");
}

export function syncDashboardKompasDeepView(
  domain: PillarId | null,
  view: KompasDeepView,
): void {
  syncDashboardUrlParams(domain, view);
}

export type SyncDashboardTabOptions = {
  dag?: string | null;
};

export function syncDashboardDagParam(dag: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  const tab = url.searchParams.get("tab");
  if (tab !== "vandaag" && tab !== "agenda") {
    return;
  }
  if (dag && isValidAgendaDate(dag)) {
    url.searchParams.set("dag", dag);
  } else {
    url.searchParams.delete("dag");
  }
  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function syncDashboardTabParam(
  tab: DashboardTabId,
  options?: SyncDashboardTabOptions,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  const currentTab = url.searchParams.get("tab");
  const nextDag =
    tab === "agenda" || tab === "vandaag"
      ? options?.dag && isValidAgendaDate(options.dag)
        ? options.dag
        : url.searchParams.get("dag")
      : null;

  if (currentTab === tab) {
    if (tab === "agenda" || tab === "vandaag") {
      if (nextDag && isValidAgendaDate(nextDag)) {
        if (url.searchParams.get("dag") !== nextDag) {
          url.searchParams.set("dag", nextDag);
          window.history.pushState(null, "", url.toString());
        }
      }
    }
    return;
  }

  url.searchParams.set("tab", tab);
  if (tab !== "vandaag") {
    url.searchParams.delete("kompas");
    url.searchParams.delete("view");
  }
  if (tab !== "voortgang") {
    url.searchParams.delete("screen");
    url.searchParams.delete("blik");
  } else {
    url.searchParams.delete("screen");
    url.searchParams.delete("blik");
  }
  if (tab === "agenda" || tab === "vandaag") {
    if (nextDag && isValidAgendaDate(nextDag)) {
      url.searchParams.set("dag", nextDag);
    }
  } else {
    url.searchParams.delete("dag");
  }
  window.history.pushState(null, "", url.toString());
}

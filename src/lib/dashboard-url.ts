import type { DashboardTabId, PillarId } from "@/types/dashboard";

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

export function buildDashboardVandaagHref(kompas?: PillarId | null): string {
  const params = new URLSearchParams({ tab: "vandaag" });
  if (kompas) {
    params.set("kompas", kompas);
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

export function syncDashboardTabParam(tab: DashboardTabId): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (url.searchParams.get("tab") === tab) {
    return;
  }
  url.searchParams.set("tab", tab);
  if (tab !== "vandaag") {
    url.searchParams.delete("kompas");
    url.searchParams.delete("view");
  }
  window.history.pushState(null, "", url.toString());
}

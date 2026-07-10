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

export function parseKompasFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const kompas = parsed.searchParams.get("kompas");
  if (kompas && KOMPAS_DOMAIN_IDS.has(kompas as PillarId)) {
    return kompas as PillarId;
  }
  return null;
}

export function syncDashboardKompasParam(domain: PillarId | null): void {
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
  window.history.replaceState(null, "", url.toString());
}

export function syncDashboardTabParam(tab: DashboardTabId): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  if (tab !== "vandaag") {
    url.searchParams.delete("kompas");
  }
  window.history.replaceState(null, "", url.toString());
}

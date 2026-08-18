import { MOVEMENT_FOCUS_ORDER, type MovementFocusKey } from "@/data/movement-checkin";
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
  "domein",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Mijn Dag kent drie blikken; `dag` is de default als `view` ontbreekt of ongeldig is. */
export type AgendaViewId = "dag" | "week" | "maand";

const VALID_AGENDA_VIEWS = new Set<AgendaViewId>(["dag", "week", "maand"]);

export function isAgendaViewId(value: unknown): value is AgendaViewId {
  return typeof value === "string" && VALID_AGENDA_VIEWS.has(value as AgendaViewId);
}

/**
 * `view` is alleen betekenisvol op tab=agenda. Op andere tabs is het een legacy
 * param (bijv. view=stappenplan op vandaag) die hier bewust genegeerd wordt.
 */
export function parseAgendaViewFromUrl(url: string | URL): AgendaViewId {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  if (parsed.searchParams.get("tab") !== "agenda") {
    return "dag";
  }
  const view = parsed.searchParams.get("view");
  return isAgendaViewId(view) ? view : "dag";
}

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

export function isPillarId(value: unknown): value is PillarId {
  return typeof value === "string" && KOMPAS_DOMAIN_IDS.has(value as PillarId);
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

/** Voortgang › domein-scherm (S4): zelfde geldige domein-set als de Kompas-param. */
export function parseVoortgangDomeinFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const domein = parsed.searchParams.get("domein");
  if (domein && KOMPAS_DOMAIN_IDS.has(domein as PillarId)) {
    return domein as PillarId;
  }
  return null;
}

/** Favorieten deep link — scoped view per domein (P4, v3.6 scherm F). */
export function parseFavorietenDomeinFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const fav = parsed.searchParams.get("fav");
  if (fav && KOMPAS_DOMAIN_IDS.has(fav as PillarId)) {
    return fav as PillarId;
  }
  return null;
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

export function isMovementFocusKey(value: unknown): value is MovementFocusKey {
  return (
    typeof value === "string" &&
    (MOVEMENT_FOCUS_ORDER as readonly string[]).includes(value)
  );
}

/**
 * Deeplink van het readout-blok naar de programma-sheet (R0c). `focus` is
 * leesbaar, niet sturend — hij preselecteert niets in de sheet en wijzigt geen
 * hero-copy (F1a-freeze, BESLUIT_BEWEGING L10); hij bestaat zodat een latere
 * slice kan meten welke focus tot welke configuratie leidt.
 */
export function buildMovementRoutingHref(focus: string | null): string {
  const params = new URLSearchParams({ tab: "vandaag", kompas: "beweging", open: "programma" });
  if (isMovementFocusKey(focus)) {
    params.set("focus", focus);
  }
  return `/dashboard?${params.toString()}`;
}

/**
 * Verwijdert `open`/`focus` nadat de sheet ze heeft gelezen — anders heropent
 * een refresh of terug-navigatie de sheet steeds opnieuw. `replaceState`, geen
 * `pushState`: dit is het opruimen van een eenmalige deeplink, geen navigatiestap.
 */
export function stripMovementRoutingParams(): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (!url.searchParams.has("open") && !url.searchParams.has("focus")) {
    return;
  }
  url.searchParams.delete("open");
  url.searchParams.delete("focus");
  window.history.replaceState(null, "", url.toString());
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
  domein?: PillarId | null,
  fav?: PillarId | null,
): string {
  const params = new URLSearchParams({ tab: "voortgang" });
  if (screen && screen !== "hub") {
    params.set("screen", screen);
  }
  if (screen === "statistieken" && blik) {
    params.set("blik", blik);
  }
  if (screen === "domein" && domein) {
    params.set("domein", domein);
  }
  if (screen === "favorieten" && fav) {
    params.set("fav", fav);
  }
  return `/dashboard?${params.toString()}`;
}

export type SyncDashboardVoortgangOptions = {
  blik?: StatistiekenBlik | null;
  domein?: PillarId | null;
  fav?: PillarId | null;
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
    url.searchParams.delete("domein");
    url.searchParams.delete("fav");
  } else {
    url.searchParams.set("screen", screen);
    if (screen === "statistieken" && options?.blik) {
      url.searchParams.set("blik", options.blik);
    } else {
      url.searchParams.delete("blik");
    }
    if (screen === "domein" && options?.domein) {
      url.searchParams.set("domein", options.domein);
    } else {
      url.searchParams.delete("domein");
    }
    if (screen === "favorieten" && options?.fav) {
      url.searchParams.set("fav", options.fav);
    } else {
      url.searchParams.delete("fav");
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

export function buildDashboardAgendaHref(
  dag?: string | null,
  view?: AgendaViewId | null,
): string {
  const params = new URLSearchParams({ tab: "agenda" });
  if (dag && isValidAgendaDate(dag)) {
    params.set("dag", dag);
  }
  if (isAgendaViewId(view)) {
    params.set("view", view);
  }
  return `/dashboard?${params.toString()}`;
}

export function syncDashboardAgendaViewParam(view: AgendaViewId): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  if (url.searchParams.get("tab") !== "agenda") {
    return;
  }
  url.searchParams.set("view", view);
  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function buildDashboardPlanHref(planDomain: string): string {
  if (planDomain === "movement") {
    return buildDashboardVandaagHref("beweging");
  }
  return `/intake/plan/${planDomain}?from=dashboard`;
}

function syncDashboardUrlParams(domain: PillarId | null): void {
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
  url.searchParams.delete("view");

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

  if (currentTab === "vandaag" && currentKompas === domain) {
    return;
  }

  syncDashboardUrlParams(domain);
}

export type SyncDashboardTabOptions = {
  dag?: string | null;
  view?: AgendaViewId | null;
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
    let changed = false;
    if (tab === "agenda" || tab === "vandaag") {
      if (nextDag && isValidAgendaDate(nextDag) && url.searchParams.get("dag") !== nextDag) {
        url.searchParams.set("dag", nextDag);
        changed = true;
      }
    }
    if (
      tab === "agenda" &&
      isAgendaViewId(options?.view) &&
      url.searchParams.get("view") !== options.view
    ) {
      url.searchParams.set("view", options.view);
      changed = true;
    }
    if (changed) {
      window.history.pushState(null, "", url.toString());
    }
    return;
  }

  const carriedAgendaView = parseAgendaViewFromUrl(url);
  url.searchParams.set("tab", tab);
  if (tab !== "vandaag") {
    url.searchParams.delete("kompas");
  }
  if (tab === "agenda") {
    const nextView = isAgendaViewId(options?.view) ? options.view : carriedAgendaView;
    if (nextView === "dag") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", nextView);
    }
  } else {
    url.searchParams.delete("view");
  }
  if (tab !== "voortgang") {
    url.searchParams.delete("screen");
    url.searchParams.delete("blik");
    url.searchParams.delete("domein");
  } else {
    url.searchParams.delete("screen");
    url.searchParams.delete("blik");
    url.searchParams.delete("domein");
    url.searchParams.delete("fav");
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

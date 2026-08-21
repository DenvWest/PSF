import { MOVEMENT_FOCUS_ORDER, type MovementFocusKey } from "@/data/movement-checkin";
import { hasSchap } from "@/lib/schap-availability";
import type { DashboardTabId, PillarId, SchapTabId, VoortgangScreen } from "@/types/dashboard";

const VALID_VOORTGANG_SCREENS = new Set<VoortgangScreen>([
  "hub",
  "inzichten",
  "leefstijlprofiel",
  "favorieten",
  "schap",
  "domein",
]);

const LEGACY_VOORTGANG_SCREEN_ALIASES: Record<string, VoortgangScreen> = {
  statistieken: "hub",
  lichaamssamenstelling: "hub",
  inzichten: "leefstijlprofiel",
  domein: "leefstijlprofiel",
};

export type LegacyVoortgangScreen = keyof typeof LEGACY_VOORTGANG_SCREEN_ALIASES;

export function getLegacyVoortgangScreenAlias(raw: string | null): LegacyVoortgangScreen | null {
  if (!raw || !(raw in LEGACY_VOORTGANG_SCREEN_ALIASES)) {
    return null;
  }
  return raw as LegacyVoortgangScreen;
}

/** Vervangt legacy `screen`-waarden in-place; retourneert de canonieke screen of null. */
export function canonicalizeVoortgangScreenParam(url: URL): VoortgangScreen | null {
  const rawScreen = url.searchParams.get("screen");

  // Tot 20 augustus droeg `screen=favorieten` twee schermen: mét `fav` was het
  // het schap van dat domein, zonder `fav` je bewaarde lijst. Die twee zijn nu
  // gesplitst. Oude links en bookmarks dragen de eerste vorm nog, dus die
  // vertalen we hier — het domein is precies wat ze uit elkaar houdt.
  if (rawScreen === "favorieten") {
    const fav = url.searchParams.get("fav");
    if (fav && KOMPAS_DOMAIN_IDS.has(fav as PillarId) && hasSchap(fav as PillarId)) {
      url.searchParams.set("screen", "schap");
      return "schap";
    }
    url.searchParams.delete("fav");
    url.searchParams.delete("schap");
    return null;
  }

  const legacy = getLegacyVoortgangScreenAlias(rawScreen);
  if (!legacy) {
    return null;
  }
  const canonical = LEGACY_VOORTGANG_SCREEN_ALIASES[legacy];
  url.searchParams.delete("blik");
  if (canonical === "hub") {
    url.searchParams.delete("screen");
    url.searchParams.delete("domein");
    url.searchParams.delete("fav");
  } else {
    url.searchParams.set("screen", canonical);
    if (legacy === "domein") {
      const domein = url.searchParams.get("domein");
      url.searchParams.delete("domein");
      if (domein && KOMPAS_DOMAIN_IDS.has(domein as PillarId)) {
        url.searchParams.set("fav", domein);
      }
    }
    if (legacy === "inzichten") {
      url.searchParams.delete("fav");
    }
  }
  return canonical;
}

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

/** Leefstijlprofiel / Favorieten deep link — scoped view per domein. */
export function parseLeefstijlprofielDomeinFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const fav = parsed.searchParams.get("fav");
  if (fav && KOMPAS_DOMAIN_IDS.has(fav as PillarId)) {
    return fav as PillarId;
  }
  const screen = parsed.searchParams.get("screen");
  if (screen === "domein") {
    const domein = parsed.searchParams.get("domein");
    if (domein && KOMPAS_DOMAIN_IDS.has(domein as PillarId)) {
      return domein as PillarId;
    }
  }
  return null;
}

/** @deprecated Gebruik parseLeefstijlprofielDomeinFromUrl */
export const parseFavorietenDomeinFromUrl = parseLeefstijlprofielDomeinFromUrl;

const VALID_SCHAP_TABS = new Set<SchapTabId>([
  "leefstijl",
  "producten",
  "diensten",
  "begeleiding",
]);

export function isSchapTabId(value: unknown): value is SchapTabId {
  return typeof value === "string" && VALID_SCHAP_TABS.has(value as SchapTabId);
}

/** Sub-tab van het schap — alleen betekenisvol op `screen=schap`. */
export function parseSchapTabFromUrl(url: string | URL): SchapTabId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const schap = parsed.searchParams.get("schap");
  return isSchapTabId(schap) ? schap : null;
}

/**
 * Deeplink naar het schap van één domein, optioneel direct op een sub-tab.
 *
 * Het schap is niet Favorieten (20 augustus). Favorieten is wat jij bewaarde;
 * dit is het aanbod van dit domein. Ze deelden tot vandaag één `screen`-waarde
 * en dus één naam in de rail, met twee verschillende schermen erachter — welk
 * scherm je kreeg hing af van of je toevallig via een domein binnenkwam.
 */
export function buildDashboardSchapHref(domain: PillarId, tab?: SchapTabId | null): string {
  const params = new URLSearchParams({ tab: "voortgang", screen: "schap", fav: domain });
  if (isSchapTabId(tab)) {
    params.set("schap", tab);
  }
  return `/dashboard?${params.toString()}`;
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

function normalizeVoortgangScreen(raw: string | null): VoortgangScreen {
  if (!raw || raw === "hub") {
    return "hub";
  }
  const alias = LEGACY_VOORTGANG_SCREEN_ALIASES[raw];
  if (alias) {
    return alias;
  }
  if (VALID_VOORTGANG_SCREENS.has(raw as VoortgangScreen)) {
    return raw as VoortgangScreen;
  }
  return "hub";
}

export function parseVoortgangScreenFromUrl(url: string | URL): VoortgangScreen {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const screen = parsed.searchParams.get("screen");
  // `favorieten` mét een domein dát een schap heeft is de oude naam van het
  // schap. Legacy screens worden hier gelezen, niet herschreven — de URL
  // opschonen doet `canonicalizeVoortgangScreenParam`, en dat draait alleen op
  // popstate. Wie een oude bookmark opent moet ook zónder die opschoning op
  // het juiste scherm landen.
  if (screen === "favorieten") {
    const fav = parsed.searchParams.get("fav");
    if (fav && KOMPAS_DOMAIN_IDS.has(fav as PillarId) && hasSchap(fav as PillarId)) {
      return "schap";
    }
  }
  return normalizeVoortgangScreen(screen);
}

export function buildDashboardVoortgangHref(
  screen?: VoortgangScreen | null,
  _blik?: null,
  domein?: PillarId | null,
  fav?: PillarId | null,
): string {
  const params = new URLSearchParams({ tab: "voortgang" });
  let resolvedScreen = screen && screen !== "hub" ? screen : null;
  let resolvedFav = fav ?? null;

  if (resolvedScreen === "domein") {
    resolvedScreen = "leefstijlprofiel";
    resolvedFav = resolvedFav ?? domein ?? null;
  }
  if (resolvedScreen === "inzichten") {
    resolvedScreen = "leefstijlprofiel";
  }

  if (resolvedScreen) {
    params.set("screen", resolvedScreen);
  }
  if ((resolvedScreen === "leefstijlprofiel" || resolvedScreen === "schap") && resolvedFav) {
    params.set("fav", resolvedFav);
  }
  return `/dashboard?${params.toString()}`;
}

export type SyncDashboardVoortgangOptions = {
  domein?: PillarId | null;
  fav?: PillarId | null;
  /** Sub-tab van het schap — alleen betekenisvol op `screen=schap`. */
  schap?: SchapTabId | null;
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
  url.searchParams.delete("blik");

  if (screen === "hub") {
    url.searchParams.delete("screen");
    url.searchParams.delete("domein");
    url.searchParams.delete("fav");
    url.searchParams.delete("schap");
  } else {
    url.searchParams.set("screen", screen);
    url.searchParams.delete("domein");
    if ((screen === "leefstijlprofiel" || screen === "schap") && options?.fav) {
      url.searchParams.set("fav", options.fav);
    } else {
      url.searchParams.delete("fav");
    }
    if (screen === "schap" && isSchapTabId(options?.schap)) {
      url.searchParams.set("schap", options.schap);
    } else {
      url.searchParams.delete("schap");
    }
  }

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
    url.searchParams.delete("fav");
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

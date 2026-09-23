import { MOVEMENT_FOCUS_ORDER, type MovementFocusKey } from "@/data/movement-checkin";
import { hasSchap } from "@/lib/schap-availability";
import type { DashboardTabId, PillarId, SchapTabId, VoortgangScreen } from "@/types/dashboard";

const VALID_VOORTGANG_SCREENS = new Set<VoortgangScreen>(["hub", "hermeting"]);

/**
 * Alles wat vóór 23 september een eigen scherm was — Leefstijlprofiel (de
 * domeinhub), het losse weekoverzicht, en hun eigen legacy-namen van dáárvoor
 * — landt nu op de hub. `fav`/`laag`/`domein` op tab=voortgang worden overal
 * waar deze tabel wordt toegepast mee opgeruimd.
 */
const LEGACY_VOORTGANG_SCREEN_ALIASES: Record<string, VoortgangScreen> = {
  statistieken: "hub",
  lichaamssamenstelling: "hub",
  inzichten: "hub",
  domein: "hub",
  leefstijlprofiel: "hub",
  weekoverzicht: "hub",
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

  // `screen=favorieten` mét een domein dat een schap heeft is de oude naam
  // van dat schap (22 aug) — `canonicalizeDashboardTabParam` herschrijft die
  // route naar `tab=keuze` vóórdat deze functie draait. Komt hij hier tóch
  // langs (geen schap-domein), dan is de hub de eerlijkste landing.
  if (rawScreen === "favorieten") {
    url.searchParams.delete("screen");
    url.searchParams.delete("fav");
    url.searchParams.delete("laag");
    url.searchParams.delete("schap");
    url.searchParams.delete("domein");
    return "hub";
  }

  const legacy = getLegacyVoortgangScreenAlias(rawScreen);
  if (!legacy) {
    return null;
  }
  url.searchParams.delete("blik");
  url.searchParams.delete("screen");
  url.searchParams.delete("domein");
  url.searchParams.delete("fav");
  url.searchParams.delete("laag");
  return "hub";
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

const VALID_SCHAP_TABS = new Set<SchapTabId>([
  "producten",
  "diensten",
  "begeleiding",
  "logboek",
  "favorieten",
]);

export function isSchapTabId(value: unknown): value is SchapTabId {
  return typeof value === "string" && VALID_SCHAP_TABS.has(value as SchapTabId);
}

/**
 * Sub-tab van de Keuze-tab: `deel=` op `tab=keuze`.
 *
 * Leest ook nog de oude naam (`schap=` op `screen=schap`), zodat bookmarks van
 * vóór 27 augustus op hetzelfde onderdeel landen in plaats van op Producten.
 */
export function parseKeuzeDeelFromUrl(url: string | URL): SchapTabId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const deel = parsed.searchParams.get("deel");
  if (isSchapTabId(deel)) {
    return deel;
  }
  const legacy = parsed.searchParams.get("schap");
  return isSchapTabId(legacy) ? legacy : null;
}

/**
 * Het domein waarvan de Keuze-tab het aanbod toont: `domein=` op `tab=keuze`.
 *
 * Valt terug op de oude `fav=`-param, want die droeg het schap tot 27 augustus.
 * `null` betekent niet "geen domein" maar "kies zelf" — de caller vult dan aan
 * met je prioriteitsdomein (zie `resolveSchapDomain`).
 */
export function parseKeuzeDomeinFromUrl(url: string | URL): PillarId | null {
  const parsed =
    typeof url === "string" ? new URL(url, "http://localhost") : new URL(url.toString());
  const domein = parsed.searchParams.get("domein");
  if (domein && KOMPAS_DOMAIN_IDS.has(domein as PillarId)) {
    return domein as PillarId;
  }
  const fav = parsed.searchParams.get("fav");
  if (fav && KOMPAS_DOMAIN_IDS.has(fav as PillarId)) {
    return fav as PillarId;
  }
  return null;
}

/**
 * Deeplink naar de Keuze-tab van één domein, optioneel direct op een onderdeel.
 *
 * `deel: "favorieten"` opent het archief van dít domein — sinds 22 augustus de
 * enige plek waar "wat jij bewaarde" nog leeft; het losse, domein-overstijgende
 * Favorieten-scherm is opgeheven.
 *
 * Sinds 27 augustus is dit een eigen tab (`tab=keuze`) in plaats van een scherm
 * binnen Voortgang. Elke deur naar het aanbod loopt via déze bouwer — dat was
 * al zo, en daardoor kostte de verhuizing één functie in plaats van tien
 * losse hrefs.
 */
export function buildDashboardKeuzeHref(domain: PillarId, deel?: SchapTabId | null): string {
  const params = new URLSearchParams({ tab: "keuze", domein: domain });
  if (isSchapTabId(deel)) {
    params.set("deel", deel);
  }
  return `/dashboard?${params.toString()}`;
}

export function syncDashboardKeuzeParams(
  domain: PillarId | null,
  deel: SchapTabId | null,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set("tab", "keuze");
  url.searchParams.delete("kompas");
  url.searchParams.delete("view");
  url.searchParams.delete("dag");
  url.searchParams.delete("blik");
  url.searchParams.delete("screen");
  url.searchParams.delete("fav");
  url.searchParams.delete("laag");
  url.searchParams.delete("schap");

  if (domain) {
    url.searchParams.set("domein", domain);
  } else {
    url.searchParams.delete("domein");
  }
  if (isSchapTabId(deel)) {
    url.searchParams.set("deel", deel);
  } else {
    url.searchParams.delete("deel");
  }

  const nextHref = url.toString();
  if (nextHref === window.location.href) {
    return;
  }
  window.history.pushState(null, "", nextHref);
}

/**
 * Routes van vóór 27 augustus, toen Hermeting een tab was en het schap een
 * Voortgang-scherm. Herschrijft de URL in-place en geeft de tab terug waar hij
 * nu op uitkomt; `null` als er niets legacy aan is.
 *
 * Twee verhuizingen, één functie — ze zitten in dezelfde ruil en een halve
 * migratie (wel de tab, niet het scherm) laat je op een leeg tabblad landen.
 */
export function canonicalizeDashboardTabParam(url: URL): DashboardTabId | null {
  const tab = url.searchParams.get("tab");

  if (tab === "hermeting") {
    url.searchParams.set("tab", "voortgang");
    url.searchParams.set("screen", "hermeting");
    url.searchParams.delete("domein");
    url.searchParams.delete("fav");
    url.searchParams.delete("laag");
    url.searchParams.delete("deel");
    url.searchParams.delete("schap");
    return "voortgang";
  }

  if (tab !== "voortgang") {
    return null;
  }

  const screen = url.searchParams.get("screen");
  if (screen !== "schap" && screen !== "favorieten") {
    return null;
  }

  const domein = parseKeuzeDomeinFromUrl(url);
  if (!domein || !hasSchap(domein)) {
    return null;
  }

  const deel = parseKeuzeDeelFromUrl(url);
  url.searchParams.set("tab", "keuze");
  url.searchParams.set("domein", domein);
  url.searchParams.delete("screen");
  url.searchParams.delete("fav");
  url.searchParams.delete("laag");
  url.searchParams.delete("schap");
  url.searchParams.delete("blik");
  if (deel) {
    url.searchParams.set("deel", deel);
  } else {
    url.searchParams.delete("deel");
  }
  return "keuze";
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
  return normalizeVoortgangScreen(parsed.searchParams.get("screen"));
}

export function buildDashboardVoortgangHref(screen?: VoortgangScreen | null): string {
  const params = new URLSearchParams({ tab: "voortgang" });
  if (screen === "hermeting") {
    params.set("screen", "hermeting");
  }
  return `/dashboard?${params.toString()}`;
}

export function syncDashboardVoortgangScreenParam(screen: VoortgangScreen): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("tab", "voortgang");
  url.searchParams.delete("kompas");
  url.searchParams.delete("view");
  url.searchParams.delete("dag");
  url.searchParams.delete("blik");
  url.searchParams.delete("domein");
  url.searchParams.delete("fav");
  url.searchParams.delete("laag");
  url.searchParams.delete("deel");
  url.searchParams.delete("schap");

  if (screen === "hermeting") {
    url.searchParams.set("screen", "hermeting");
  } else {
    url.searchParams.delete("screen");
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
  // Elke tabwissel start op het eerste scherm van die tab: geen screen, geen
  // domein-scoping die uit een ander tabblad meereist. De Keuze-tab vult
  // `domein`/`deel` zelf aan zodra hij weet welk schap hij opent.
  url.searchParams.delete("screen");
  url.searchParams.delete("blik");
  url.searchParams.delete("domein");
  url.searchParams.delete("fav");
  url.searchParams.delete("laag");
  url.searchParams.delete("deel");
  url.searchParams.delete("schap");
  if (tab === "agenda" || tab === "vandaag") {
    if (nextDag && isValidAgendaDate(nextDag)) {
      url.searchParams.set("dag", nextDag);
    }
  } else {
    url.searchParams.delete("dag");
  }
  window.history.pushState(null, "", url.toString());
}

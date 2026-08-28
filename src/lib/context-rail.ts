import { PILLAR } from "@/data/dashboard";
import { buildDashboardKeuzeHref } from "@/lib/dashboard-url";
import { hasSchap, schapGateReason } from "@/lib/schap-availability";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

export type VoortgangRailItemId = "hub" | "leefstijlprofiel" | "hermeting";

/**
 * Contextuele linker rail (slice 1): pure bouwers voor wat de rail toont.
 * De rail heeft vijf modi — profiel (geen Kompas-context), Kompas-home
 * (domeinlijst), domein-tools (open domein: Kompas-knop + domeinlijst +
 * eigen tools indien aanwezig — nu alleen beweging heeft die), voortgang
 * (Bekijken-navigatie op Voortgang) en keuze (welk schap je opent). Alle
 * navigatie-logica blijft in de caller (KompasHome resp. Dashboard.tsx); hier
 * zit alleen de vorm.
 */

export type ContextRailMode =
  | "profile"
  | "kompasHome"
  | "domainTools"
  | "voortgang"
  | "keuze";

export type ContextRailDomainItem = {
  id: PillarId;
  label: string;
  icon: string;
  color: string;
  score: number;
};

export type ContextRailToolId = "checkin" | "schap" | "gids";

export type ContextRailTool = {
  id: ContextRailToolId;
  label: string;
  icon: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  disabledHint?: string;
};

export type ContextRailApi = {
  mode: ContextRailMode;
  domains: ContextRailDomainItem[];
  tools: ContextRailTool[];
  onOpenDomain: (id: PillarId) => void;
  onBackToKompas: () => void;
  onToolClick: (id: ContextRailToolId) => void;
} | null;

export const KOMPAS_RAIL_PILLAR_IDS: PillarId[] = [
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
];

export function buildKompasRailDomains(
  scores: Record<string, number>,
): ContextRailDomainItem[] {
  return KOMPAS_RAIL_PILLAR_IDS.map((id) => {
    const pillar = PILLAR[id];
    return {
      id,
      label: pillar.label,
      icon: pillar.icon,
      color: pillar.color,
      score: Math.round(scores[id] ?? 0),
    };
  });
}

/**
 * Per domein de check die dat domein meet. De dag-interventie ("reset",
 * "je moment") stond hier ook, maar is er 19 aug weer uit gehaald: hij wordt
 * pas ingesteld als dat scherm echt gebouwd is.
 */
const DOMAIN_CHECK: Partial<Record<PillarId, { label: string; href: string }>> = {
  beweging: { label: "Beweegcheck", href: "/intake/beweging?from=dashboard&kompas=beweging" },
  slaap: { label: "Slaapcheck", href: "/intake/slaap?from=dashboard&kompas=slaap" },
  stress: { label: "Stresscheck", href: "/intake/stress?from=dashboard&kompas=stress" },
  voeding: { label: "Voedingscheck", href: "/intake/voeding?from=dashboard&kompas=voeding" },
};

const DOMAIN_GIDS: Partial<Record<PillarId, { label: string; href: string }>> = {
  beweging: { label: "Bewegingsgids", href: "/gids/beweging" },
  slaap: { label: "Slaapgids", href: "/gids/slaap" },
};

export function buildDomainRailTools(domain: PillarId): ContextRailTool[] {
  const tools: ContextRailTool[] = [];

  const check = DOMAIN_CHECK[domain];
  tools.push(
    check
      ? { id: "checkin", label: check.label, icon: "Activity", href: check.href }
      : {
          // Verbinding heeft geen eigen intake-route: die vraag loopt mee in
          // de hermeting. Een dode link zou dat verbergen.
          id: "checkin",
          label: "Verbindingscheck",
          icon: "Activity",
          disabled: true,
          disabledHint: "Verbinding meet mee in je hermeting — geen aparte check.",
        },
  );

  if (hasSchap(domain)) {
    tools.push({
      id: "schap",
      label: "Keuze",
      icon: "Pill",
      href: buildDashboardKeuzeHref(domain, "producten"),
    });
  }

  const gids = DOMAIN_GIDS[domain];
  if (gids) {
    tools.push({ id: "gids", label: gids.label, icon: "Mail", href: gids.href });
  }

  return tools;
}

export type ContextRailVoortgangItem = {
  id: VoortgangRailItemId;
  label: string;
  icon: string;
};

/**
 * Favorieten staat sinds 21 augustus niet meer als los item in deze rail: het
 * schap draagt zelf een Favorieten-tab (per domein gefilterd), dus een
 * tweede, domein-overstijgende ingang hier was dubbel.
 *
 * Sinds 27 augustus staat het schap hier helemaal niet meer: het is de
 * Keuze-tab in de hoofdnavigatie geworden. Op de vrijgekomen plek staat
 * Hermeting — die was een eigen tab, terwijl hij hoort bij de meetreeksen
 * die hij voedt.
 */
export const VOORTGANG_RAIL_ITEMS: ContextRailVoortgangItem[] = [
  { id: "hub", label: "Overzicht", icon: "Home" },
  { id: "leefstijlprofiel", label: "Leefstijlprofiel", icon: "User" },
  { id: "hermeting", label: "Hermeting", icon: "Calendar" },
];

export function resolveVoortgangRailActiveItem(screen: VoortgangScreen): VoortgangRailItemId {
  if (screen === "hermeting") {
    return "hermeting";
  }
  if (
    screen === "leefstijlprofiel" ||
    screen === "inzichten" ||
    screen === "domein"
  ) {
    return "leefstijlprofiel";
  }
  // `schap` is legacy en wordt bij binnenkomst naar de Keuze-tab herschreven;
  // komt hij hier toch langs, dan is Overzicht de eerlijkste plek.
  return "hub";
}

export type ContextRailKeuzeItem = {
  id: PillarId;
  label: string;
  icon: string;
  color: string;
  /** Waar geen schap is, staat het domein er wél maar dicht — mét de reden. */
  disabledHint?: string;
};

/**
 * De domeinschakelaar van de Keuze-tab, gedeeld door de linker rail (md+) en de
 * chiprij in `SchapView` (daaronder). Volgt `SCHAP_DOMAINS` en
 * `schapGateReason`, dus een domein dat er later een schap bij krijgt gaat hier
 * vanzelf open — één bron, geen tweede lijst die uit de pas kan lopen.
 *
 * De twee gesloten domeinen staan er wél in. Dat geen schap hebben is een
 * oordeel, geen ontbrekende lijst (BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1 §D5,
 * §E1, §E2), en een onzichtbare poort leest als een gat in het product.
 */
export function buildKeuzeRailDomains(): ContextRailKeuzeItem[] {
  return KOMPAS_RAIL_PILLAR_IDS.map((id) => {
    const pillar = PILLAR[id];
    const gate = schapGateReason(id);
    return {
      id,
      label: pillar.label,
      icon: pillar.icon,
      color: pillar.color,
      ...(gate ? { disabledHint: gate } : {}),
    };
  });
}

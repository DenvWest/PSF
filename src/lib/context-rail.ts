import { PILLAR } from "@/data/dashboard";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

type VoortgangRailItemId = "hub" | "inzichten" | "leefstijlprofiel";

/**
 * Contextuele linker rail (slice 1): pure bouwers voor wat de rail toont.
 * De rail heeft vier modi — profiel (geen Kompas-context), Kompas-home
 * (domeinlijst), domein-tools (open domein: Kompas-knop + domeinlijst +
 * eigen tools indien aanwezig — nu alleen beweging heeft die) en voortgang
 * (Bekijken-navigatie op Voortgang). Alle navigatie-logica blijft in de
 * caller (KompasHome resp. Dashboard.tsx); hier zit alleen de vorm.
 */

export type ContextRailMode = "profile" | "kompasHome" | "domainTools" | "voortgang";

export type ContextRailDomainItem = {
  id: PillarId;
  label: string;
  icon: string;
  color: string;
  score: number;
};

export type ContextRailToolId = "checkin" | "gids";

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

export function buildBewegingRailTools(): ContextRailTool[] {
  return [
    {
      id: "checkin",
      label: "Beweegcheck",
      icon: "Activity",
      href: "/intake/beweging?from=dashboard&kompas=beweging",
    },
    {
      id: "gids",
      label: "Bewegingsgids",
      icon: "Mail",
      href: "/gids/beweging",
    },
  ];
}

export type ContextRailVoortgangItem = {
  id: VoortgangRailItemId;
  label: string;
  icon: string;
};

export const VOORTGANG_RAIL_ITEMS: ContextRailVoortgangItem[] = [
  { id: "hub", label: "Overzicht", icon: "Home" },
  { id: "inzichten", label: "Jouw inzichten", icon: "Spark" },
  { id: "leefstijlprofiel", label: "Leefstijlprofiel", icon: "Heart" },
];

/**
 * Drill-down schermen (`domein`) lichten Overzicht op — geen apart rail-item.
 */
export function resolveVoortgangRailActiveItem(
  screen: VoortgangScreen,
): VoortgangRailItemId {
  if (screen === "domein") {
    return "hub";
  }
  if (screen === "leefstijlprofiel") {
    return "leefstijlprofiel";
  }
  if (screen === "inzichten") {
    return "inzichten";
  }
  return "hub";
}

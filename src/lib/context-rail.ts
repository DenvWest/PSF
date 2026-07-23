import { PILLAR } from "@/data/dashboard";
import type { KompasDeepView } from "@/lib/dashboard-url";
import type { PillarId } from "@/types/dashboard";

/**
 * Contextuele linker rail (slice 1): pure bouwers voor wat de rail toont.
 * De rail heeft drie modi — profiel (geen Kompas-context), Kompas-home
 * (domeinlijst) en domein-tools (nu alleen beweging). Alle navigatie-logica
 * blijft in KompasHome; hier zit alleen de vorm.
 */

export type ContextRailMode = "profile" | "kompasHome" | "domainTools";

export type ContextRailDomainItem = {
  id: PillarId;
  label: string;
  icon: string;
  color: string;
  score: number;
};

export type ContextRailToolId =
  | "vandaag"
  | "stappenplan"
  | "checkin"
  | "supplementen"
  | "gids"
  | "inzichten";

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
  deepView: KompasDeepView;
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

export const BEWEGING_SUPPLEMENT_ANCHOR = "beweging-supplementen";

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

export function buildBewegingRailTools(input: {
  deepView: KompasDeepView;
  nutritionLogCompleted: boolean;
  /**
   * Nu niet gedragsbepalend: zonder aanbevelingen blijft de knop bruikbaar,
   * want de sectie zelf legt dan uit waarom er geen signalen zijn.
   */
  hasRecommendations: boolean;
}): ContextRailTool[] {
  const supplementsLocked = !input.nutritionLogCompleted;

  return [
    {
      id: "vandaag",
      label: "Vandaag",
      icon: "Home",
      active: input.deepView === "cockpit",
    },
    {
      id: "stappenplan",
      label: "Stappenplan",
      icon: "RouteMap",
      active: input.deepView === "stappenplan",
    },
    {
      id: "checkin",
      label: "Beweegcheck",
      icon: "Activity",
      href: "/intake/beweging?from=dashboard&kompas=beweging",
    },
    {
      id: "supplementen",
      label: "Supplementen",
      icon: "Pill",
      disabled: supplementsLocked,
      disabledHint: supplementsLocked
        ? "Doe eerst de voedingscheck — eerst tafel, dan potje."
        : undefined,
    },
    {
      id: "gids",
      label: "Bewegingsgids",
      icon: "Mail",
      href: "/gids/beweging",
    },
    {
      id: "inzichten",
      label: "Leefstijl & inzichten",
      icon: "BookOpen",
      href: "/inzichten",
    },
  ];
}

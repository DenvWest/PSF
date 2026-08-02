import { PILLAR } from "@/data/dashboard";
import type { PillarId } from "@/types/dashboard";

/**
 * Contextuele linker rail (slice 1): pure bouwers voor wat de rail toont.
 * De rail heeft drie modi — profiel (geen Kompas-context), Kompas-home
 * (domeinlijst) en domein-tools (open domein: Kompas-knop + domeinlijst +
 * eigen tools indien aanwezig — nu alleen beweging heeft die). Alle
 * navigatie-logica blijft in KompasHome; hier zit alleen de vorm.
 */

export type ContextRailMode = "profile" | "kompasHome" | "domainTools";

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

/**
 * Supplementen en "Leefstijl & inzichten" zijn hier weg (verdict-S5): het
 * oordeel woont voortaan op Statistieken › Advies, en /inzichten staat al in
 * de top-nav — een tweede ingang op de doe-surface is ruis.
 */
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

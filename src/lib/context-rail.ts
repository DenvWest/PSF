import { PILLAR } from "@/data/dashboard";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

type VoortgangRailItemId = "hub" | "statistieken" | "inzichten" | "favorieten";

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

export type ContextRailVoortgangItem = {
  id: VoortgangRailItemId;
  label: string;
  icon: string;
};

/**
 * Statisch — geen per-gebruiker data nodig, dus geen builder-functie zoals
 * bij de Kompas-domeinen. De vier items dekken exact wat vandaag al
 * bereikbaar is via `VoortgangHub`'s screen-state; de rail is een nieuwe,
 * persistente ingang op bestaande navigatie, geen nieuwe routing.
 */
export const VOORTGANG_RAIL_ITEMS: ContextRailVoortgangItem[] = [
  { id: "hub", label: "Overzicht", icon: "Home" },
  { id: "statistieken", label: "Statistieken", icon: "BarChart" },
  { id: "inzichten", label: "Jouw inzichten", icon: "Spark" },
  { id: "favorieten", label: "Favorieten", icon: "Heart" },
];

/**
 * Twee Voortgang-schermen staan niet in `VOORTGANG_RAIL_ITEMS` en lichtten
 * daardoor niets op in de rail: `domein` (bijv. Voortgang › Beweging) en
 * `lichaamssamenstelling`. Beide zijn een drill-down, geen zusje van de vier
 * rail-items — hun `goBack()` in VoortgangHub.tsx bevestigt dat al: `domein`
 * gaat terug naar `hub`, `lichaamssamenstelling` naar `statistieken`. Deze
 * functie spiegelt diezelfde hiërarchie naar de rail, zodat de gebruiker op
 * Voortgang › Beweging ziet dat hij ergens ónder "Overzicht" zit, in plaats
 * van een rail waar niets brandt.
 */
export function resolveVoortgangRailActiveItem(
  screen: VoortgangScreen,
): VoortgangRailItemId {
  if (screen === "domein") {
    return "hub";
  }
  if (screen === "lichaamssamenstelling") {
    return "statistieken";
  }
  return screen;
}

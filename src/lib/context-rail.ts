import { PILLAR } from "@/data/dashboard";
import type { PillarId, VoortgangScreen } from "@/types/dashboard";

export type VoortgangRailItemId = "hub" | "leefstijlprofiel" | "schap" | "favorieten";

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
 * Schap en Favorieten zijn twee items, geen twee namen voor één (20 augustus).
 * Het schap is het aanbod van je prioriteitsdomein en verdwijnt uit de rail
 * zodra dat domein er geen heeft; Favorieten is je bewaarde lijst en staat er
 * altijd, want die kan hooguit leeg zijn.
 */
export const VOORTGANG_RAIL_ITEMS: ContextRailVoortgangItem[] = [
  { id: "hub", label: "Overzicht", icon: "Home" },
  { id: "leefstijlprofiel", label: "Leefstijlprofiel", icon: "User" },
  { id: "schap", label: "Schap", icon: "Pill" },
  { id: "favorieten", label: "Favorieten", icon: "Heart" },
];

export function resolveVoortgangRailActiveItem(screen: VoortgangScreen): VoortgangRailItemId {
  if (screen === "favorieten") {
    return "favorieten";
  }
  if (screen === "schap") {
    return "schap";
  }
  if (
    screen === "leefstijlprofiel" ||
    screen === "inzichten" ||
    screen === "domein"
  ) {
    return "leefstijlprofiel";
  }
  return "hub";
}

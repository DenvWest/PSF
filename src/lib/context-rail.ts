import { PILLAR } from "@/data/dashboard";
import {
  buildDashboardKeuzeHref,
  voedingLaagSlugFromId,
  type VoedingLaagId,
  type VoedingLaagSlug,
} from "@/lib/dashboard-url";
import { hasSchap, schapGateReason } from "@/lib/schap-availability";
import { DRIELUIK, hoofdLaag } from "@/lib/voeding-drieluik";
import { zichtbareDomeinen } from "@/lib/zichtbare-domeinen";
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

/**
 * De domeinen in de Kompas-rail.
 *
 * Verbinding staat er niet meer bij: zie `zichtbare-domeinen.ts` voor waarom
 * het domein wel gemeten maar niet getoond wordt. De filter loopt over de
 * volle lijst zodat terugzetten één plek is.
 */
export const KOMPAS_RAIL_PILLAR_IDS: PillarId[] = zichtbareDomeinen([
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
]);

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

/**
 * Domeinen onder Leefstijlprofiel in de Voortgang-rail (desktop) en de
 * inklapbare balk (onder md). Slaap, stress en beweging blijven in Kompas
 * en op de hub; hun ladderlagen zijn hier nog leeg, dus staan ze niet in
 * deze boom. Terugzetten is deze lijst uitbreiden — niet `VERBORGEN_DOMEINEN`.
 */
export const VOORTGANG_RAIL_PILLAR_IDS: readonly PillarId[] = ["voeding"];

export function buildVoortgangRailDomains(
  scores: Record<string, number>,
): ContextRailDomainItem[] {
  return buildKompasRailDomains(scores).filter((domain) =>
    VOORTGANG_RAIL_PILLAR_IDS.includes(domain.id),
  );
}

export type VoedingRailLayer = {
  id: VoedingLaagId;
  slug: VoedingLaagSlug;
  label: string;
};

/**
 * De drie knoppen van Voeding, ook in de rail — zelfde namen en zelfde
 * volgorde als het scherm.
 *
 * Leest rechtstreeks uit `DRIELUIK` en niet meer uit `NUTRITION_LAYERS`. Die
 * eerste draagt de *knop*namen, die tweede de namen van de piramidelagen, en
 * dat zijn sinds 5 september niet meer dezelfde: de knop die de lagen 1, 2 en 4
 * bundelt heet Voedingsstatus, terwijl laag 1 in de canon Voedingsbasis blijft
 * heten. De rail las de laagnaam, dus stond in de navigatie een andere naam dan
 * op de knop waar hij heen ging — precies de fout die deze afleiding moest
 * voorkomen.
 */
export const VOEDING_RAIL_LAYERS: readonly VoedingRailLayer[] = DRIELUIK.map(
  (stap) => ({
    id: hoofdLaag(stap) as VoedingLaagId,
    slug: voedingLaagSlugFromId(hoofdLaag(stap)) as VoedingLaagSlug,
    label: stap.naam,
  }),
);

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

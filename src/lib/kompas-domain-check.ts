import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import type { PillarId } from "@/types/dashboard";

/**
 * Dagen tussen twee domeinchecks. Twee weken is de kortste periode waarin een
 * domeinscore betekenisvol kan bewegen (korter meet je dagruis), en het geeft
 * precies één verdieping binnen de 30-daagse hermetingscyclus.
 */
export const DOMAIN_CHECK_INTERVAL_DAYS = 14;

/** Lengte van de hermetingscyclus — bron voor het verbinding-aftellen. */
const REMEASURE_CYCLE_DAYS = 30;

/** Domeinen met een eigen check-flow. Verbinding meet alleen mee in de hermeting. */
export const DOMAIN_CHECK_PILLAR_IDS: PillarId[] = [
  "slaap",
  "beweging",
  "voeding",
  "stress",
];

const CHECK_NAME: Partial<Record<PillarId, string>> = {
  slaap: "slaapcheck",
  beweging: "beweegcheck",
  voeding: "voedingscheck",
  stress: "stresscheck",
};

/** Dagen sinds de laatste eigen domeincheck; ontbreekt = nog nooit gedaan. */
export type DomainCheckTimings = Partial<Record<PillarId, number>>;

export type DomainCheckStatus =
  | "never"
  | "due"
  | "counting"
  | "fresh"
  | "remeasure";

export type DomainCheckState = {
  domain: PillarId;
  status: DomainCheckStatus;
  /** Kan de gebruiker de check nu doen? */
  actionable: boolean;
  /** Is dit de ene check die we uitlichten? */
  highlighted: boolean;
  label: string;
  ctaLabel: string | null;
  href: string | null;
  daysUntil: number | null;
  /** 0..1 — hoe ver de wachttijd is verstreken (vol = klaar). */
  progress: number;
};

type BuildDomainCheckStatesInput = {
  timings: DomainCheckTimings;
  priorityId: PillarId;
  remeasureDaysUntil: number | null;
};

export function buildDomainCheckHref(domain: PillarId): string {
  return `/intake/${domain}?from=dashboard&kompas=${domain}`;
}

export function supportsDomainCheck(domain: PillarId): boolean {
  return DOMAIN_CHECK_PILLAR_IDS.includes(domain);
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function daysPhrase(days: number): string {
  if (days <= 0) {
    return "vandaag";
  }
  if (days === 1) {
    return "morgen";
  }
  return `over ${days} dagen`;
}

function buildRemeasureState(
  domain: PillarId,
  remeasureDaysUntil: number | null,
): DomainCheckState {
  const days = remeasureDaysUntil;
  const label =
    days == null
      ? "Meet mee in je hermeting"
      : days <= 0
        ? "Meet mee in je hermeting — nu"
        : `Meet mee in je hermeting — ${daysPhrase(days)}`;

  return {
    domain,
    status: "remeasure",
    actionable: false,
    highlighted: false,
    label,
    ctaLabel: null,
    href: null,
    daysUntil: days != null ? Math.max(0, days) : null,
    progress:
      days == null
        ? 0
        : clampProgress((REMEASURE_CYCLE_DAYS - days) / REMEASURE_CYCLE_DAYS),
  };
}

function buildCheckState(domain: PillarId, daysSince: number | undefined): DomainCheckState {
  const name = CHECK_NAME[domain] ?? "check";
  const href = buildDomainCheckHref(domain);

  if (daysSince == null) {
    return {
      domain,
      status: "never",
      actionable: true,
      highlighted: false,
      label: "Nog niet apart gemeten",
      ctaLabel: `Doe de ${name}`,
      href,
      daysUntil: 0,
      progress: 1,
    };
  }

  const elapsed = Math.max(0, Math.floor(daysSince));
  const daysUntil = Math.max(0, DOMAIN_CHECK_INTERVAL_DAYS - elapsed);

  if (daysUntil === 0) {
    return {
      domain,
      status: "due",
      actionable: true,
      highlighted: false,
      label: `Laatst gemeten: ${elapsed} dagen geleden`,
      ctaLabel: `Doe de ${name}`,
      href,
      daysUntil: 0,
      progress: 1,
    };
  }

  if (elapsed === 0) {
    return {
      domain,
      status: "fresh",
      actionable: false,
      highlighted: false,
      label: `Vandaag gemeten · volgende ${daysPhrase(daysUntil)}`,
      ctaLabel: null,
      href,
      daysUntil,
      progress: 0,
    };
  }

  return {
    domain,
    status: "counting",
    actionable: false,
    highlighted: false,
    label: `Nieuwe ${name} ${daysPhrase(daysUntil)}`,
    ctaLabel: null,
    href,
    daysUntil,
    progress: clampProgress(elapsed / DOMAIN_CHECK_INTERVAL_DAYS),
  };
}

/**
 * Eén check tegelijk uitlichten: het prioriteitsdomein wint, anders het domein
 * met het grootste meetgat (nog nooit gemeten telt als het grootste gat).
 */
function pickHighlight(
  states: DomainCheckState[],
  timings: DomainCheckTimings,
  priorityId: PillarId,
): PillarId | null {
  const actionable = states.filter((state) => state.actionable);
  if (actionable.length === 0) {
    return null;
  }

  const priorityState = actionable.find((state) => state.domain === priorityId);
  if (priorityState) {
    return priorityState.domain;
  }

  const gapOf = (domain: PillarId) => timings[domain] ?? Number.POSITIVE_INFINITY;
  const orderOf = (domain: PillarId) => KOMPAS_RAIL_PILLAR_IDS.indexOf(domain);

  return [...actionable].sort(
    (a, b) =>
      gapOf(b.domain) - gapOf(a.domain) || orderOf(a.domain) - orderOf(b.domain),
  )[0]!.domain;
}

export function buildDomainCheckStates({
  timings,
  priorityId,
  remeasureDaysUntil,
}: BuildDomainCheckStatesInput): Map<PillarId, DomainCheckState> {
  const states = KOMPAS_RAIL_PILLAR_IDS.map((domain) =>
    supportsDomainCheck(domain)
      ? buildCheckState(domain, timings[domain])
      : buildRemeasureState(domain, remeasureDaysUntil),
  );

  const highlight = pickHighlight(states, timings, priorityId);

  return new Map(
    states.map((state) => [
      state.domain,
      state.domain === highlight ? { ...state, highlighted: true } : state,
    ]),
  );
}

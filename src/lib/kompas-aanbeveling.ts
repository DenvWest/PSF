import { PILLAR } from "@/data/dashboard";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { CHECK_NAME } from "@/lib/kompas-domain-check";
import { getLeefstijlLadder, ladderActionFavoriteId } from "@/lib/leefstijl-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

/**
 * Wat er per domein bovenaan je ladder klaarstaat — één stap, niet de hele
 * ladder.
 *
 * Twee dingen liggen hier vast, en ze horen bij elkaar:
 *
 * 1. **De laag komt uit je laatste meting.** Waar een eigen domeincheck een
 *    winst-laag aflevert (`resolveDomainLadderReadout`: beweging, slaap,
 *    stress, voeding) is dát de laag. Die verschuift dus niet vanzelf — hij verschuift
 *    als je opnieuw meet. Datzelfde geldt voor de vólgorde: welk domein
 *    bovenaan staat volgt `model.enginePriority`, en die weegt de losse
 *    domeinchecks al mee.
 * 2. **De actie roteert per week.** Binnen die vaste laag wisselt welke van
 *    zijn acties je ziet. Andersom — de laag laten rouleren — zou de belofte
 *    onder punt 1 breken: dan staat er de ene week iets anders dan je laagst
 *    gemeten punt.
 *
 * Verbinding heeft (nog) geen check die per laag een staat oplevert; voeding
 * kreeg die in september (`nutrition-ladder.ts`). Tot 26 augustus 2026
 * leverden ze allebei niets: het hele aanbevelingsblok verdween zodra je
 * prioriteitsdomein er een van was — terwijl beide wél een volwaardige ladder
 * hebben. Zonder check valt een domein terug op laag 1, en
 * zeggen er eerlijk bij dat dat de onderkant van de ladder is en niet een
 * uitkomst van een meting ({@link KompasAanbevelingOrigin}). Datzelfde pad
 * vangt ook beweging/slaap/stress op zolang hun check nog niet gedaan is.
 *
 * Wat hier bewust *niet* gebeurt: een reden verzinnen. Zonder check is er geen
 * bewijsregel en geen staat-label, en dan staat er ook geen — zelfde lat als
 * `resolveLadderLayerReason` (tegenspraak J3).
 */

/** De laag waar een domein zonder check op terugvalt: de onderkant van de ladder. */
const LADDER_FALLBACK_LAYER = 1;

const MS_PER_DAY = 86_400_000;

export type KompasAanbevelingOrigin =
  /** Een eigen domeincheck wees deze laag aan. */
  | { kind: "check"; checkNoun: string; daysAgo: number | null }
  /** Geen check om winst uit af te lezen — dit is de onderkant van de ladder. */
  | { kind: "ladder" };

export type KompasAanbeveling = {
  domain: PillarId;
  label: string;
  color: string;
  layerId: number;
  layerName: string;
  action: string;
  /** Het favoriet-id dat deze actie op de ladder óók zou krijgen. */
  itemId: string;
  /** Alleen waar de check een staat voor deze laag aflevert; anders null. */
  stateLabel: string | null;
  origin: KompasAanbevelingOrigin;
  /** Het domein waar je focus op staat (`model.priority`) — jouw keuze. */
  isPriority: boolean;
  /** Het domein dat de analyse aanwijst (`model.enginePriority`). */
  isEngineAdvice: boolean;
};

/**
 * Weken sinds epoch. Bewust geen ISO-weeknummer: dat springt rond de
 * jaargrens terug naar 1, waardoor de rotatie daar een week zou overslaan of
 * herhalen. Doorlopend tellen heeft die naad niet.
 */
export function weekIndexFromDate(isoDate: string): number {
  const parsed = Date.parse(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.floor(parsed / MS_PER_DAY / 7);
}

/**
 * De actie van deze week binnen een vaste laag. Eén actie betekent elke week
 * dezelfde — dat is geen bug maar de eerlijke stand van die laag.
 */
export function rotateLadderAction(
  actions: readonly string[],
  weekIndex: number,
): string | null {
  if (actions.length === 0) {
    return null;
  }
  const safeIndex = ((weekIndex % actions.length) + actions.length) % actions.length;
  return actions[safeIndex] ?? null;
}

function buildForDomain(
  domain: PillarId,
  data: DashboardData | undefined,
  weekIndex: number,
  isPriority: boolean,
  isEngineAdvice: boolean,
): KompasAanbeveling | null {
  const ladder = getLeefstijlLadder(domain);
  if (!ladder) {
    return null;
  }

  const readout = resolveDomainLadderReadout(domain, data);
  const layerId = readout?.focusLayer ?? LADDER_FALLBACK_LAYER;
  const layer = ladder.layers.find((row) => row.id === layerId) ?? null;
  if (!layer) {
    return null;
  }

  const action = rotateLadderAction(layer.actions, weekIndex);
  if (!action) {
    return null;
  }

  // Alleen de staat die de check écht aflevert. Geen check betekent geen
  // woord ernaast — nooit "Grootste winst" op een laag die dat niet zei.
  const state = readout?.layerStates[layer.id] ?? null;
  const checkNoun = CHECK_NAME[domain];
  const origin: KompasAanbevelingOrigin =
    readout && checkNoun
      ? { kind: "check", checkNoun, daysAgo: data?.domainCheckDaysAgo?.[domain] ?? null }
      : { kind: "ladder" };

  return {
    domain,
    label: PILLAR[domain].label,
    color: PILLAR[domain].color,
    layerId: layer.id,
    layerName: layer.name,
    action,
    itemId: ladderActionFavoriteId(domain, layer.id, action),
    stateLabel: state && readout ? readout.stateLabels[state] : null,
    origin,
    isPriority,
    isEngineAdvice,
  };
}

/**
 * Eén aanbeveling per domein met een ladder.
 *
 * Volgorde: wat de analyse aanwijst voorop, daarna je eigen focus, daarna de
 * rest in de leesrichting van de ringen hierboven.
 *
 * Meestal zijn die eerste twee hetzelfde domein — `model.priority` ís
 * `model.enginePriority` zolang je zelf geen andere focus koos. Lopen ze
 * uiteen (je zette je focus handmatig om, of de analyse verschoof daarna),
 * dan staat het analyse-domein bovenaan mét beide markeringen zichtbaar. Stil
 * de focus overrulen zou de focuskeuze betekenisloos maken; hem stil negeren
 * zou een verschoven analyse verbergen. Zichtbaar naast elkaar is het eerlijke
 * midden — dezelfde lijn die `PriorityOverTimePanel` op Agenda aanhoudt
 * ("analyse blijft leidend", jij kiest).
 *
 * `enginePriorityDomain` weegt de losse domeinchecks al mee: `currentScores`
 * in `account-dashboard.ts` is het laatste punt van een reeks waar
 * check-in- en voedingslog-punten in zitten, en dáár rekent
 * `getPriorityPillar` mee. Een verse stresscheck verschuift de analyse dus
 * meteen, zonder hermeting.
 */
export function buildKompasAanbevelingen(
  priorityDomain: PillarId,
  data: DashboardData | undefined,
  weekIndex: number,
  enginePriorityDomain: PillarId | null = null,
): KompasAanbeveling[] {
  const adviceDomain =
    enginePriorityDomain && enginePriorityDomain !== priorityDomain
      ? enginePriorityDomain
      : null;

  const order = [
    ...(adviceDomain ? [adviceDomain] : []),
    priorityDomain,
    ...KOMPAS_RAIL_PILLAR_IDS.filter(
      (id) => id !== priorityDomain && id !== adviceDomain,
    ),
  ];

  const rows: KompasAanbeveling[] = [];
  for (const domain of order) {
    const row = buildForDomain(
      domain,
      data,
      weekIndex,
      domain === priorityDomain,
      domain === enginePriorityDomain,
    );
    if (row) {
      rows.push(row);
    }
  }
  return rows;
}

/** De herkomstregel onder de kop: waarop dit rust, en hoe vers dat is. */
export function aanbevelingOriginLine(origin: KompasAanbevelingOrigin): string {
  if (origin.kind === "ladder") {
    return "Nog niet apart gemeten — dit is de basis van je ladder.";
  }
  if (origin.daysAgo == null) {
    return `Uit je ${origin.checkNoun}.`;
  }
  if (origin.daysAgo === 0) {
    return `Uit je ${origin.checkNoun} van vandaag.`;
  }
  if (origin.daysAgo === 1) {
    return `Uit je ${origin.checkNoun} van gisteren.`;
  }
  return `Uit je ${origin.checkNoun} van ${origin.daysAgo} dagen geleden.`;
}

import {
  buildDomainContextBar,
  buildDomainRitmeHint,
  type DomainCheckCta,
  type DomainContextBar,
  type DomainSchapZone,
} from "@/lib/domain-context-bar";
import {
  resolveDomainLadderReadout,
  resolveLadderLayerReason,
  type LadderLayerReason,
} from "@/lib/domain-ladder-readout";
import { buildCycleLine } from "@/lib/kompas-home";
import { buildNutritionPriorities } from "@/lib/nutrition-prioriteiten";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

/**
 * De ruggengraat van "Context bij vandaag" — de contextkolom als kompas én
 * alertheidskolom, en per domein een eigen balk.
 *
 * Vier zones, altijd in deze volgorde en altijd over hetzelfde domein:
 *
 * 1. **Urgentie** — welke laag van de leefstijlladder nu de winst draagt, en de
 *    feitzin uit je check die dat verklaart. Dit is wat je in de (her)meting
 *    feitelijk ziet, niet een aparte redenering ernaast: dezelfde
 *    `resolveDomainLadderReadout` die het domeinscherm en Voortgang lezen.
 *    Levert de check géén winst-laag (voeding, verbinding, of nog geen check
 *    gedaan), dan zegt de zone dát, met de check die het oplost — in plaats van
 *    weg te vallen.
 * 2. **Doel** — je ijkpunt op dat domein, als richting voor de dag. Sinds
 *    26 augustus ook hier te herscoren (`useDomainGoalEditor`, gedeeld met
 *    `KompasDoelIjkpunt`) — een ander doel kiezen opent nog altijd het volle
 *    zetmoment (`DomeinDoelZetten`), want situatie en eigen woorden horen daar.
 * 3. **Schap** — het aanbod van dít domein, of de reden waarom het er niet is.
 *    Op stress en verbinding is dat een genomen besluit, geen ontbrekende
 *    lijst, en de kolom zegt het met dezelfde woorden als het besluit.
 * 4. **Ritme** — houd je continuïteit vast, en wanneer wordt dat weer gemeten.
 *
 * Het domein volgt de focus: een open ladderlaag wint van een open domein, en
 * dat wint van het prioriteitsdomein uit de check. Eén resolver, zodat de
 * kolom nooit een ander domein uitlegt dan het scherm ernaast.
 *
 * Copy-lock, overgenomen van `voortgang-horizon-copy.ts`: geen streaks,
 * vlammetjes, badges of schuld-taal, en geen oordeel over de persoon. Het
 * ritme meldt wat er staat en wat er komt — meer niet.
 */

export type ContextSpineUrgency =
  | {
      kind: "laag";
      layerId: number;
      layerName: string;
      /** Staat van deze laag uit de check ("Grootste winst", …); null zonder check. */
      stateLabel: string | null;
      /** Is dit de winst-laag uit de check? */
      isFocusLayer: boolean;
      /** Feitzin uit de check, of null — dan tonen we er geen. */
      reason: LadderLayerReason | null;
      /**
       * Wat er ná deze laag komt — hoogstens twee richtingen, in de bewoording
       * van het Kompas.
       *
       * De zone toont al één laag met zijn feitzin; dat ís prioriteit 1. Wat
       * eraan ontbrak is het vervolg: dat je na deze stap niet in het niets
       * kijkt. Leeg zodra het domein geen prioriteitenmodule heeft (alleen
       * voeding heeft er een) of zodra deze laag de enige is die telt.
       */
      vervolg: readonly string[];
    }
  | {
      /** Er is een ladder, maar de check wijst er geen winst-laag in aan. */
      kind: "geen_winstlaag";
      line: string;
      cta: DomainCheckCta | null;
    };

export type ContextSpineRitme = {
  /** `alert` zodra er iets wacht dat niet vanzelf overgaat. */
  tone: "alert" | "neutral";
  kicker: string;
  /** Wat vandaag staat. */
  line: string;
  /** Waar je in de cyclus staat, of null zolang er geen cyclus loopt. */
  cycleLine: string | null;
  /** Wat er op dít domein aan continuïteit hangt; null waar niets te melden valt. */
  domainLine: string | null;
  remeasureDue: boolean;
};

export type ContextSpine = {
  domain: PillarId;
  bar: DomainContextBar;
  urgency: ContextSpineUrgency | null;
  schap: DomainSchapZone;
  ritme: ContextSpineRitme;
  /**
   * Een hermeting die klaarstaat gaat vóór de ladder: die laag verandert er
   * juist door. Dit is de enige herordening — anders staat urgentie bovenaan.
   */
  ritmeFirst: boolean;
};

type ResolveSpineDomainInput = {
  ladderFocusDomain: PillarId | null;
  viewedDomain: PillarId | null;
  priorityDomain: PillarId | null;
};

export function resolveContextSpineDomain({
  ladderFocusDomain,
  viewedDomain,
  priorityDomain,
}: ResolveSpineDomainInput): PillarId | null {
  return ladderFocusDomain ?? viewedDomain ?? priorityDomain;
}

type BuildContextSpineInput = {
  domain: PillarId;
  /**
   * De laag die het scherm ernaast uitlegt, of `null` op de Kompas-home — daar
   * staat geen ladder open en valt de kolom terug op de winst-laag uit de check.
   */
  openLayerId: number | null;
  data: DashboardData | undefined;
  model: DashboardModel | null;
  /** Is de dagstap van vandaag afgevinkt? (`daily_action_log`, niet afleiden.) */
  todayActionDone: boolean;
};

function buildUrgency(
  bar: DomainContextBar,
  openLayerId: number | null,
  data: DashboardData | undefined,
): ContextSpineUrgency | null {
  const ladder = getLeefstijlLadder(bar.domain);
  if (!ladder) {
    // Energie en herstel zijn readouts, geen interventiedomeinen: geen ladder,
    // dus ook geen laag om urgentie op te hangen.
    return null;
  }

  const readout = resolveDomainLadderReadout(bar.domain, data);
  const layerId = openLayerId ?? readout?.focusLayer ?? null;

  if (layerId == null) {
    // Geen check en geen eigen keuze: we weten niet welke laag de winst draagt.
    // Laag 1 tonen zou schijnprecisie zijn — de zone zegt dus wát er ontbreekt
    // en welke check dat oplost.
    return { kind: "geen_winstlaag", line: bar.noReadoutLine, cta: bar.checkCta };
  }

  const layer = ladder.layers.find((row) => row.id === layerId) ?? null;
  if (!layer) {
    return { kind: "geen_winstlaag", line: bar.noReadoutLine, cta: bar.checkCta };
  }

  const state = readout?.layerStates[layer.id] ?? null;

  return {
    kind: "laag",
    layerId: layer.id,
    layerName: layer.name,
    stateLabel: state && readout ? readout.stateLabels[state] : null,
    isFocusLayer: readout != null && layer.id === readout.focusLayer,
    reason: resolveLadderLayerReason(readout, layer.id),
    vervolg: resolveVervolg(bar.domain, layer.id, data),
  };
}

/**
 * De richtingen ná de laag die de zone toont.
 *
 * Eén bron met het Kompas — `buildNutritionPriorities` op dezelfde feitenrijen
 * — zodat de contextkolom nooit een andere volgorde noemt dan het scherm
 * ernaast. De richting die deze laag zelf al draagt valt eraf: die staat er
 * hierboven al, en hem herhalen maakt van een vervolg een echo.
 *
 * Twee is het maximum. De kolom is smal en dit is context, geen lijst.
 */
function resolveVervolg(
  domain: PillarId,
  layerId: number,
  data: DashboardData | undefined,
): readonly string[] {
  if (domain !== "voeding") {
    return [];
  }
  const factRows = data?.nutritionCheckinReadout?.factRows;
  if (!factRows || factRows.length === 0) {
    return [];
  }
  return buildNutritionPriorities(factRows)
    .priorities.filter((priority) => priority.layer !== layerId)
    .slice(0, 2)
    .map((priority) => priority.label);
}

function buildRitme(
  domain: PillarId,
  data: DashboardData | undefined,
  model: DashboardModel | null,
  todayActionDone: boolean,
): ContextSpineRitme {
  const remeasure = data?.remeasure ?? null;
  const remeasureDue = remeasure != null && remeasure.daysUntil <= 0;
  const hint = buildDomainRitmeHint(domain, data);

  const cycleLine = buildCycleLine(
    data?.cycleEvidence
      ? {
          cycleDay: data.cycleEvidence.cycleDay,
          daysUntilRemeasure: data.cycleEvidence.daysUntilRemeasure,
          activeDaysInCycle: data.cycleEvidence.activeDays,
        }
      : null,
  );

  if (remeasureDue) {
    return {
      tone: "alert",
      kicker: "Je ritme",
      line: "Je hermeting staat klaar — dertig dagen zijn om.",
      cycleLine,
      domainLine: hint?.line ?? null,
      remeasureDue: true,
    };
  }

  const habit = model?.activeHabit ?? null;
  const line = habit
    ? todayActionDone
      ? `Vandaag staat: ${habit.title.toLowerCase()}.`
      : `Vandaag staat nog open: ${habit.title.toLowerCase()}.`
    : "Je koos vandaag nog geen stap.";

  return {
    tone: hint?.alert ? "alert" : "neutral",
    kicker: "Je ritme",
    line,
    cycleLine,
    domainLine: hint?.line ?? null,
    remeasureDue: false,
  };
}

export function buildContextSpine({
  domain,
  openLayerId,
  data,
  model,
  todayActionDone,
}: BuildContextSpineInput): ContextSpine {
  const bar = buildDomainContextBar(domain);
  const ritme = buildRitme(domain, data, model, todayActionDone);

  return {
    domain,
    bar,
    urgency: buildUrgency(bar, openLayerId, data),
    schap: bar.schap,
    ritme,
    ritmeFirst: ritme.remeasureDue,
  };
}

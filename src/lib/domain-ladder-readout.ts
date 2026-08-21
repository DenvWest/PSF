import type { MovementFactRowKey } from "@/data/movement-checkin";
import type { MovementPriorityId } from "@/data/movement/lifestyle-priorities";
import { SLEEP_LAYER_STATE_LABEL, type SleepPriorityId } from "@/data/sleep/lifestyle-priorities";
import {
  STRESS_LAYER_BY_ID,
  STRESS_LAYER_STATE_LABEL,
  type StressPriorityId,
} from "@/data/stress/lifestyle-priorities";
import { resolveRecommendedLayers } from "@/components/dashboard/voortgang/FavorietenBewegingSection";
import type { MovementFactRow } from "@/lib/movement-assessment";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import { MOVEMENT_LAYER_STATE_LABEL, movementLayerWhyWait } from "@/lib/movement-ladder";
import { sleepLayerWhyWait } from "@/lib/sleep-ladder";
import { assessStress } from "@/lib/stress-assessment";
import { resolveStressFocusLayer, resolveStressLayerStates, stressLayerWhyWait } from "@/lib/stress-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

/**
 * Wat een eigen domeincheck over je ladder zegt — één bron voor de drie
 * plekken die het lezen: het Kompas-domeinscherm, de ladder op Voortgang, en
 * de contextkolom ernaast.
 *
 * Tot 20 augustus las alleen beweging zijn check uit, en deed dat op elk van
 * die drie plekken opnieuw met eigen `domain === "beweging"`-takken. Slaap
 * hád zijn staten al (`resolveSleepLayerStates`, opgeslagen in
 * `sleepCheckinSnapshot`) maar niets rende ze: de ladder op Voortgang stond er
 * zonder staten bij en op Kompas stond een prebuild-iframe. Wie hier een
 * domein bij zet, zet 'm op alle drie tegelijk bij.
 *
 * Voeding en verbinding hebben wél een ladder maar (nog) geen check die per
 * laag een staat oplevert. Die krijgen `null` — de ladder toont dan zes lagen
 * zonder oordeel, wat eerlijk is en al zo werkte.
 */

export type LadderEvidenceStatus = "below" | "near" | "meets" | "own";

/**
 * Eén feitenrij uit een check, zoals hij onder zijn laag komt te staan.
 * Structureel gelijk aan `MovementFactRow` — bewust geen import daarvan, zodat
 * elk domein met een benchmark dit kan vullen zonder de beweeg-engine te
 * kennen.
 */
export type LadderEvidenceRow = {
  key: string;
  label: string;
  answerLabel: string;
  benchmarkLabel?: string | null;
  benchmarkSource?: string | null;
  status?: LadderEvidenceStatus;
  whyLine: string;
  footnote?: string | null;
};

export type DomainLadderReadout = {
  /** De conclusiezin uit de check — draagt de kop van het domeinscherm. */
  headline: string;
  /** De laag waar de winst nu zit. */
  focusLayer: number;
  layerStates: Record<number, LeefstijlLayerState>;
  stateLabels: Record<LeefstijlLayerState, string>;
  /** Waarom deze laag kan wachten, of null als hij dat niet kan. */
  whyWait: (layerId: number) => string | null;
  /** Bewijs per laag; leeg voor lagen die de check niet beoordeelt. */
  evidenceByLayer: Partial<Record<number, readonly LadderEvidenceRow[]>>;
  /** Welke lagen als aanbeveling mogen worden aangekondigd. */
  recommendedLayerIds: readonly number[];
};

const MOVEMENT_LAYER_FACT_KEYS: Partial<Record<MovementPriorityId, readonly MovementFactRowKey[]>> = {
  1: ["zitten", "mobiliteit"],
  2: ["kracht", "aeroob"],
  3: ["consistentie"],
};

function movementLayerFactRows(
  layer: MovementPriorityId,
  factRows: readonly MovementFactRow[],
): LadderEvidenceRow[] {
  const keys = MOVEMENT_LAYER_FACT_KEYS[layer];
  if (!keys || keys.length === 0) return [];
  return keys
    .map((key) => factRows.find((row) => row.key === key))
    .filter((row): row is MovementFactRow => row != null);
}

function movementReadout(data: DashboardData | undefined): DomainLadderReadout | null {
  const snapshot = data?.movementCheckinSnapshot ?? null;
  if (!snapshot) {
    return null;
  }
  const focus = snapshot.ladder.focus;
  return {
    headline: snapshot.headline,
    // Zonder focus-dimensie opent de ladder op prioriteit 1: dat claimt niets
    // en houdt het scherm bruikbaar. Zelfde val als in `resolveActiveLayer`.
    focusLayer: focus ?? 1,
    layerStates: snapshot.ladder.states,
    stateLabels: MOVEMENT_LAYER_STATE_LABEL,
    whyWait: (layerId) => movementLayerWhyWait(layerId as MovementPriorityId, focus),
    evidenceByLayer: {
      1: movementLayerFactRows(1, snapshot.factRows),
      2: movementLayerFactRows(2, snapshot.factRows),
      3: movementLayerFactRows(3, snapshot.factRows),
    },
    recommendedLayerIds: resolveRecommendedLayers(focus).map((layer) => layer.id),
  };
}

function sleepReadout(data: DashboardData | undefined): DomainLadderReadout | null {
  const snapshot = data?.sleepCheckinSnapshot ?? null;
  if (!snapshot) {
    return null;
  }
  const focus = snapshot.focusLayer;

  // `SleepFactRow` draagt zijn laag zelf — anders dan beweging, waar de
  // koppeling in `MOVEMENT_LAYER_FACT_KEYS` staat. Groeperen volstaat dus.
  const evidenceByLayer: Partial<Record<number, LadderEvidenceRow[]>> = {};
  for (const row of snapshot.factRows) {
    if (row.layer == null) continue;
    (evidenceByLayer[row.layer] ??= []).push({
      key: row.key,
      label: row.label,
      answerLabel: row.answerLabel,
      benchmarkLabel: row.benchmarkLabel,
      whyLine: row.whyLine,
      // "na" betekent: geen richtlijn om tegen af te zetten. Dan geen badge,
      // in plaats van een vierde woord dat een oordeel suggereert.
      ...(row.status === "na" ? {} : { status: row.status }),
    });
  }

  return {
    headline: snapshot.headline,
    focusLayer: focus,
    layerStates: snapshot.layerStates,
    stateLabels: SLEEP_LAYER_STATE_LABEL,
    whyWait: (layerId) => sleepLayerWhyWait(layerId as SleepPriorityId, focus),
    evidenceByLayer,
    // Eén laag, niet twee. `sleepLayerWhyWait` zegt van elke laag boven de
    // winst-laag dat hij kan wachten; die ook aanbevelen zou zichzelf
    // tegenspreken. Beweging kent dat "en de laag erna"-model wél.
    recommendedLayerIds: [focus],
  };
}

/**
 * Stress heeft geen bevroren conclusiezin zoals beweging en slaap (die komt
 * pas met een volledige checkin-snapshot, T1d) — de kop hergebruikt daarom
 * bestaande, al gepubliceerde copy: het statement van `assessStress` voor de
 * dimensie die de winst-laag draagt (spanning → P1, herstel → P3), en anders
 * de laag-summary uit `STRESS_PRIORITY_LAYERS` zelf. Geen nieuwe zin, alleen
 * hergebruik van wat al vastligt.
 */
function stressReadout(data: DashboardData | undefined): DomainLadderReadout | null {
  const report = data?.stressCheckinReport ?? null;
  if (!report) {
    return null;
  }
  const focus = resolveStressFocusLayer(report);
  const dimensionForFocus = focus === 1 ? "spanning" : focus === 3 ? "herstel" : null;
  const matchedStatement = dimensionForFocus
    ? assessStress({ STR_FREQ: report.STR_FREQ, STR_RCV: report.STR_RCV }).find(
        (result) => result.dimension === dimensionForFocus,
      )?.statement
    : undefined;

  return {
    headline: matchedStatement ?? STRESS_LAYER_BY_ID[focus].summary,
    focusLayer: focus,
    layerStates: resolveStressLayerStates(report),
    stateLabels: STRESS_LAYER_STATE_LABEL,
    whyWait: (layerId) => stressLayerWhyWait(layerId as StressPriorityId, focus),
    // Feitrijen per laag komen pas met de checkin-snapshot (T1d) — de states
    // hierboven staan al op zichzelf.
    evidenceByLayer: {},
    // Eén laag, niet twee — zelfde reden als bij slaap: elke laag boven de
    // winst-laag zegt zelf dat hij kan wachten.
    recommendedLayerIds: [focus],
  };
}

export function resolveDomainLadderReadout(
  domain: PillarId,
  data: DashboardData | undefined,
): DomainLadderReadout | null {
  if (domain === "beweging") return movementReadout(data);
  if (domain === "slaap") return sleepReadout(data);
  if (domain === "stress") return stressReadout(data);
  return null;
}

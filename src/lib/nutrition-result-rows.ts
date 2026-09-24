import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DeltaDirection, NutrientDelta } from "@/lib/nutrition-delta";
import {
  sortRoutesByAttention,
  type NutrientRouteStatus,
  type RouteStatus,
} from "@/lib/nutrition-route-status";
import { buildSupplementHubHref } from "@/lib/supplement-hub/hub-link";
import type { SupplementCategory } from "@/types/supplement";

/**
 * Eén rij per stof op het voedingscheck-resultaat — zie
 * `docs/plan/BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md`.
 *
 * De status komt uit de routestatus, de geschiedenis uit de estimate-delta.
 * Dat zijn twee meetlatten, dus de geschiedenis draagt alleen een richting en
 * nooit een bandnaam die met de status kan botsen.
 */

export const NUTRIENT_HUB_CATEGORY: Record<NutrientId, SupplementCategory> = {
  protein: "eiwitpoeder",
  omega3: "omega-3",
  magnesium: "magnesium",
  vitamin_d: "vitamine-d",
  zinc: "zink",
};

export type NutrientResultHistory =
  | { kind: "first"; loggedAt: string | null }
  | { kind: "change"; direction: DeltaDirection; since: string | null };

export type NutrientResultRow = {
  nutrient: NutrientId;
  label: string;
  status: RouteStatus;
  answerLabel: string | null;
  thresholdNl: string;
  action: string;
  sourceLabels: string[];
  doorOpen: boolean;
  doorReasonNl: string;
  supplementHref: string;
  history: NutrientResultHistory;
  isFocus: boolean;
};

export const COVERED_ACTION = "Houd vast wat je nu doet — hier zit je goed.";

export function buildNutrientResultRows({
  routeStatuses,
  gateOpen,
  focusNutrient,
  delta,
  loggedAt,
  previousLoggedAt,
  lifestyleTextFor,
}: {
  routeStatuses: readonly NutrientRouteStatus[];
  gateOpen: boolean;
  focusNutrient: NutrientId | null;
  delta: readonly NutrientDelta[] | null;
  loggedAt: string | null;
  previousLoggedAt: string | null;
  lifestyleTextFor: (nutrient: NutrientId) => string | null;
}): NutrientResultRow[] {
  const sorted = sortRoutesByAttention(routeStatuses);
  const ordered = focusNutrient
    ? [
        ...sorted.filter((s) => s.nutrient === focusNutrient),
        ...sorted.filter((s) => s.nutrient !== focusNutrient),
      ]
    : sorted;

  return ordered.map((status) => {
    const change = delta?.find((d) => d.nutrient === status.nutrient);
    const history: NutrientResultHistory = change
      ? { kind: "change", direction: change.direction, since: previousLoggedAt }
      : { kind: "first", loggedAt };

    const action =
      status.status === "covered"
        ? COVERED_ACTION
        : (lifestyleTextFor(status.nutrient) ?? status.route.actionNl);

    return {
      nutrient: status.nutrient,
      label: status.label,
      status: status.status,
      answerLabel: status.answerLabel,
      thresholdNl: status.route.thresholdNl,
      action,
      sourceLabels: status.sources.slice(0, 3).map((bron) => bron.labelNl),
      doorOpen: gateOpen && status.supplementDoorOpen,
      doorReasonNl: status.doorReasonNl,
      supplementHref: buildSupplementHubHref(NUTRIENT_HUB_CATEGORY[status.nutrient]),
      history,
      isFocus: status.nutrient === focusNutrient,
    };
  });
}

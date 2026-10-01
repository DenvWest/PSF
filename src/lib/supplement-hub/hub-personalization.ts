import { parseNutritionLadderReport } from "@/lib/nutrition-conclusion";
import { buildNutritionFactRows, resolveNutritionGate } from "@/lib/nutrition-ladder";
import { NUTRIENT_HUB_CATEGORY } from "@/lib/nutrition-result-rows";
import {
  buildNutrientRouteStatuses,
  sortRoutesByAttention,
} from "@/lib/nutrition-route-status";
import type { SupplementCategory } from "@/types/supplement";

export type HubPersonalMatch = {
  category: SupplementCategory;
  name: string;
  reason: string;
};

export type HubPersonalization =
  | { state: "no_intake" }
  | { state: "needs_nutrition" }
  | { state: "geen_prioriteit" }
  | { state: "basis_eerst"; reason: string }
  | { state: "ready"; matches: HubPersonalMatch[] };

type BuildHubPersonalizationArgs = {
  /** Of er een sessie bestaat, ongeacht `session_kind` (brede check of check). */
  hasSession: boolean;
  /** `raw_inputs` van de laatste `intake_intake_log`, of null zonder check. */
  latestNutritionLog: unknown | null;
  isDarkSeason?: boolean;
};

/**
 * "Past bij jou" komt uit dezelfde routestatussen als de rijen per stof op het
 * resultaat van de check — zie
 * `docs/plan/BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md` (B). Een stof
 * past alleen als de laag-6-poort open is én de voedingsroute voor die stof
 * aantoonbaar dicht zit; beide pagina's zeggen dan hetzelfde.
 *
 * Neemt bewust alleen "is er een sessie" aan, niet de payload van de brede
 * check: een sessie van de check (`session_kind: "nutrition"`) telt hier ook
 * mee. Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.4 (P3).
 */
export function buildHubPersonalization({
  hasSession,
  latestNutritionLog,
  isDarkSeason = false,
}: BuildHubPersonalizationArgs): HubPersonalization {
  if (!hasSession) {
    return { state: "no_intake" };
  }

  if (latestNutritionLog === null) {
    return { state: "needs_nutrition" };
  }

  const report = parseNutritionLadderReport(latestNutritionLog);
  if (!report) {
    return { state: "needs_nutrition" };
  }

  const gate = resolveNutritionGate(buildNutritionFactRows(report));
  if (gate.closedBy === "eatable_gaps" && gate.reason) {
    return { state: "basis_eerst", reason: gate.reason };
  }
  if (!gate.open) {
    return { state: "geen_prioriteit" };
  }

  const matches: HubPersonalMatch[] = sortRoutesByAttention(
    buildNutrientRouteStatuses(report, { isDarkSeason }),
  )
    .filter((status) => status.supplementDoorOpen)
    .map((status) => ({
      category: NUTRIENT_HUB_CATEGORY[status.nutrient],
      name: status.label,
      reason: status.doorReasonNl,
    }));

  if (matches.length === 0) {
    return { state: "geen_prioriteit" };
  }

  return { state: "ready", matches };
}

/**
 * Publieke prioriteitenladder bovenaan een vergelijkingspagina.
 *
 * Dit is de piramide uit de prebuilds, maar vóór de inlog in plaats van erachter:
 * eerst de leefstijllagen die meer opleveren dan een potje, dan pas de vergelijking.
 * De poort mag dus ook dicht blijven — "koop voorlopig niets" is hier een geldige
 * uitkomst, en precies het onderscheid met een testsite die altijd een winnaar aanwijst.
 *
 * De stappen komen uit het leefstijlplan van het bijbehorende domein, zodat het advies
 * één bron houdt: pas je het plan aan, dan volgt de vergelijkingspagina vanzelf.
 */
import { sleepPlanTemplate } from "@/data/lifestyle-plans/sleep";
import type { LifestylePlanTemplate, PlanPhaseHorizon } from "@/types/lifestyle-plan";
import type { SupplementCategory } from "@/types/supplement";

export type LadderStep = {
  title: string;
  why: string;
};

export type PrePurchaseLadder = {
  /** Domein waaruit de stappen komen, in UI-taal ("slaap"). */
  domainLabel: string;
  heading: string;
  intro: string;
  steps: readonly LadderStep[];
  /** Poort open — de lagen eronder staan. */
  openLine: string;
  /** Poort dicht — eerlijker om nog niets te kopen. */
  closedLine: string;
  /** Exacte EFSA-bewoording; nooit parafraseren. */
  claimNote: string;
};

const QUICK_WIN_HORIZON: PlanPhaseHorizon = "deze-week";

function quickWinSteps(template: LifestylePlanTemplate): readonly LadderStep[] {
  const phase = template.phases.find((p) => p.horizon === QUICK_WIN_HORIZON);
  if (!phase) return [];

  return phase.steps
    .filter((step) => step.rationale !== undefined)
    .map((step) => ({
      title: step.title,
      why: step.rationale?.body ?? "",
    }));
}

/**
 * Alleen categorieën met een afgeronde ladder staan hier. Ontbreekt de categorie,
 * dan rendert het blok niet — geen half advies op een geldpagina.
 */
export const PRE_PURCHASE_LADDERS: Partial<
  Record<SupplementCategory, PrePurchaseLadder>
> = {
  magnesium: {
    domainLabel: "slaap",
    heading: "Voordat je magnesium koopt",
    intro:
      "Magnesium is een aanvulling, geen ritme. Bij slecht slapen leveren deze drie " +
      "dingen doorgaans meer op dan welk potje dan ook — en ze kosten niets. Loop ze " +
      "eerst langs, dan weet je of een supplement bij jou nog iets toevoegt.",
    steps: quickWinSteps(sleepPlanTemplate),
    openLine:
      "Staan deze drie al? Dan is magnesium een zinnige aanvulling. Hieronder zie je " +
      "welke vorm en dosering de claimdrempel halen — en wat je per dag kwijt bent.",
    closedLine:
      "Staat er nog geen van de drie? Dan levert die eerste week ritme je waarschijnlijk " +
      "meer op dan een potje magnesium. Begin daar; de vergelijking loopt niet weg.",
    claimNote:
      "Magnesium draagt bij tot een normale psychologische functie en tot vermindering " +
      "van vermoeidheid en moeheid (EFSA-goedgekeurd, bij voldoende inname).",
  },
};

export function getPrePurchaseLadder(
  category: SupplementCategory,
): PrePurchaseLadder | undefined {
  return PRE_PURCHASE_LADDERS[category];
}

import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import { evaluatePlanCondition } from "@/lib/lifestyle-plan-eval";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import type { PlanIntakeContext, PlanStepLinkKind } from "@/types/lifestyle-plan";

export type NutrientBridgeItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  kind: PlanStepLinkKind;
  /** Primary macro CTA — always eiwit. */
  emphasis?: boolean;
};

const BRIDGE_STEP_IDS = new Set(["mov-eiwit-koppeling", "mov-creatine-vergelijk"]);

export function isNutrientBridgeStep(stepId: string): boolean {
  return BRIDGE_STEP_IDS.has(stepId);
}

/** Prominent nutrient bridge below active week actions — leefstijl eerst, supplement conditioneel. */
export function buildMovementNutrientBridge(
  ctx: PlanIntakeContext,
): NutrientBridgeItem[] {
  const items: NutrientBridgeItem[] = [];

  items.push({
    id: "bridge-protein",
    label: ctx.signals.protein_gap_signal
      ? "Eiwittekort — check je voeding"
      : "Check je eiwitinname",
    description: ctx.signals.protein_gap_signal
      ? "Kracht zonder eiwit levert minder op — eerst tafel, dan potje."
      : "Bij training vraagt je lichaam om voldoende eiwit per maaltijd.",
    href: "/intake/voeding",
    kind: "article",
    emphasis: true,
  });

  const creatineStep = movementPlanTemplate.phases
    .flatMap((phase) => phase.steps)
    .find((step) => step.id === "mov-creatine-vergelijk");

  if (
    creatineStep?.showWhen &&
    evaluatePlanCondition(creatineStep.showWhen, ctx)
  ) {
    items.push({
      id: "bridge-creatine",
      label: "Vergelijk creatine",
      description:
        "Aanvulling bij structurele krachttraining — geen vervanging van slaap, eiwit of rust.",
      href: COMPARISON_PATHS.creatine,
      kind: "comparison",
    });
  }

  if (ctx.signals.magnesium_signal) {
    items.push({
      id: "bridge-magnesium",
      label: "Vergelijk magnesium",
      description:
        "Kan bijdragen aan normale spierfunctie en vermindering van vermoeidheid — na voeding en rust.",
      href: COMPARISON_PATHS.magnesium,
      kind: "comparison",
    });
  }

  return items;
}

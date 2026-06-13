import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";
import { sleepPlanTemplate } from "@/data/lifestyle-plans/sleep";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { nutritionPlanTemplate } from "@/data/lifestyle-plans/nutrition";

const PLAN_TEMPLATES: Partial<
  Record<MeasuredPillarId, LifestylePlanTemplate>
> = {
  sleep: sleepPlanTemplate,
  movement: movementPlanTemplate,
  nutrition: nutritionPlanTemplate,
};

export function getPlanTemplate(
  domain: MeasuredPillarId,
): LifestylePlanTemplate | undefined {
  return PLAN_TEMPLATES[domain];
}

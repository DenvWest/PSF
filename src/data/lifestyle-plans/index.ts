import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";
import { sleepPlanTemplate } from "@/data/lifestyle-plans/sleep";
import { stressPlanTemplate } from "@/data/lifestyle-plans/stress";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { nutritionPlanTemplate } from "@/data/lifestyle-plans/nutrition";

const PLAN_TEMPLATES: Partial<
  Record<MeasuredPillarId, LifestylePlanTemplate>
> = {
  sleep: sleepPlanTemplate,
  stress: stressPlanTemplate,
  movement: movementPlanTemplate,
  nutrition: nutritionPlanTemplate,
};

export function getPlanTemplate(
  domain: MeasuredPillarId,
): LifestylePlanTemplate | undefined {
  return PLAN_TEMPLATES[domain];
}

export const PLAN_TEMPLATE_DOMAINS = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
] as const satisfies readonly MeasuredPillarId[];

export type PlanTemplateDomain = (typeof PLAN_TEMPLATE_DOMAINS)[number];

export function isPlanTemplateDomain(
  value: string,
): value is PlanTemplateDomain {
  return (PLAN_TEMPLATE_DOMAINS as readonly string[]).includes(value);
}

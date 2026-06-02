import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";
import { sleepPlanTemplate } from "@/data/lifestyle-plans/sleep";

const PLAN_TEMPLATES: Partial<
  Record<MeasuredPillarId, LifestylePlanTemplate>
> = {
  sleep: sleepPlanTemplate,
};

export function getPlanTemplate(
  domain: MeasuredPillarId,
): LifestylePlanTemplate | undefined {
  return PLAN_TEMPLATES[domain];
}

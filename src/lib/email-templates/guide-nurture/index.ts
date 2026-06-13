import { slaapGuideTemplates } from "@/lib/email-templates/guide-nurture/slaap";
import { stressGuideTemplates } from "@/lib/email-templates/guide-nurture/stress";
import { voedingGuideTemplates } from "@/lib/email-templates/guide-nurture/voeding";
import { bewegingGuideTemplates } from "@/lib/email-templates/guide-nurture/beweging";
import { buildGenericGuideTemplates } from "@/lib/email-templates/guide-nurture/generic";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";
import type { GuideThema } from "@/types/guide-opt-in";

const FULL_TEMPLATES: Partial<
  Record<GuideThema, Record<GuideNurtureDay, GuideNurtureTemplate>>
> = {
  slaap: slaapGuideTemplates,
  stress: stressGuideTemplates,
  voeding: voedingGuideTemplates,
  beweging: bewegingGuideTemplates,
};

export function getGuideNurtureTemplate(
  thema: GuideThema,
  day: GuideNurtureDay,
): GuideNurtureTemplate | null {
  const full = FULL_TEMPLATES[thema];
  if (full?.[day]) {
    return full[day];
  }
  const generic = buildGenericGuideTemplates(thema);
  return generic[day] ?? null;
}

export function getGuideNurtureEmailContent(
  thema: GuideThema,
  sequenceDay: number,
  unsubscribeUrl: string,
): { subject: string; html: string } | null {
  const day = sequenceDay as GuideNurtureDay;
  const template = getGuideNurtureTemplate(thema, day);
  if (!template) {
    return null;
  }
  return {
    subject: template.subject,
    html: template.html(unsubscribeUrl),
  };
}

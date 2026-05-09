import { energieTemplates } from "./energie";
import { slaapTemplates } from "./slaap";
import { stressTemplates } from "./stress";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

export type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

const THEMA_TEMPLATES: Record<
  string,
  Record<ThemaNurtureDay, ThemaNurtureTemplate>
> = {
  slaap: slaapTemplates,
  stress: stressTemplates,
  energie: energieTemplates,
};

export function getThemaNurtureTemplate(
  thema: string,
  day: ThemaNurtureDay,
): ThemaNurtureTemplate | null {
  return THEMA_TEMPLATES[thema]?.[day] ?? null;
}

export function hasThemaNurtureSequence(thema: string): boolean {
  return thema in THEMA_TEMPLATES;
}

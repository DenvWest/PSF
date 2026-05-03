import { slaapTemplates } from "./slaap";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

export type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

const THEMA_TEMPLATES: Record<
  string,
  Record<ThemaNurtureDay, ThemaNurtureTemplate>
> = {
  slaap: slaapTemplates,
  // Toekomstige thema's:
  // stress: stressTemplates,
  // energie: energieTemplates,
  // herstel: herstelTemplates,
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

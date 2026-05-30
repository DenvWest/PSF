import type { DomainScores } from "@/lib/intake-engine";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { getThemeContentLinks } from "@/data/theme-content-map";
import { getPillarById } from "@/data/foundation-pyramid";
import type { ThemeSlug } from "@/lib/content/themes";

const FALLBACK_HREF = "/intake";

export interface PrimaryPillarDestination {
  theme: ThemeSlug;
  label: string;
  pillarHref: string;
}

/** Pillar-route voor een thema; valt terug op /intake als er (nog) geen pillar is. */
export function getThemePillarHref(theme: ThemeSlug): string {
  return getThemeContentLinks(theme).pillarHref ?? FALLBACK_HREF;
}

/** Hoogste prioriteit (laagste gemeten domein) -> tier-1 pillar. Puur, kanaal-onafhankelijk. */
export function getPrimaryPillarDestination(
  scores: DomainScores,
  answers: Record<string, number>,
): PrimaryPillarDestination {
  const theme = getPrimaryTheme(scores, answers);
  return {
    theme,
    label: getPillarById(theme)?.label ?? theme,
    pillarHref: getThemePillarHref(theme),
  };
}

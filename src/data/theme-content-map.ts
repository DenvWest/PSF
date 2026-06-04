import type { ThemeSlug } from "@/lib/content/themes";

export interface ThemeContentLinks {
  pillarHref: string | null;
  profileSlug: string | null;
  knowledgeSlugs: string[];
}

export const THEME_CONTENT_MAP: Record<ThemeSlug, ThemeContentLinks> = {
  sleep: {
    pillarHref: "/slaap-verbeteren-na-40",
    profileSlug: "onrustige-slaper",
    knowledgeSlugs: ["melatonine", "cortisol", "magnesiumvormen"],
  },
  stress: {
    pillarHref: "/stress-verminderen-man",
    profileSlug: "stressdrager",
    knowledgeSlugs: ["cortisol", "hpa-as", "nervus-vagus"],
  },
  nutrition: {
    pillarHref: "/voeding-na-40",
    profileSlug: "lage-batterij",
    knowledgeSlugs: ["eiwitbehoefte-na-40", "insulineresistentie"],
  },
  movement: {
    pillarHref: "/herstel-verbeteren-na-40",
    profileSlug: "overtrainer",
    knowledgeSlugs: ["eiwitbehoefte-na-40", "overtrainingssyndroom"],
  },
  connection: {
    pillarHref: null,
    profileSlug: null,
    knowledgeSlugs: [],
  },
};

export function getThemeContentLinks(theme: ThemeSlug): ThemeContentLinks {
  return THEME_CONTENT_MAP[theme];
}

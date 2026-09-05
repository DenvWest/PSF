import { type KennisbankTerm, type KennisbankTheme } from "@/data/kennisbank";
import { publicJpgForSlug } from "@/lib/public-jpg";

export interface KennisbankCover {
  src: string;
  alt: string;
}

const THEME_COVER_ALT: Record<KennisbankTheme, string> = {
  "lichaam-veroudering": "Lichaam en veroudering — wat er na je veertigste verandert",
  "leefstijl-herstel": "Leefstijl en herstel — de basis vóór supplementen",
  supplementwetenschap: "Supplementwetenschap — begrippen om producten te beoordelen",
  longevity: "Longevity — langer vitaal blijven, zonder hype",
  "ps-score": "PS-Score — hoe PerfectSupplement producten weegt",
};

export function kennisbankThemeCover(theme: KennisbankTheme): KennisbankCover | undefined {
  const src = publicJpgForSlug("/images/kennisbank", `thema-${theme}`);
  if (!src) {
    return undefined;
  }
  return { src, alt: THEME_COVER_ALT[theme] };
}

export function kennisbankCover(term: KennisbankTerm): KennisbankCover | undefined {
  const src =
    publicJpgForSlug("/images/kennisbank", term.slug) ??
    kennisbankThemeCover(term.theme)?.src;
  if (!src) {
    return undefined;
  }
  return {
    src,
    alt: `${term.term} — ${term.shortDefinition}`.slice(0, 140),
  };
}

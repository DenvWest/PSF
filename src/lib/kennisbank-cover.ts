import {
  themeLabels,
  type KennisbankTerm,
  type KennisbankTheme,
} from "@/data/kennisbank";

export interface KennisbankCover {
  src: string;
  alt: string;
}

/**
 * Thema-fallbackbeelden (hubs / nieuwe begrippen zonder eigen cover).
 * Begrippen hebben normaal een eigen `coverImage` — zie `kennisbankCover()`.
 */
const THEMA_COVER: Record<KennisbankTheme, KennisbankCover> = {
  "lichaam-veroudering": {
    src: "/images/kennisbank/thema-lichaam-veroudering.jpg",
    alt: "Bergmeer tussen dennen en pieken in zacht licht",
  },
  "leefstijl-herstel": {
    src: "/images/kennisbank/thema-leefstijl-herstel.jpg",
    alt: "Onopgemaakt bed in natuurlijk ochtendlicht",
  },
  supplementwetenschap: {
    src: "/images/kennisbank/thema-supplementwetenschap.jpg",
    alt: "Houten lepels met kleurrijke kruidenpoeders",
  },
  longevity: {
    src: "/images/kennisbank/thema-longevity.jpg",
    alt: "Bergmeer met sparren en pieken in avondlicht",
  },
  "ps-score": {
    src: "/images/kennisbank/thema-ps-score.jpg",
    alt: "Notitieboek, pen en thee op een gebreide deken",
  },
};

export function themaCover(theme: KennisbankTheme): KennisbankCover {
  return THEMA_COVER[theme];
}

/** Begripeigen beeld wint; anders valt het terug op het themabeeld. */
export function kennisbankCover(
  term: Pick<KennisbankTerm, "theme" | "coverImage" | "coverImageAlt">,
): KennisbankCover {
  if (term.coverImage) {
    return {
      src: term.coverImage,
      alt: term.coverImageAlt || themaCover(term.theme).alt,
    };
  }
  return themaCover(term.theme);
}

export const ALLE_THEMA_COVERS = Object.entries(THEMA_COVER).map(
  ([id, cover]) => ({
    theme: id as KennisbankTheme,
    naam: themeLabels[id as KennisbankTheme].title,
    ...cover,
  }),
);

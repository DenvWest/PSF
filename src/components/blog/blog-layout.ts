/** Shared layout tokens for blog / Herstelbibliotheek surfaces */

export const BLOG_HUB_LABEL = "Herstelbibliotheek";

/** Blog surface background (#F7F5F0) */
export const BLOG_BG_CLASS = "bg-[#F7F5F0]";

/** Clears sticky site header (~72px) + buffer on mobile */
export const BLOG_HERO_PT = "pt-[5.75rem] md:pt-28";

/** Tighter gap before category grid (hub rhythm) */
export const BLOG_HERO_PB = "pb-6 md:pb-8";

export const BLOG_HERO_H1 =
  "font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-stone-900 scroll-mt-24";

export const BLOG_HERO_INTRO =
  "mt-6 max-w-xl text-[1.0625rem] leading-[1.82] text-stone-700 md:text-[1.125rem]";

/** Extra breathing room for conversion blocks (thema + intake) */
export const BLOG_CONVERSION_SECTION_PY = "py-28 md:py-40";

export const BLOG_SECTION_PY = "py-24 md:py-32";

export const BLOG_EDITORIAL_LINK =
  "text-[0.9375rem] text-stone-600 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900 hover:decoration-stone-500";

export const BLOG_NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const BLOG_CATEGORY_CARD =
  "group relative flex min-h-[252px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-[3px] [@media(hover:hover)]:hover:shadow-2xl [@media(hover:hover)]:hover:shadow-black/20 md:min-h-[292px]";

export const BLOG_CATEGORY_ICON_BOX =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/20";

export const BLOG_CATEGORY_ARROW =
  "inline-flex shrink-0 items-center text-base font-normal leading-none text-white/85 transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:translate-x-1";

export const BLOG_CATEGORY_META =
  "text-xs font-medium tracking-wide text-white/55";

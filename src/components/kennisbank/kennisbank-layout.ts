/** Kennisbank layout tokens — editorial reference library */

export const KB_HUB_LABEL = "Kennisbank";

export const KB_BG_CLASS = "bg-[#F7F5F0]";

export const KB_HERO_PT = "pt-[5.75rem] md:pt-32";

export const KB_HERO_PB = "pb-5 md:pb-7";

export const KB_HERO_H1 =
  "font-display text-[clamp(2.35rem,5.2vw,4rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-stone-900 scroll-mt-24";

export const KB_HERO_INTRO =
  "mt-6 max-w-xl text-[1.0625rem] leading-[1.82] text-stone-600 md:text-[1.125rem] md:leading-[1.78]";

export const KB_NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const KB_CARD_SHELL =
  "overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_40px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/50";

export const KB_THEMA_CARD =
  "group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br transition-[transform,box-shadow] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-[3px] [@media(hover:hover)]:hover:shadow-2xl [@media(hover:hover)]:hover:shadow-black/25 md:min-h-[300px]";

export const KB_ICON_BOX =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/25";

export const KB_CARD_ARROW =
  "inline-flex shrink-0 items-center text-base font-normal leading-none text-white/90 transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:translate-x-1";

export const KB_CARD_META = "text-xs font-medium tracking-[0.06em] text-white/55";

export const KB_CONVERSION_PY = "py-32 md:py-44";

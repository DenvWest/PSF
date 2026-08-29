/**
 * Gedeelde vormtaal voor de bibliotheekoppervlakken (blog + kennisbank).
 * Bewust dezelfde bouwstenen als de supplementencatalogus en het dashboard:
 * witte vlakken op een warme ondergrond, een dunne stone-ring in plaats van
 * slagschaduw, en ps-green als enige accentkleur voor keuzes.
 */

export const LIB_PAGE_BG = "bg-[#F7F5F0]";

export const LIB_SHELL =
  "grid grid-cols-1 gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8";

export const LIB_ASIDE =
  "flex flex-col gap-3 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:gap-6 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-10 lg:pr-2 lg:scrollbar-slim";

export const LIB_PANEL =
  "rounded-2xl border border-stone-200/70 bg-white p-4 lg:p-5";

export const LIB_EYEBROW =
  "font-display text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-stone-400";

export const LIB_CARD =
  "group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-[border-color,box-shadow,transform] duration-200 ease-out [@media(hover:hover)]:hover:-translate-y-[2px] [@media(hover:hover)]:hover:border-stone-300 [@media(hover:hover)]:hover:shadow-[0_10px_30px_rgba(28,25,23,0.07)]";

export const LIB_CHIP =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium leading-none";

export const LIB_META =
  "text-[0.75rem] tabular-nums text-stone-400";

/** Accentstaafje links op de kaart, per categorie/thema. */
export const LIB_RAIL =
  "pointer-events-none absolute inset-y-0 left-0 w-[3px]";

export const LIB_TOOLBAR_BUTTON =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-[0.8125rem] text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900";

/**
 * Desktop editorial grid: TOC-kolom + rail + hoofdtekst (max ~70ch).
 * Hero en body gebruiken dezelfde spacer-breedtes zodat H1 en proza uitlijnen.
 */
export const READING_TOC_COL_CLASS = "w-[10.25rem] shrink-0 xl:w-[12.5rem]"
export const READING_RAIL_COL_CLASS = "flex w-2 shrink-0 justify-center self-stretch pt-1"
/** Hoofdtekstkolom: max ~70ch, mag krimpen op smalle lg-viewports (min-w-0). */
export const READING_MAIN_COL_CLASS = 'min-w-0 w-full max-w-[70ch] flex-1'
export const READING_ROW_GAP_CLASS = "gap-x-6"

/** Compact sticky chrome (telefoon + iPad). Zijbalk vanaf xl (1280px). */
export const READING_COMPACT_ONLY_CLASS = "xl:hidden"
export const READING_SIDEBAR_ONLY_CLASS = "hidden xl:block"
export const READING_SIDEBAR_FLEX_CLASS = "hidden xl:flex"
export const READING_SPLIT_ROW_CLASS = "flex-col xl:flex-row"

/** Toon inhoudsopgave niet bij zeer korte artikelen (< 3 koppen). */
export const ARTICLE_HIDE_TOC_BELOW_ITEMS = 3

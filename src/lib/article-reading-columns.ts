/**
 * Desktop editorial grid: TOC-kolom + rail + hoofdtekst (max ~70ch).
 * Hero en body gebruiken dezelfde spacer-breedtes zodat H1 en proza uitlijnen.
 */
export const READING_TOC_COL_CLASS = "w-[10.25rem] shrink-0"
export const READING_RAIL_COL_CLASS = "flex w-2 shrink-0 justify-center self-stretch pt-1"
/** Zelfde breedte als rail-kolom, voor hero-uitlijning (geen progress). */
export const READING_RAIL_GUTTER_PLACEHOLDER_CLASS = "hidden w-2 shrink-0 lg:block"
/** Hoofdtekstkolom: max ~70ch, mag krimpen op smalle lg-viewports (min-w-0). */
export const READING_MAIN_COL_CLASS = 'min-w-0 w-full max-w-[70ch] flex-1'
export const READING_ROW_GAP_CLASS = "gap-x-6"

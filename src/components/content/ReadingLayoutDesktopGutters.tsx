import {
  READING_RAIL_GUTTER_PLACEHOLDER_CLASS,
  READING_TOC_COL_CLASS,
} from '@/lib/article-reading-columns'

/** Zelfde linker kolombreedtes als ArticleBodyReadingChrome (alleen lg+). */
export default function ReadingLayoutDesktopGutters() {
  return (
    <>
      <div className={`${READING_TOC_COL_CLASS} hidden shrink-0 lg:block`} aria-hidden />
      <div className={READING_RAIL_GUTTER_PLACEHOLDER_CLASS} aria-hidden />
    </>
  )
}

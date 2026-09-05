import type { ReactNode } from "react";
import {
  READING_RAIL_COL_CLASS,
  READING_ROW_GAP_CLASS,
  READING_SIDEBAR_FLEX_CLASS,
  READING_SIDEBAR_ONLY_CLASS,
  READING_SPLIT_ROW_CLASS,
  READING_TOC_COL_CLASS,
} from "@/lib/article-reading-columns";

interface ArticleReadingFrameProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Eén doorlopende leesrij: sticky TOC-kolom naast cover + titel + body.
 * Stretch op de aside is verplicht — anders is de sticky-container even hoog
 * als de TOC en reist die niet mee tijdens het scrollen.
 * Zijbalk vanaf xl; telefoon + iPad gebruiken de compacte sticky leesbalk.
 */
export default function ArticleReadingFrame({
  sidebar,
  children,
}: ArticleReadingFrameProps) {
  return (
    <div className={`flex w-full min-w-0 ${READING_SPLIT_ROW_CLASS} ${READING_ROW_GAP_CLASS}`}>
      <aside className={`${READING_TOC_COL_CLASS} ${READING_SIDEBAR_ONLY_CLASS} min-h-0 self-stretch`}>
        <div className="sticky top-[var(--sticky-toc-offset)] max-h-[calc(100vh-var(--sticky-toc-offset)-2rem)] overflow-y-auto pb-14 pt-0.5 xl:pb-16">
          {sidebar}
        </div>
      </aside>
      <div className={`${READING_RAIL_COL_CLASS} ${READING_SIDEBAR_FLEX_CLASS}`} aria-hidden="true">
        <div className="relative min-h-24 w-[2px] flex-1 overflow-hidden rounded-full bg-stone-200/92" />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

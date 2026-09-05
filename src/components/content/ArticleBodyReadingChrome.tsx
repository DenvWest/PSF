'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'
import ArticleTableOfContents from '@/components/content/ArticleTableOfContents'
import {
  ARTICLE_HIDE_TOC_BELOW_ITEMS,
  READING_COMPACT_ONLY_CLASS,
  READING_MAIN_COL_CLASS,
  READING_RAIL_COL_CLASS,
  READING_ROW_GAP_CLASS,
  READING_SIDEBAR_FLEX_CLASS,
  READING_SIDEBAR_ONLY_CLASS,
  READING_SPLIT_ROW_CLASS,
  READING_TOC_COL_CLASS,
} from '@/lib/article-reading-columns'
import { parseReadingAnchorLinePx, readingProgressFraction } from '@/lib/reading-metrics'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ArticleBodyReadingChromeProps {
  tocItems: ArticleTocItem[]
  hideTocBelowItemCount?: number
  children: React.ReactNode
}

export default function ArticleBodyReadingChrome({
  tocItems,
  hideTocBelowItemCount = ARTICLE_HIDE_TOC_BELOW_ITEMS,
  children,
}: ArticleBodyReadingChromeProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const schedulingRef = useRef(false)

  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(tocItems[0]?.id ?? null)
  const [showBackTop, setShowBackTop] = useState(false)

  const showToc = tocItems.length >= hideTocBelowItemCount
  const ids = useMemo(() => tocItems.map((t) => t.id), [tocItems])

  const flush = useCallback(() => {
    schedulingRef.current = false
    rafRef.current = null

    setProgress(readingProgressFraction(measureRef.current))
    setShowBackTop(window.scrollY > 420)

    if (ids.length === 0) return
    const line = parseReadingAnchorLinePx() + 4
    let winner: string | null = ids[0] ?? null
    for (const id of ids) {
      const node = document.getElementById(id)
      if (!node) continue
      if (node.getBoundingClientRect().top <= line) winner = id
    }
    setActiveId(winner)
  }, [ids])

  const schedule = useCallback(() => {
    if (typeof window === 'undefined') return
    if (schedulingRef.current) return
    schedulingRef.current = true
    rafRef.current = window.requestAnimationFrame(flush)
  }, [flush])

  useEffect(() => {
    flush()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [flush, schedule])

  useEffect(() => {
    const root = measureRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => schedule())
    ro.observe(root)
    return () => ro.disconnect()
  }, [schedule])

  const onBackTopClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full lg:scroll-pt-[var(--reading-scroll-margin)]">
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] md:hidden"
        aria-hidden="true"
      >
        <div className="h-px bg-stone-200/95" />
        <div className="h-[2px] w-full bg-stone-200/95">
          <div
            className="motion-safe:ease-linear h-full w-full origin-left bg-stone-500/90 motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      <div
        className={`flex w-full min-w-0 items-stretch ${READING_SPLIT_ROW_CLASS} ${READING_ROW_GAP_CLASS} ${
          showToc ? '' : 'xl:justify-center'
        }`}
      >
        {showToc ? (
          <aside className={`${READING_TOC_COL_CLASS} ${READING_SIDEBAR_ONLY_CLASS} min-h-0`}>
            <div className="sticky top-[var(--sticky-toc-offset)] pb-14 pt-0.5 xl:pb-16">
              <ArticleTableOfContents items={tocItems} activeId={activeId} />
            </div>
          </aside>
        ) : null}

        {showToc ? (
          <div className={`${READING_RAIL_COL_CLASS} ${READING_SIDEBAR_FLEX_CLASS}`} aria-hidden="true">
            <div className="relative min-h-[6rem] w-[2px] flex-1 overflow-hidden rounded-full bg-stone-200/92">
              <div
                className="motion-safe:ease-linear absolute left-0 top-0 h-full w-full origin-top rounded-full bg-stone-600/88 motion-safe:transition-transform motion-safe:duration-[130ms]"
                style={{ transform: `scaleY(${progress})` }}
              />
            </div>
          </div>
        ) : null}

        <div
          ref={measureRef}
          className={`${READING_MAIN_COL_CLASS} mx-auto ${showToc ? 'xl:mx-0' : ''}`}
        >
          {showToc ? (
            <div className={`mb-9 ${READING_COMPACT_ONLY_CLASS}`}>
              <ArticleTableOfContents items={tocItems} activeId={activeId} />
            </div>
          ) : null}
          <div className="relative min-w-0">{children}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackTopClick}
        aria-label="Terug naar boven"
        className={`group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[55] inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white/95 px-4 py-2.5 text-[0.75rem] font-semibold text-stone-700 shadow-[0_4px_16px_rgba(28,25,23,0.1)] backdrop-blur-md motion-safe:transition-[opacity,transform,border-color,color,background-color,box-shadow] motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ps-green/40 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:border-ps-green/45 hover:bg-ps-green-light/50 hover:text-ps-green hover:shadow-[0_8px_22px_rgba(90,143,106,0.22)] md:bottom-8 md:right-8 ${
          showBackTop ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span
          aria-hidden
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-stone-400 transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:text-ps-green"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3 w-3">
            <path
              d="M3.25 9.75 8 5l4.75 4.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Naar boven
      </button>
    </div>
  )
}

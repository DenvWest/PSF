'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'
import ArticleTableOfContents from '@/components/content/ArticleTableOfContents'
import { parseReadingAnchorLinePx } from '@/lib/reading-metrics'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Toon inhoudsopgave niet bij zeer korte artikelen (< 3 koppen). */
export const ARTICLE_HIDE_TOC_BELOW_ITEMS = 3

interface ArticleBodyReadingChromeProps {
  tocItems: ArticleTocItem[]
  hideTocBelowItemCount?: number
  children: React.ReactNode
}

/** Voortgang 0–1 op basis van positie langs het meetbare artikel‑blok. */
function readingProgressFraction(el: HTMLElement | null): number {
  if (!el) return 0
  const anchor = parseReadingAnchorLinePx()
  const scrollY = window.scrollY
  const viewH = window.visualViewport?.height ?? window.innerHeight
  const rect = el.getBoundingClientRect()
  const top = scrollY + rect.top
  const height = Math.max(el.scrollHeight, el.offsetHeight)
  const bottom = top + height
  const readableStart = top - anchor
  const readableEnd = Math.max(readableStart + viewH * 0.42, bottom - viewH * 0.32)
  const span = readableEnd - readableStart
  if (span < 64) return scrollY >= readableStart ? 1 : 0
  return Math.min(1, Math.max(0, (scrollY - readableStart) / span))
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
    <div className="relative lg:scroll-pt-[var(--reading-scroll-margin)]">
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] md:hidden"
        aria-hidden="true"
      >
        <div className="h-px bg-stone-200/95" />
        <div className="h-[2px] w-full bg-stone-200/95">
          <div
            className="h-full w-full origin-left bg-stone-500/90 motion-safe:transition-transform motion-safe:duration-100 motion-safe:ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      <div
        className={`mx-auto w-full max-w-[min(92rem,calc(100vw-2rem))] ${
          showToc ? 'lg:grid lg:grid-cols-[minmax(9.25rem,10.25rem)_1fr] lg:gap-x-[clamp(1.25rem,3vw,2.25rem)]' : ''
        }`}
      >
        {showToc ? (
          <aside className="hidden min-h-0 lg:block">
            <div className="sticky top-[var(--sticky-toc-offset)] pb-14 pt-0.5 xl:pb-16">
              <ArticleTableOfContents items={tocItems} activeId={activeId} />
            </div>
          </aside>
        ) : null}

        <div className={showToc ? 'min-w-0' : 'lg:col-span-full'}>
          <div className="flex justify-center">
            <div ref={measureRef} className="relative w-full max-w-[68ch] lg:max-w-[70ch]">
              <div
                className="pointer-events-none absolute -left-2 top-0 bottom-0 z-0 hidden w-[2px] overflow-hidden lg:block xl:-left-2.5"
                aria-hidden="true"
              >
                <div className="h-full rounded-full bg-stone-200/90" />
                <div
                  className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-stone-600/88 motion-safe:transition-transform motion-safe:duration-[120ms] motion-safe:ease-linear"
                  style={{ transform: `scaleY(${progress})` }}
                />
              </div>

              {showToc ? (
                <div className="mb-9 lg:hidden">
                  <ArticleTableOfContents items={tocItems} activeId={activeId} />
                </div>
              ) : null}

              <div className="relative">{children}</div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackTopClick}
        aria-label="Terug naar boven"
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[55] rounded-full border border-stone-300/95 bg-white/95 px-[0.9rem] py-2 text-[0.75rem] font-medium text-stone-700 backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/45 focus-visible:ring-offset-2 hover:border-stone-400 hover:text-stone-900 md:bottom-8 md:right-8 ${
          showBackTop ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Naar boven
      </button>
    </div>
  )
}

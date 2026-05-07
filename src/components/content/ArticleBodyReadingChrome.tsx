'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ArticleTableOfContents from '@/components/content/ArticleTableOfContents'

const PROGRESS_GUIDE_TOP = 88
/** Toon inhoudsopgave niet bij zeer korte artikelen (< 3 koppen). */
export const ARTICLE_HIDE_TOC_BELOW_ITEMS = 3

interface ArticleBodyReadingChromeProps {
  tocItems: ArticleTocItem[]
  /** TOC verbergen wanneer `tocItems.length` strikt kleiner is dan deze waarde. */
  hideTocBelowItemCount?: number
  /** Hoofdtekst óf combinatie hoofdtekst + referenties (alles waar de lezer doorheen “leest”). */
  children: React.ReactNode
}

/** Lees‑progress tussen boven‑ en onderkant van het meetbare blok (smooth, geen zware animatie). */
function readingProgressRatio(el: HTMLElement | null): number {
  if (!el) return 0
  const docTop = el.getBoundingClientRect().top + window.scrollY
  const scrollEnd = Math.max(docTop + el.offsetHeight - window.innerHeight * 0.28, docTop + 24)
  const scrollStart = Math.max(0, docTop - PROGRESS_GUIDE_TOP)
  const denom = scrollEnd - scrollStart
  if (denom < 120) return 1
  return Math.min(1, Math.max(0, (window.scrollY - scrollStart) / denom))
}

export default function ArticleBodyReadingChrome({
  tocItems,
  hideTocBelowItemCount = ARTICLE_HIDE_TOC_BELOW_ITEMS,
  children,
}: ArticleBodyReadingChromeProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(tocItems[0]?.id ?? null)
  const [showBackTop, setShowBackTop] = useState(false)

  const showToc = tocItems.length >= hideTocBelowItemCount
  const ids = useMemo(() => tocItems.map((t) => t.id), [tocItems])

  const updateFromScroll = useCallback(() => {
    setProgress(readingProgressRatio(measureRef.current))
    setShowBackTop(window.scrollY > 480)
  }, [])

  useEffect(() => {
    updateFromScroll()
    window.addEventListener('scroll', updateFromScroll, { passive: true })
    window.addEventListener('resize', updateFromScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateFromScroll)
      window.removeEventListener('resize', updateFromScroll)
    }
  }, [updateFromScroll])

  useEffect(() => {
    if (ids.length === 0) return
    const elems = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => Boolean(e))

    const computeActive = () => {
      const line = PROGRESS_GUIDE_TOP
      let current = ids[0] ?? null
      for (let i = 0; i < elems.length; i++) {
        const top = elems[i]!.getBoundingClientRect().top
        if (top <= line + 10) current = ids[i]!
      }
      setActiveId(current)
    }

    computeActive()
    window.addEventListener('scroll', computeActive, { passive: true })
    window.addEventListener('resize', computeActive, { passive: true })
    return () => {
      window.removeEventListener('scroll', computeActive)
      window.removeEventListener('resize', computeActive)
    }
  }, [ids])

  const onBackTopClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const barLeft = 'max(10px, env(safe-area-inset-left))'

  return (
    <div className="relative lg:scroll-pt-[var(--reading-scroll-margin)]">
      {/* Mobiel — dunne voortgang bovenaan */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] md:hidden"
        aria-hidden="true"
      >
        <div className="h-px bg-stone-100" />
        <div
          className="h-[2px] w-full bg-stone-500/90"
          style={{
            transform: `scaleX(${progress})`,
            transformOrigin: "left",
            transition: "transform 140ms linear",
          }}
        />
      </div>

      {/* Desktop — verticale balk langs kantlijnt */}
      <div
        className="pointer-events-none fixed bottom-[16%] top-[26%] z-[46] hidden w-px md:block"
        style={{ left: barLeft }}
        aria-hidden="true"
      >
        <div className="h-full rounded-full bg-stone-300/95" />
        <div
          className="absolute left-0 top-0 w-px rounded-full bg-stone-700/95"
          style={{ height: `${progress * 100}%`, maxHeight: '100%', transition: 'height 140ms linear' }}
        />
      </div>

      {/* Kolommen: TOC + meetbare hoofdtekst (+ optioneel refereerblok als child) */}
      <div className="mx-auto w-full max-w-[calc(100vw-1.75rem)] md:max-w-none lg:mr-auto lg:ml-[max(0px,calc(1.25rem+env(safe-area-inset-left)))] lg:flex lg:max-w-[min(var(--reading-layout-max-width),calc(100vw-2.5rem))] lg:flex-row-reverse lg:items-start lg:gap-x-[clamp(2rem,4vw,3.5rem)] xl:gap-x-[clamp(2.5rem,5vw,4.5rem)]">
        <div className="reading-prose-column min-w-0 flex-1 lg:max-w-[72ch]" ref={measureRef}>
          {showToc && (
            <div className="mb-10 lg:hidden">
              <ArticleTableOfContents items={tocItems} activeId={activeId} />
            </div>
          )}
          {children}
        </div>

        {showToc && (
          <div className="hidden shrink-0 lg:block lg:w-[min(13.5rem,22vw)]">
            <nav
              className="sticky top-[var(--sticky-toc-offset)] pb-12 xl:pb-14"
              aria-label="Pagina‑navigatie"
            >
              <ArticleTableOfContents items={tocItems} activeId={activeId} />
            </nav>
          </div>
        )}
      </div>

      {/* Terug naar boven */}
      <button
        type="button"
        onClick={onBackTopClick}
        aria-label="Terug naar boven"
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[55] rounded-full border border-stone-300/95 bg-white/95 px-[0.9rem] py-2 text-[0.75rem] font-medium text-stone-700 shadow-sm backdrop-blur-[2px] transition-opacity duration-200 hover:border-stone-400 hover:text-stone-900 md:bottom-8 md:right-8 ${
          showBackTop ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Naar boven
      </button>
    </div>
  )
}

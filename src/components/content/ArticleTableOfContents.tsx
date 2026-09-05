'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'
import { useId, useRef, useState } from 'react'

interface ArticleTableOfContentsProps {
  items: ArticleTocItem[]
  activeId: string | null
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: "smooth", block: "start" })
  window.history.replaceState(null, "", `#${id}`)
  try {
    if (el && "focus" in el && typeof (el as HTMLElement).focus === "function") {
      ;(el as HTMLElement).focus({ preventScroll: true })
    }
  } catch {
    /* focus niet verplicht */
  }
}

function handleNavClick(e: ReactMouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  scrollToHeading(id)
}

export default function ArticleTableOfContents({ items, activeId }: ArticleTableOfContentsProps) {
  const labelId = useId()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (items.length === 0) return null

  const activeItem = items.find((item) => item.id === activeId) ?? items[0]

  const handleMobileNavClick = (e: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollToHeading(id)
    setMobileOpen(false)
    if (detailsRef.current) detailsRef.current.open = false
  }

  return (
    <nav
      aria-labelledby={labelId}
      className="contents leading-[1.38] tracking-[-0.01em] text-stone-500 lg:block"
    >
      <p
        id={labelId}
        className="mb-3 hidden font-display text-[0.62rem] font-medium uppercase tracking-[0.09em] text-stone-400 lg:block"
      >
        Op deze pagina
      </p>
      {/* Desktop */}
      <ul className="hidden max-h-[min(68vh,28rem)] list-none space-y-0 overflow-y-auto overscroll-contain pr-2 lg:block">
        {items.map((item) => {
          const active = activeId === item.id
          const indent = item.depth === 3
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`block border-l-[1.5px] py-[0.4375rem] pl-3 text-[0.75rem] outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 lg:py-[0.375rem] ${
                  indent
                    ? 'ml-px border-l-transparent pl-[1.0625rem] text-[0.72rem] leading-[1.42] text-stone-500'
                    : 'border-l-transparent pt-[0.2rem] leading-[1.42]'
                } ${
                  active
                    ? 'border-l-[rgb(148_142_136_/_0.88)] bg-stone-50/70 text-stone-800'
                    : 'border-l-transparent text-stone-500 hover:border-l-stone-200/95 hover:bg-stone-50/50 hover:text-stone-700 focus-visible:bg-stone-50/90 focus-visible:ring-1 focus-visible:ring-stone-300/80'
                }`}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Mobiel: blijft sticky onder de header mee scrollen */}
      <details
        ref={detailsRef}
        open={mobileOpen}
        onToggle={(e) => setMobileOpen((e.target as HTMLDetailsElement).open)}
        className="group sticky top-[var(--sticky-toc-mobile-offset)] z-40 mb-9 rounded-xl border border-stone-200/70 bg-white/85 px-4 shadow-[0_2px_10px_rgba(28,25,23,0.06)] backdrop-blur-md lg:hidden lg:mb-0 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-200 [&[open]]:shadow-[0_10px_28px_rgba(28,25,23,0.1)]"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-[0.625rem] py-3 text-stone-700 outline-none select-none [&::-webkit-details-marker]:hidden focus-visible:bg-ps-green-light/40 focus-visible:ring-2 focus-visible:ring-ps-green/40">
          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ps-green-light text-ps-green"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2.5 4h11M2.5 8h11M2.5 12h6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.66rem] font-medium uppercase tracking-[0.08em] text-stone-400">
              Inhoudsopgave
            </span>
            <span className="mt-0.5 block truncate text-[0.8125rem] font-semibold tracking-tight text-stone-900">
              {activeItem?.label ?? 'Op deze pagina'}
            </span>
          </span>
          <span
            className="inline-flex shrink-0 text-stone-400 motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
            aria-hidden
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M4 6 L8 10 L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <ul className="scroll-py-px max-h-[min(56vh,26rem)] list-none overflow-y-auto border-t border-stone-100 pb-3 pt-2">
          {items.map((item) => {
            const active = activeId === item.id
            return (
              <li key={`m-${item.id}`}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleMobileNavClick(e, item.id)}
                  className={`block rounded-lg border border-transparent px-2.5 py-2.5 text-[0.8125rem] outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 focus-visible:bg-ps-green-light/40 focus-visible:ring-[1px] focus-visible:ring-ps-green/40 ${
                    item.depth === 3 ? 'ml-2 border-l border-stone-200/85 pl-[1.0625rem] text-[0.78rem]' : 'pl-[0.5rem]'
                  } ${active ? 'bg-ps-green-light/50 font-medium text-ps-green' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'} `}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </details>
    </nav>
  )
}

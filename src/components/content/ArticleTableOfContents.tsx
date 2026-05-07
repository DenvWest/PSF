'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'

interface ArticleTableOfContentsProps {
  items: ArticleTocItem[]
  /** actieve sectie-id voor highlight */
  activeId: string | null
}

function handleNavClick(e: ReactMouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
}

export default function ArticleTableOfContents({ items, activeId }: ArticleTableOfContentsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-labelledby="toc-heading" className="text-[0.8125rem] leading-snug">
      <h2
        id="toc-heading"
        className="mb-4 font-display text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone-500"
      >
        Op deze pagina
      </h2>
      {/* Desktop: platte nav */}
      <ul className="hidden max-h-[min(70vh,32rem)] list-none overflow-y-auto overscroll-contain lg:block lg:space-y-0 lg:pb-8 lg:pr-3">
        {items.map((item) => {
          const active = activeId === item.id
          const indent = item.depth === 3
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`block border-l-[2px] py-2 pl-3 transition-colors ${
                  indent ? 'ml-[2px] border-stone-200/80 py-1.5 pl-5 text-[0.8125rem] leading-snug' : ''
                } ${active ? 'border-l-stone-800 text-stone-900' : 'border-l-transparent text-stone-500 hover:border-l-stone-300 hover:text-stone-800'}`}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Mobile: compact uitklappen */}
      <details className="group rounded-xl border border-stone-200/90 bg-white p-px shadow-[0_1px_2px_rgb(28_25_23_/_0.04)] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-[0.6875rem] px-4 py-3 text-stone-700 outline-none [&::-webkit-details-marker]:hidden [&_svg]:shrink-0">
          <span className="font-medium text-[0.875rem]">Inhoudsopgave</span>
          <span className="text-stone-400 transition-transform duration-150 group-open:rotate-180" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </summary>
        <ul className="max-h-[50vh] list-none overflow-y-auto border-t border-stone-100 pb-3 pt-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`block border-l-[2px] py-2.5 transition-colors ${item.depth === 3 ? 'border-stone-200/70 pl-6 text-[0.8rem]' : 'border-stone-200/70 pl-4'} ${
                  activeId === item.id ? 'border-l-stone-700 font-medium text-stone-900' : 'border-l-transparent text-stone-600'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  )
}

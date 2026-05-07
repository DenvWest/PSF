'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ArticleTocItem } from '@/types/article-reading'
import { useId } from 'react'

interface ArticleTableOfContentsProps {
  items: ArticleTocItem[]
  activeId: string | null
}

function handleNavClick(e: ReactMouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
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

export default function ArticleTableOfContents({ items, activeId }: ArticleTableOfContentsProps) {
  const labelId = useId()
  if (items.length === 0) return null

  return (
    <nav aria-labelledby={labelId} className="leading-[1.38] tracking-[-0.01em] text-stone-500">
      <p
        id={labelId}
        className="mb-3 font-display text-[0.62rem] font-medium uppercase tracking-[0.09em] text-stone-400"
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

      {/* Mobiel */}
      <details className="group rounded-lg border border-stone-200/80 bg-white/90 lg:hidden motion-safe:transition-[border-color] motion-safe:duration-150">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-[0.5625rem] px-4 py-[0.7rem] text-stone-600 outline-none select-none [&::-webkit-details-marker]:hidden focus-visible:bg-stone-50/95 focus-visible:ring-2 focus-visible:ring-stone-300/50 focus-visible:ring-offset-2">
          <span className="text-[0.8125rem] font-medium tracking-tight">Inhoudsopgave</span>
          <span
            className="inline-flex text-stone-400 motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-180"
            aria-hidden
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M4 6 L8 10 L12 6"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <ul className="scroll-py-px list-none overflow-y-auto border-t border-stone-100/90 px-3 pb-2.5 pt-1">
          {items.map((item) => {
            const active = activeId === item.id
            return (
              <li key={`m-${item.id}`}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`block rounded-md border border-transparent px-2 py-2 text-[0.8125rem] outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 focus-visible:bg-stone-50/98 focus-visible:ring-[1px] focus-visible:ring-stone-300 ${
                    item.depth === 3 ? 'border-l border-stone-200/85 pl-[1.0625rem] text-[0.78rem]' : 'border-l-transparent pl-[0.5rem]'
                  } ${active ? 'border-l-[#bab6b3] bg-stone-50/90 text-stone-900' : 'border-l-transparent text-stone-600 hover:bg-stone-50/80 hover:text-stone-800'} `}
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

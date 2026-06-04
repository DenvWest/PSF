'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parseReadingAnchorLinePx } from '@/lib/reading-metrics'

interface TableOfContentsProps {
  headings: { id: string; text: string }[]
}

function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${id}`)
  try {
    if (el && typeof (el as HTMLElement).focus === 'function') {
      ;(el as HTMLElement).focus({ preventScroll: true })
    }
  } catch {
    // focus niet verplicht
  }
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings])
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)
  const rafRef = useRef<number | null>(null)
  const schedulingRef = useRef(false)

  const flush = useCallback(() => {
    schedulingRef.current = false
    rafRef.current = null
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
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [schedule])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Inhoudsopgave" className="leading-[1.38] tracking-[-0.01em]">
      <p className="mb-3 font-display text-[0.62rem] font-medium uppercase tracking-[0.09em] text-stone-400">
        In dit artikel
      </p>
      <ul className="list-none">
        {headings.map((heading) => {
          const active = activeId === heading.id
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleNavClick(e, heading.id)}
                className={`block border-l-[1.5px] py-[0.375rem] pl-3 text-[0.75rem] leading-[1.42] outline-none motion-safe:transition-[color,border-color,background-color] motion-safe:duration-150 ${
                  active
                    ? 'border-l-[rgb(148_142_136_/_0.88)] bg-stone-50/70 text-stone-800'
                    : 'border-l-transparent text-stone-500 hover:border-l-stone-200/95 hover:bg-stone-50/50 hover:text-stone-700 focus-visible:bg-stone-50/90 focus-visible:ring-1 focus-visible:ring-stone-300/80'
                }`}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

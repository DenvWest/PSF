'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleReadingProgressBar from '@/components/content/ArticleReadingProgressBar'
import FloatingLeefstijlcheckCta from '@/components/ui/FloatingLeefstijlcheckCta'
import { readingProgressFraction } from '@/lib/reading-metrics'

interface PillarReadingChromeProps {
  children: React.ReactNode
}

export default function PillarReadingChrome({ children }: PillarReadingChromeProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const schedulingRef = useRef(false)
  const [progress, setProgress] = useState(0)

  const flush = useCallback(() => {
    schedulingRef.current = false
    rafRef.current = null
    setProgress(readingProgressFraction(measureRef.current))
  }, [])

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

  return (
    <>
      <ArticleReadingProgressBar progress={progress} />
      <div ref={measureRef}>{children}</div>
      <FloatingLeefstijlcheckCta revealOnTimer={false} showOnAllScreens />
    </>
  )
}

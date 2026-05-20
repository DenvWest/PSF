/**
 * Leesaan-lijn onder sticky header: vergelijkbaar met `scroll-margin-top` op koppen (rem/px uit CSS‑custom property).
 */
export function readingProgressFraction(el: HTMLElement | null): number {
  if (!el || typeof window === 'undefined') return 0
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

export function parseReadingAnchorLinePx(variableName = '--reading-scroll-margin'): number {
  if (typeof document === 'undefined') return 108
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    const remMatch = raw.match(/^([\d.]+)rem$/i)
    if (remMatch?.[1]) return Number(remMatch[1]) * 16
    const pxMatch = raw.match(/^([\d.]+)px$/i)
    if (pxMatch?.[1]) return Number(pxMatch[1])
    return 108
  } catch {
    return 108
  }
}

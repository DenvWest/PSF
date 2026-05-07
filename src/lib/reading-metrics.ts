/**
 * Leesaan-lijn onder sticky header: vergelijkbaar met `scroll-margin-top` op koppen (rem/px uit CSS‑custom property).
 */
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

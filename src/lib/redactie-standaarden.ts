export const REDACTIE_VERANTWOORDELIJKE_STANDARD =
  'Redactie PerfectSupplement (inhoudelijke eindredactie; geen medische dienstverlening).'

/** Standaard reviewdatum inhoud voor artikelen zonder eigen `laatstBijgewerktOp`. */
export const STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM = '2026-05-07'

export function formatDatumNederlandsISO(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
}

import { DISCLAIMER_TEXTS } from '@/lib/disclaimer-text'

export const MEDISCHE_DISCLAIMER_LANG_NL = DISCLAIMER_TEXTS.article

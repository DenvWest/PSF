export const REDACTIE_VERANTWOORDELIJKE_STANDARD =
  'Redactie PerfectSupplement (inhoudelijke eindredactie; geen medische dienstverlening).'

/** Standaard reviewdatum inhoud voor artikelen zonder eigen `laatstBijgewerktOp`. */
export const STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM = '2026-05-07'

export function formatDatumNederlandsISO(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`
}

export const MEDISCHE_DISCLAIMER_LANG_NL =
  'Dit materiaal helpt bij geïnformeerde leefstijlkeuzes: het is géén medisch advies en vervangt geen onderzoek, diagnose of behandeling door een arts of andere zorgprofessional. Raadpleeg bij klachten altijd uw zorgprofessional. Bij communicatie over supplementen houden wij ons aan het EU-gezondheidsclaimregister en de Nederlandse regels: uitlatingen over product-effecten worden vermeden waar geen toegestane claim voor bestaat.'

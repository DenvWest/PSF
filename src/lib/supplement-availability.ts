export interface SupplementAvailability {
  enabled: boolean
  reason?: string
  disabledSince?: string
}

const supplementAvailability: Record<string, SupplementAvailability> = {
  ashwagandha: {
    enabled: true,
    // Als VWS verbod ingaat, verander naar:
    // enabled: false,
    // reason: 'Ashwagandha is per [datum] niet meer toegestaan als supplement in Nederland.',
    // disabledSince: '2026-XX-XX',
  },
}

export function isSupplementAvailable(slug: string): boolean {
  const config = supplementAvailability[slug]
  if (!config) return true
  return config.enabled
}

export function getSupplementDisabledReason(slug: string): string | undefined {
  const config = supplementAvailability[slug]
  if (!config || config.enabled) return undefined
  return config.reason
}

export function getAllAvailableSupplements(): string[] {
  return Object.entries(supplementAvailability)
    .filter(([, config]) => config.enabled)
    .map(([slug]) => slug)
}

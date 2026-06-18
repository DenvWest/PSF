export interface SupplementAvailability {
  enabled: boolean
  reason?: string
  disabledSince?: string
}

const supplementAvailability: Record<string, SupplementAvailability> = {
  ashwagandha: {
    enabled: true,
    // VWS-verbod verwacht per 1 jan 2027 (nog niet ingegaan, jun 2026).
    // Bij ingang verbod: enabled: false zetten + reason/disabledSince invullen.
    // reason: 'Ashwagandha is per 1 januari 2027 niet meer toegestaan als supplement in Nederland.',
    // disabledSince: '2027-01-01',
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

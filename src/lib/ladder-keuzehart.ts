import type { PillarId } from "@/types/dashboard";

/**
 * Waar de contextkolom het keuzehart draagt: aanbevolen laag mét reden,
 * laag-navigator, en de actie met zijn save-knop.
 *
 * Beweging is het pilot-domein (roadmap §7, plak 1). De andere React-domeinen
 * — slaap, stress, voeding — volgen in plak 3, en dat is één regel hier plus
 * de eerlijke lege staat die `resolveLadderLayerReason` al aflevert: geen
 * reden, dus geen redenblok. Verbinding komt pas in beeld na zijn
 * React-migratie; vandaag is dat scherm een prebuild-iframe en zet het nooit
 * een `DomainLadderFocus`.
 *
 * De domeinen die hier níét in staan houden hun bestaande contextkaarten
 * (`laag` + `keuze`) — er verdwijnt niets, er komt alleen nog niets bij.
 */
export const LADDER_KEUZEHART_DOMAINS: readonly PillarId[] = ["beweging"];

export function hasLadderKeuzehart(domain: PillarId): boolean {
  return LADDER_KEUZEHART_DOMAINS.includes(domain);
}

/** Meet-surface van de contextkolom; nooit gelijk aan die van het midden. */
export function ladderKeuzehartSurface(domain: PillarId): string {
  return `zijbalk_${domain}`;
}

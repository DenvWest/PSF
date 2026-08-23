import type { PillarId } from "@/types/dashboard";

/**
 * Meet-surface van de contextkolom; nooit gelijk aan die van het midden.
 *
 * Tot 23 augustus stond hier ook een domeinlijst (`LADDER_KEUZEHART_DOMAINS`):
 * de contextkolom droeg op beweging een vier-zone "keuzehart" en op de andere
 * domeinen een kaart-variant. Die splitsing verviel toen de kolom terugging
 * naar twee zones — waarom deze laag, en wat je erop koos — want die twee
 * dragen álle domeinen even goed. Eén kolom, één vorm, geen lijst om bij te
 * houden.
 */
export function ladderKeuzehartSurface(domain: PillarId): string {
  return `zijbalk_${domain}`;
}

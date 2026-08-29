import type { DeficiencySignals } from "@/lib/intake-engine";
import { getDisplayStatus } from "@/lib/score-display";
import { getSignalCopy } from "@/data/explanation-copy";
import type { PillarId } from "@/types/dashboard";

/**
 * Welk deficiency-signaal bij welk domein hoort. Dit zijn dezelfde signalen
 * die de supplementaanbeveling al triggeren (`getDeficiencySignals`) — de
 * roadmap citeert ze nu ook rechtstreeks als onderbouwing, in plaats van een
 * generieke pijler-tekst te tonen. Alleen signalen die een concreet antwoord
 * weerspiegelen (niet alleen "extra ondersteuning nodig") staan hier.
 */
const DOMAIN_SIGNALS: Partial<Record<PillarId, (keyof DeficiencySignals)[]>> = {
  slaap: ["melatonine_signal", "sleep_issue_no_stress"],
  stress: ["cortisol_risk"],
  voeding: ["omega3_deficiency", "protein_gap_signal"],
  beweging: ["low_recovery_no_load", "creatine_signal"],
};

const STATUS_LINE: Record<ReturnType<typeof getDisplayStatus>, (label: string) => string> = {
  Prioriteit: (label) => `${label} kwam in je antwoorden het laagst naar voren.`,
  Aandacht: (label) => `${label} vraagt volgens je antwoorden nu aandacht.`,
  Voldoende: (label) => `${label} staat er in je antwoorden voldoende voor.`,
  Sterk: (label) => `${label} is een van je sterkere domeinen.`,
};

export type RevealDomainBasis = {
  /** true = uit een concreet antwoord (signaal); false = uit de score alleen. */
  fromAnswer: boolean;
  lines: string[];
};

/**
 * De onderbouwing achter een domein: waaróm dit uit de check komt. Citeert
 * eerst een concreet signaal uit de antwoorden (max 2, zelfde bron als de
 * aanvulling-aanbeveling); zonder signaal valt hij terug op de gemeten status
 * van de score — nooit een lege regel.
 */
export function buildDomainBasis(
  pillar: PillarId,
  label: string,
  score: number,
  signals: DeficiencySignals,
): RevealDomainBasis {
  const keys = DOMAIN_SIGNALS[pillar] ?? [];
  const lines = keys
    .filter((key) => signals[key])
    .map((key) => getSignalCopy(key))
    .filter((text) => text.length > 0)
    .slice(0, 2);

  if (lines.length > 0) {
    return { fromAnswer: true, lines };
  }

  return { fromAnswer: false, lines: [STATUS_LINE[getDisplayStatus(score)](label)] };
}

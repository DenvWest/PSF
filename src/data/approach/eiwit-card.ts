/**
 * Server/build-time datafile voor de Eiwit-aanpakkaart (Q1, prioriteit × moeite).
 * NIET importeren in "use client"-componenten of publieke API-routes.
 */

/** NUT_PROT <= deze waarde => eiwit is een prioriteit (lage/onbewuste inname). */
export const EIWIT_PRIORITY_MAX_SCORE = 2;

export function isEiwitPriority(
  answers: Record<string, number> | null,
): boolean {
  if (!answers) return false;
  const score = answers.NUT_PROT;
  return typeof score === "number" && score <= EIWIT_PRIORITY_MAX_SCORE;
}

export const EIWIT_CARD_COPY = {
  prioriteitLabel: "Prioriteit · hoog",
  moeiteLabel: "Moeite · laag",
  title: "Eiwit bij elke maaltijd",
  why:
    "Uit je check: je eiwitinname kan omhoog — een van de stappen met veel effect en een lage drempel na je 40e.",
  evidenceLabel: "Sterk onderbouwd",
  ctaLabel: "Zo pak je het aan →",
  affiliateLead: "Haal je je dagdoel niet uit voeding?",
  affiliateLink: "Vergelijk eiwitpoeders →",
} as const;

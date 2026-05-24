// DISPLAY-ONLY — voor routing/SupplementRoute zie src/lib/score-bands.ts.
// Mapt domain-scores (0-100) naar 4-staps presentatie-labels die de gebruiker
// in de UI ziet. Drempels en labels zijn een bewuste compliance-keuze (KOAG):
// geen numerieke totaalscore, geen leeftijds-percentielen.

export type DisplayStatus = "Sterk" | "Voldoende" | "Aandacht" | "Prioriteit";

export type DisplayStatusTone = "sage" | "neutral" | "terra" | "terra-deep";

export function getDisplayStatus(score: number): DisplayStatus {
  if (!Number.isFinite(score)) {
    return "Voldoende";
  }
  if (score >= 80) {
    return "Sterk";
  }
  if (score >= 60) {
    return "Voldoende";
  }
  if (score >= 40) {
    return "Aandacht";
  }
  return "Prioriteit";
}

export function getDisplayStatusTone(status: DisplayStatus): DisplayStatusTone {
  switch (status) {
    case "Sterk":
      return "sage";
    case "Voldoende":
      return "neutral";
    case "Aandacht":
      return "terra";
    case "Prioriteit":
      return "terra-deep";
  }
}

const STATUS_FRAMING: Record<DisplayStatus, (domain: string) => string> = {
  Sterk: (domain) =>
    `Op basis van je antwoorden lijkt ${domain.toLowerCase()} op orde.`,
  Voldoende: (domain) =>
    `${domain} lijkt voldoende — kleine verbeteringen zijn mogelijk op basis van je antwoorden.`,
  Aandacht: (domain) =>
    `${domain} is een aandachtspunt in je antwoorden.`,
  Prioriteit: (domain) =>
    `${domain} vraagt prioriteit — dit zien we vaker bij mannen 40+ met drukke werkweken.`,
};

export function getDisplayStatusFraming(
  domainLabel: string,
  status: DisplayStatus,
): string {
  return STATUS_FRAMING[status](domainLabel);
}

export function getConnectionFraming(): string {
  return "Verbinding meten we niet in deze intake — wel relevant voor veerkracht op lange termijn.";
}

export const STATUS_TONE_CLASS: Record<DisplayStatusTone, string> = {
  sage: "border-intake-sage/40 bg-intake-sage/15 text-intake-sage",
  neutral: "border-intake-card-border bg-intake-bg text-intake-ink-muted",
  terra: "border-intake-terra/40 bg-intake-terra/15 text-intake-terra",
  "terra-deep": "border-intake-terra-deep/40 bg-intake-terra-deep/15 text-intake-terra-deep",
};

export type PillarDisplayStatus = DisplayStatus | "Niet gemeten";

export function getDisplayStatusShort(status: PillarDisplayStatus): string {
  switch (status) {
    case "Sterk":
      return "Sterk";
    case "Voldoende":
      return "Vold.";
    case "Aandacht":
      return "Aand.";
    case "Prioriteit":
      return "Prio";
    case "Niet gemeten":
      return "—";
  }
}

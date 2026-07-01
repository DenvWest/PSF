import type { DomainScores } from "@/lib/intake-engine";
import { getScoreBand } from "@/lib/score-bands";

export type IntakeKennisbankLink = {
  domainLabel: string;
  label: string;
  href: string;
};

const DOMAIN_KENNISBANK: Record<
  keyof DomainScores,
  { domainLabel: string; label: string; href: string }
> = {
  sleep_score: {
    domainLabel: "Slaap",
    label: "Wat is melatonine?",
    href: "/kennisbank/melatonine",
  },
  energy_score: {
    domainLabel: "Energie",
    label: "Mitochondriën uitgelegd",
    href: "/kennisbank/mitochondrien",
  },
  stress_score: {
    domainLabel: "Stress",
    label: "Wat is cortisol?",
    href: "/kennisbank/cortisol",
  },
  nutrition_score: {
    domainLabel: "Voeding",
    label: "Eiwitbehoefte na 40",
    href: "/kennisbank/eiwitbehoefte-na-40",
  },
  movement_score: {
    domainLabel: "Beweging",
    label: "Eiwit en spierbehoud",
    href: "/kennisbank/eiwitbehoefte-na-40",
  },
  recovery_score: {
    domainLabel: "Herstel",
    label: "Overtraining uitgelegd",
    href: "/kennisbank/overtrainingssyndroom",
  },
  connection_score: {
    domainLabel: "Verbinding",
    label: "Sociale steun en veerkracht",
    href: "/inzichten",
  },
};

export function getLowDomainKennisbankLinks(
  scores: DomainScores,
): IntakeKennisbankLink[] {
  const links: IntakeKennisbankLink[] = [];
  const seen = new Set<string>();

  for (const key of Object.keys(DOMAIN_KENNISBANK) as (keyof DomainScores)[]) {
    if (getScoreBand(scores[key]) !== "low") {
      continue;
    }
    const entry = DOMAIN_KENNISBANK[key];
    if (seen.has(entry.href)) {
      continue;
    }
    seen.add(entry.href);
    links.push(entry);
  }

  return links.slice(0, 3);
}

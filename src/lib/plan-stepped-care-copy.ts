/** Stepped-care trede-copy — placeholders tot eigenaar definitieve teksten levert.
 *  Zie docs/copy/plan-stepped-care.md. Werkwoord-vorm, B1, beschrijft het gevolg. */
const TIER_BADGE_LABELS: Record<number, string> = {
  1: "Doe dit deze week",
  2: "Houd dit bij",
  3: "Vul aan waar nodig",
  4: "Betaalde optie",
  5: "Betaalde optie",
};

export function getTierBadgeLabel(tier: number): string {
  return TIER_BADGE_LABELS[tier] ?? "Volgende stap";
}

export const PLAN_STEPPED_CARE_COPY = {
  heroTitle: "Jouw stappen, in volgorde",
  heroSubtitle: "Begin bij stap 1 — gratis en vandaag te doen.",
  topDisclaimer: "Geen medisch advies. Bij aanhoudende klachten: huisarts.",
  bottomDisclaimer:
    "Dit is leefstijl-inzicht, geen diagnose of behandeling. Bij aanhoudende klachten: huisarts.",
  commitmentCta: "Krijg je 14-dagen startplan + check-in over 30 dagen →",
} as const;

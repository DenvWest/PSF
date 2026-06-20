export const INTAKE_DELIVERABLE = {
  label: "leefstijloverzicht",
  labelCapitalized: "Leefstijloverzicht",
  withBeginStep: "leefstijloverzicht met beginstap",
  subline: "15 vragen, 3 minuten — direct een persoonlijk leefstijloverzicht.",
  sublineShort: "15 vragen, 3 minuten — persoonlijk leefstijloverzicht.",
  featureBullet: "Leefstijloverzicht met beginstap",
  premiumSubtitleSuffix:
    "Je krijgt een persoonlijk leefstijloverzicht met concrete stappen.",
  premiumFeatureBullet: "Leefstijloverzicht met beginstap",
  consentLabel: "Ik wil e-mailupdates ontvangen over mijn leefstijloverzicht",
  unsubscribeMessage:
    "Je ontvangt geen verdere Leefstijlcheck-updates op dit adres. Geplande berichten in deze reeks zijn geannuleerd.",
  intakeCtaSuffix: "direct een persoonlijk leefstijloverzicht",
  intakeMetadataSuffix: "concreet leefstijloverzicht",
} as const;

export const INTAKE_CTA = {
  primaryButton: "Doe de Leefstijlcheck — gratis →",
  startCheck: "Start de Leefstijlcheck →",
  discoverOverview: "Ontdek jouw leefstijloverzicht — gratis →",
  discoverOverviewShort: "Ontdek jouw leefstijloverzicht — gratis",
  blogHeadline: "Zie waar jij de meeste winst pakt",
  blogSubline:
    "15 vragen · 3 min · gratis en anoniem — inzicht op 6 leefstijl-domeinen. Geen medische test.",
  kennisbankHeadline: "Wil je weten waar jij staat?",
  calculating: "We stellen je leefstijloverzicht samen...",
  supplementFeature:
    "Onafhankelijke supplementvergelijking — alleen als het past",
  nurtureOverview: "Bekijk je leefstijloverzicht",
  planStepsAriaLabel: "Jouw leefstijlstappen",
  chatPatternPrefix: "Je leefstijlpatroon:",
  chatBeginStepsHeading: "Beginstappen:",
  nurtureProfileFallback: "jouw leefstijloverzicht",
  blogTurboProfile: "Turbo: ontdek jouw leefstijloverzicht",
  blogSectionProfile: "Past dit bij jouw leefstijlpatroon?",
  testosteronTeaser: "Benieuwd waar jij staat? Scroll naar beneden voor de gratis Leefstijlcheck.",
} as const;

export function intakeCtaMatchProfile(profileLabel: string): string {
  return `Ontdek jouw leefstijloverzicht — match met ${profileLabel}`;
}

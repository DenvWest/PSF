export const INTAKE_DELIVERABLE = {
  label: "leefstijloverzicht",
  labelCapitalized: "Leefstijloverzicht",
  withBeginStep: "leefstijloverzicht met beginstap",
  subline: "18 vragen, 3 minuten — direct een persoonlijk leefstijloverzicht.",
  sublineShort: "18 vragen, 3 minuten — persoonlijk leefstijloverzicht.",
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
  gratisButton: "Doe de Leefstijlcheck — gratis",
  startCheck: "Start de Leefstijlcheck →",
  discoverOverview: "Ontdek jouw leefstijloverzicht — gratis →",
  discoverOverviewShort: "Ontdek jouw leefstijloverzicht — gratis",
  blogHeadline: "Wil jij zien waar jij de meeste winst pakt?",
  blogSubline: "18 vragen · 3 min · gratis en anoniem",
  blogClosingHeadline: "Wil jij weten wat jij nodig hebt?",
  blogClosingSubline:
    "De check laat zien of leefstijl eerst komt — of dat een supplement daarbij past.",
  guideClosingSubline:
    "De meeste klachten beginnen niet bij een tekort, maar bij leefstijl. De check laat zien of leefstijl eerst komt — of dat een supplement zinvol is.",
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

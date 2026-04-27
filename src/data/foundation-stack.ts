export interface FoundationSupplement {
  id: string;
  name: string;
  claim: string;
  claimCondition: string;
  reason: string;
  href: string;
  hasComparison: boolean;
}

export const FOUNDATION_STACK: FoundationSupplement[] = [
  {
    id: "omega-3",
    name: "Omega-3 (EPA/DHA)",
    claim: "EPA en DHA dragen bij tot de normale werking van het hart.",
    claimCondition: "Bij een dagelijkse inname van minimaal 250 mg EPA en DHA.",
    reason:
      "De meeste Nederlanders krijgen te weinig omega-3 via voeding. Een brede basis voor hart en hersenen.",
    href: "/beste-omega-3-supplement",
    hasComparison: true,
  },
  {
    id: "magnesium-glycinaat",
    name: "Magnesium",
    claim:
      "Magnesium draagt bij tot de vermindering van vermoeidheid en tot een normale werking van het zenuwstelsel.",
    claimCondition:
      "Bij een dagelijkse inname van minimaal 56,25 mg magnesium (15% RI).",
    reason:
      "Veel mannen 40+ krijgen onvoldoende magnesium. Relevant voor slaap, spieren en zenuwstelsel.",
    href: "/beste-magnesium",
    hasComparison: true,
  },
  {
    id: "vitamine-d3",
    name: "Vitamine D3",
    claim:
      "Vitamine D draagt bij tot de normale werking van het immuunsysteem en de instandhouding van normale botten en spierfunctie.",
    claimCondition: "Bij een dagelijkse inname van minimaal 5 µg vitamine D (100% RI).",
    reason:
      "In Nederland is vitamine D-tekort veelvoorkomend, vooral in de wintermaanden.",
    href: "/supplementen/vitamine-d",
    hasComparison: false,
  },
];

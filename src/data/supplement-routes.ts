import type { DomainScores, ProfileLabel } from "@/lib/intake-engine";

export type DeficiencySignalKey =
  | "omega3_deficiency"
  | "magnesium_signal"
  | "cortisol_risk"
  | "ashwagandha_signal";

export type SupplementTriggerClause = {
  deficiencySignal?: DeficiencySignalKey;
  domainBelow?: { domain: keyof DomainScores; threshold: number };
  domainAbove?: { domain: keyof DomainScores; threshold: number };
  profileLabel?: ProfileLabel["name"];
};

export type SupplementRecommendation = {
  id: string;
  name: string;
  reason: string;
  priority: number;
  domains: string[];
  /** True wanneer de doel-URL een productvergelijking met affiliate-kaarten is. */
  hasComparison: boolean;
  affiliateUrl: string;
  triggers: {
    /** Minimaal één clause is voldoende (OR). */
    anyOf: SupplementTriggerClause[];
  };
  /** Alleen gebruiken wanneer geen enkele andere route matcht. */
  fallbackOnly?: boolean;
};

export const SUPPLEMENT_ROUTE_DEFINITIONS: SupplementRecommendation[] = [
  {
    id: "omega-3",
    name: "Omega-3 (EPA/DHA)",
    reason:
      "Je visinname is laag of je voedingsscore vraagt om een brede basis. Omega-3 ondersteunt hart, hersenen en ontstekingsbalans.",
    priority: 1,
    domains: ["Voeding", "Energie", "Herstel"],
    hasComparison: true,
    affiliateUrl: "/beste-omega-3-supplement",
    triggers: {
      anyOf: [
        { deficiencySignal: "omega3_deficiency" },
        { domainBelow: { domain: "nutrition_score", threshold: 50 } },
      ],
    },
  },
  {
    id: "magnesium-glycinaat",
    name: "Magnesium glycinaat",
    reason:
      "Je slaap, stress of herstel vraagt om meer ontspanning. Magnesium glycinaat is een veelgekozen vorm voor avond en rust.",
    priority: 2,
    domains: ["Slaap", "Stress", "Herstel"],
    hasComparison: true,
    affiliateUrl: "/beste-magnesium",
    triggers: {
      anyOf: [
        { deficiencySignal: "magnesium_signal" },
        { domainBelow: { domain: "sleep_score", threshold: 50 } },
        { domainBelow: { domain: "stress_score", threshold: 50 } },
      ],
    },
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    reason:
      "Je stressscore is laag of er is een duidelijk cortisolpatroon. Ashwagandha wordt vaak ingezet voor stressbelasting en ritme.",
    priority: 3,
    domains: ["Stress", "Slaap"],
    hasComparison: true,
    affiliateUrl: "/beste-ashwagandha",
    triggers: {
      anyOf: [
        { domainBelow: { domain: "stress_score", threshold: 40 } },
        { deficiencySignal: "cortisol_risk" },
        { deficiencySignal: "ashwagandha_signal" },
      ],
    },
  },
  {
    id: "creatine",
    name: "Creatine",
    reason:
      "Je beweegt veel terwijl je herstel achterblijft. Creatine kan kracht en herstel bij training ondersteunen.",
    priority: 4,
    domains: ["Beweging", "Herstel"],
    hasComparison: false,
    affiliateUrl: "/supplementen",
    triggers: { anyOf: [] },
  },
  {
    id: "vitamine-d3",
    name: "Vitamine D3",
    reason:
      "Een praktische basis voor bijna elk profiel: vitamine D speelt mee bij botten, spieren en immuunfunctie — zeker als er weinig zon is.",
    priority: 50,
    domains: ["Energie", "Immuun", "Beweging"],
    hasComparison: false,
    affiliateUrl: "/supplementen/vitamine-d",
    triggers: { anyOf: [] },
    fallbackOnly: true,
  },
];

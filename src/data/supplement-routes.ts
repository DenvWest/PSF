import type { DomainScores, ProfileLabel } from "@/lib/intake-engine";
import { COMPARISON_PATHS } from "@/lib/comparison-paths";

export type DeficiencySignalKey =
  | "omega3_deficiency"
  | "magnesium_signal"
  | "melatonine_signal";

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
      "Je visinname is laag of je voedingsscore vraagt om een brede basis. EPA en DHA dragen bij tot de normale werking van het hart; DHA bovendien tot instandhouding van hersenfunctie en gezichtsvermogen (bij voldoende dagdosis volgens claimvoorwaarden).",
    priority: 1,
    domains: ["Voeding", "Energie", "Herstel"],
    hasComparison: true,
    affiliateUrl: COMPARISON_PATHS["omega-3-supplement"],
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
      "Je routine of energie-indicator vraagt om ondersteuning via mineralen. Magnesium draagt o.a. bij tot vermindering van vermoeidheid en tot normale psychologische functie; bisglycinaat is een veelgekozen vorm.",
    priority: 2,
    domains: ["Slaap", "Stress", "Herstel"],
    hasComparison: true,
    affiliateUrl: COMPARISON_PATHS.magnesium,
    triggers: {
      anyOf: [
        { deficiencySignal: "magnesium_signal" },
        { domainBelow: { domain: "sleep_score", threshold: 50 } },
        { domainBelow: { domain: "stress_score", threshold: 50 } },
      ],
    },
  },
  {
    id: "zink",
    name: "Zink",
    reason:
      "Zink draagt onder meer bij tot normale eiwitsynthese en een normaal functionerend immuunsysteem — een logische optie als je profiel hierop stuurt.",
    priority: 4,
    domains: ["Voeding", "Herstel", "Stress"],
    hasComparison: true,
    affiliateUrl: "/beste/zink",
    triggers: { anyOf: [] },
  },
  {
    id: "melatonine",
    name: "Melatonine",
    reason:
      "Melatonine draagt bij aan het verkorten van de tijd nodig om in slaap te vallen volgens officiële claimvoorwaarden — geen garantie tegen doorstress of slechte slapen‑gewoonte.",
    priority: 5,
    domains: ["Slaap"],
    hasComparison: true,
    affiliateUrl: COMPARISON_PATHS.melatonine,
    triggers: {
      anyOf: [{ deficiencySignal: "melatonine_signal" }],
    },
  },
  {
    id: "creatine",
    name: "Creatine",
    reason:
      "Creatine ondersteunt fosfaat‑buffering voor korte bursts; onder EU‑claims kan het bij langdurige adequate inname (minimaal 3 g/dag) onder voorwaarden iets bijdragen aan ultrakorte spiertaken — geen belofte op algemene energie.",
    priority: 20,
    domains: ["Beweging", "Herstel"],
    hasComparison: true,
    affiliateUrl: COMPARISON_PATHS.creatine,
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

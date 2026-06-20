import type { DomainScores, ProfileLabel } from "@/lib/intake-engine";
import type { IngredientClaimKey } from "@/data/approved-claims";
import type { DeficiencySignalKey } from "@/data/supplement-routes";
import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { PillarId } from "@/types/dashboard";

export type CatalogTriggerClause = {
  deficiencySignal?: DeficiencySignalKey;
  domainBelow?: { domain: keyof DomainScores; threshold: number };
  domainAbove?: { domain: keyof DomainScores; threshold: number };
  profileLabel?: ProfileLabel["name"];
};

export type HubLegacyRule =
  | "sleep_or_stress_below_50"
  | "recovery_below_40_no_magnesium"
  | "omega3_answer_low_or_nutrition_below_40"
  | "protein_gap_signal"
  | "energy_below_40"
  | "vitamin_d_fallback";

export interface SupplementCatalogEntry {
  id: string;
  claimKey: IngredientClaimKey;
  availabilitySlug: string;
  comparisonPath: string | null;
  hasComparison: boolean;
  domains: string[];
  priority: number;
  fallbackOnly?: boolean;
  pillarIds?: PillarId[];
  hubSlug?: string;
  routeTriggers?: { anyOf: CatalogTriggerClause[] };
  hubRules?: HubLegacyRule[];
  customMatcher?: "zink" | "creatine";
}

export const SUPPLEMENT_CATALOG: SupplementCatalogEntry[] = [
  {
    id: "omega-3",
    claimKey: "omega3",
    availabilitySlug: "omega-3",
    comparisonPath: COMPARISON_PATHS["omega-3-supplement"],
    hasComparison: true,
    domains: ["Voeding", "Energie", "Herstel"],
    priority: 1,
    pillarIds: ["voeding"],
    hubSlug: "omega-3",
    routeTriggers: {
      anyOf: [
        { deficiencySignal: "omega3_deficiency" },
        { domainBelow: { domain: "nutrition_score", threshold: 50 } },
      ],
    },
    hubRules: ["omega3_answer_low_or_nutrition_below_40"],
  },
  {
    id: "magnesium-glycinaat",
    claimKey: "magnesium",
    availabilitySlug: "magnesium-glycinaat",
    comparisonPath: COMPARISON_PATHS.magnesium,
    hasComparison: true,
    domains: ["Slaap", "Stress", "Herstel"],
    priority: 2,
    pillarIds: ["slaap"],
    hubSlug: "magnesium",
    routeTriggers: {
      anyOf: [
        { deficiencySignal: "magnesium_signal" },
        { domainBelow: { domain: "sleep_score", threshold: 50 } },
        { domainBelow: { domain: "stress_score", threshold: 50 } },
      ],
    },
    hubRules: ["sleep_or_stress_below_50", "recovery_below_40_no_magnesium"],
  },
  {
    id: "zink",
    claimKey: "zink",
    availabilitySlug: "zink",
    comparisonPath: COMPARISON_PATHS.zink,
    hasComparison: true,
    domains: ["Voeding", "Herstel", "Stress"],
    priority: 4,
    hubSlug: "zink",
    routeTriggers: { anyOf: [] },
    customMatcher: "zink",
  },
  {
    id: "creatine",
    claimKey: "creatine",
    availabilitySlug: "creatine",
    comparisonPath: COMPARISON_PATHS.creatine,
    hasComparison: true,
    domains: ["Beweging", "Herstel"],
    priority: 20,
    hubSlug: "creatine",
    routeTriggers: { anyOf: [] },
    hubRules: ["energy_below_40"],
    customMatcher: "creatine",
  },
  {
    id: "eiwitpoeder",
    claimKey: "eiwitpoeder",
    availabilitySlug: "eiwitpoeder",
    comparisonPath: "/beste/eiwitpoeder",
    hasComparison: true,
    domains: ["Voeding", "Herstel"],
    priority: 15,
    hubSlug: "eiwitpoeder",
    hubRules: ["protein_gap_signal"],
  },
  {
    id: "vitamine-d3",
    claimKey: "vitamineD",
    availabilitySlug: "vitamine-d3",
    comparisonPath: "/supplementen/vitamine-d",
    hasComparison: false,
    domains: ["Energie", "Immuun", "Beweging"],
    priority: 50,
    hubSlug: "vitamine-d",
    fallbackOnly: true,
    hubRules: ["vitamin_d_fallback"],
  },
];

export const PILLAR_SUPPLEMENT_IDS: Partial<Record<PillarId, string>> = {
  slaap: "magnesium-glycinaat",
  voeding: "omega-3",
};

export function getCatalogEntryById(id: string): SupplementCatalogEntry | undefined {
  return SUPPLEMENT_CATALOG.find((entry) => entry.id === id);
}

export function getCatalogEntryByHubSlug(slug: string): SupplementCatalogEntry | undefined {
  return SUPPLEMENT_CATALOG.find((entry) => entry.hubSlug === slug);
}

export function getCatalogEntryForPillar(pillarId: PillarId): SupplementCatalogEntry | undefined {
  const supplementId = PILLAR_SUPPLEMENT_IDS[pillarId];
  if (!supplementId) {
    return undefined;
  }
  return getCatalogEntryById(supplementId);
}

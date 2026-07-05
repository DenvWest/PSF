/**
 * Server/build-time datafile voor de Aanpak-module.
 * NIET importeren in "use client"-componenten of publieke API-routes.
 *
 * Categorie-indeling en evidence-niveaus zijn BACKSTAGE: sturen sortering/gate,
 * nooit zichtbaar als label in de UI.
 */

import { PILLAR, SIGNALS } from "@/data/dashboard";
import type { QuestionId } from "@/data/intake-questions";
import {
  isReadoutDomain,
  READOUT_DRIVERS,
  type InterventionPillarId,
} from "@/lib/domain-role";
import type { BlogEvidenceNiveau } from "@/types/blog";
import type { PillarId } from "@/types/dashboard";

export type EvidenceNiveau = BlogEvidenceNiveau;

export type CategorySource = "self_report" | "wearable" | "none";

export type WearableSignalId = (typeof SIGNALS)[number]["id"];

export interface CategoryDefinition {
  id: string;
  domain: PillarId;
  label: string;
  description: string;
  source: CategorySource;
  questionId?: QuestionId;
  wearableSignalId?: WearableSignalId;
  evidenceNiveau: EvidenceNiveau;
  insightSlugs: readonly string[];
}

export type DomainTaxonomy =
  | { role: "readout"; drivers: InterventionPillarId[] }
  | { role: "intervention"; categories: CategoryDefinition[] };

export const CATEGORY_TAXONOMY = [
  {
    id: "slaap-inslapen",
    domain: "slaap",
    label: "Inslapen",
    description: "Hoe snel je in slaap valt.",
    source: "self_report",
    questionId: "SLP_ONSET",
    evidenceNiveau: "sterk",
    insightSlugs: ["melatonine-na-40", "circadiaan-ritme"],
  },
  {
    id: "slaap-doorslapen",
    domain: "slaap",
    label: "Doorslapen",
    description: "Of je 's nachts wakker wordt en weer wegzakt.",
    source: "self_report",
    questionId: "SLP_WAKE",
    evidenceNiveau: "sterk",
    insightSlugs: ["magnesium-en-slaap", "cortisol-en-slaap"],
  },
  {
    id: "slaap-ritme",
    domain: "slaap",
    label: "Slaapritme",
    description: "Een vast slaap- en waakritme aanhouden.",
    source: "self_report",
    questionId: "SLP_CONS",
    evidenceNiveau: "sterk",
    insightSlugs: ["slaapritme-herstellen", "circadiaan-ritme", "melatonine"],
  },
  {
    id: "slaap-kwaliteit",
    domain: "slaap",
    label: "Uitgerust wakker worden",
    description: "Hoe uitgerust je je 's ochtends voelt.",
    source: "self_report",
    questionId: "SLP_QUAL",
    evidenceNiveau: "redelijk",
    insightSlugs: ["magnesium-en-slaapkwaliteit", "slaapschuld"],
  },
  {
    id: "slaap-hrv",
    domain: "slaap",
    label: "HRV",
    description: "HRV als herstelindicator — een signaal, geen doel.",
    source: "wearable",
    wearableSignalId: "hrv",
    evidenceNiveau: "redelijk",
    insightSlugs: [],
  },
  {
    id: "slaap-rusthartslag",
    domain: "slaap",
    label: "Rusthartslag",
    description: "Je rusthartslag-trend over de tijd.",
    source: "wearable",
    wearableSignalId: "rustpols",
    evidenceNiveau: "redelijk",
    insightSlugs: [],
  },
  {
    id: "slaap-slaapduur",
    domain: "slaap",
    label: "Slaapduur",
    description: "Je totale slaapduur per nacht.",
    source: "wearable",
    wearableSignalId: "slaapduur",
    evidenceNiveau: "sterk",
    insightSlugs: [],
  },
  {
    id: "stress-belasting",
    domain: "stress",
    label: "Mentale belasting",
    description: "Hoe vaak je je gespannen of overprikkeld voelt.",
    source: "self_report",
    questionId: "STR_FREQ",
    evidenceNiveau: "redelijk",
    insightSlugs: ["cortisol-verlagen-natuurlijk", "hpa-as"],
  },
  {
    id: "stress-herstelmomenten",
    domain: "stress",
    label: "Herstelmomenten",
    description: "Bewuste rust pakken op drukke dagen.",
    source: "self_report",
    questionId: "STR_RCV",
    evidenceNiveau: "sterk",
    insightSlugs: ["ademhaling-tegen-stress", "nervus-vagus"],
  },
  {
    id: "stress-ademhaling",
    domain: "stress",
    label: "Ademhaling",
    description: "Ademhaling en ontspanning als dagelijkse gewoonte.",
    source: "none",
    evidenceNiveau: "redelijk",
    insightSlugs: ["ademhaling-tegen-stress"],
  },
  {
    id: "verbinding-steun",
    domain: "verbinding",
    label: "Sociale steun",
    description: "Mensen om op terug te vallen.",
    source: "self_report",
    questionId: "CON_SOC",
    evidenceNiveau: "sterk",
    insightSlugs: ["sociale-verbinding", "stress-werk-grenzen-stellen"],
  },
  {
    id: "voeding-eiwit",
    domain: "voeding",
    label: "Eiwit",
    description: "Een eiwitbron bij elke maaltijd.",
    source: "self_report",
    questionId: "NUT_PROT",
    evidenceNiveau: "sterk",
    insightSlugs: ["eiwitbehoefte-na-40", "eiwit-na-40"],
  },
  {
    id: "voeding-vetzuren",
    domain: "voeding",
    label: "Vetzuren",
    description: "Vette vis of een andere omega-3-bron.",
    source: "self_report",
    questionId: "NUT_O3",
    evidenceNiveau: "sterk",
    insightSlugs: ["wat-is-omega-3", "epa-dha"],
  },
  {
    id: "voeding-vezels",
    domain: "voeding",
    label: "Vezels",
    description: "Vezelrijk eten als onderdeel van je voedingspatroon.",
    source: "none",
    evidenceNiveau: "sterk",
    insightSlugs: ["middagdip-bloedsuiker-na-40"],
  },
  {
    id: "voeding-ritme",
    domain: "voeding",
    label: "Eetritme",
    description: "Regelmaat in je eetmomenten.",
    source: "none",
    evidenceNiveau: "redelijk",
    insightSlugs: ["middagdip-bloedsuiker-na-40"],
  },
  {
    id: "beweging-kracht",
    domain: "beweging",
    label: "Krachttraining",
    description: "Kracht- of weerstandstraining in je week.",
    source: "self_report",
    questionId: "MOV_STR",
    evidenceNiveau: "sterk",
    insightSlugs: ["krachttraining-na-40", "creatine-en-herstel"],
  },
  {
    id: "beweging-cardio",
    domain: "beweging",
    label: "Cardio & conditie",
    description: "Cardio of intensievere beweging.",
    source: "self_report",
    questionId: "MOV_CARD",
    evidenceNiveau: "sterk",
    insightSlugs: ["energie-verhogen-natuurlijk"],
  },
  {
    id: "beweging-dagelijkse-activiteit",
    domain: "beweging",
    label: "Dagelijkse activiteit",
    description: "Stappen en beweegmomenten door de dag.",
    source: "none",
    evidenceNiveau: "sterk",
    insightSlugs: [],
  },
] as const satisfies readonly CategoryDefinition[];

export function getCategoriesForDomain(pillar: PillarId): CategoryDefinition[] {
  return CATEGORY_TAXONOMY.filter((category) => category.domain === pillar);
}

export function getSelfReportCategories(): CategoryDefinition[] {
  return CATEGORY_TAXONOMY.filter((category) => category.source === "self_report");
}

export function getWearableCategories(): CategoryDefinition[] {
  return CATEGORY_TAXONOMY.filter((category) => category.source === "wearable");
}

export function getCategoryHubRoute(category: CategoryDefinition): string {
  return PILLAR[category.domain].hubRoute;
}

export function getDomainTaxonomy(pillar: PillarId): DomainTaxonomy {
  if (isReadoutDomain(pillar)) {
    return { role: "readout", drivers: READOUT_DRIVERS[pillar] };
  }
  return {
    role: "intervention",
    categories: getCategoriesForDomain(pillar),
  };
}

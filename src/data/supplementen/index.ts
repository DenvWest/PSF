import { magnesiumData } from "./magnesium";
import { ashwagandhaData } from "./ashwagandha";
import { omega3Data } from "./omega-3";
import { vitamineDData } from "./vitamine-d";
import { melatonineData } from "./melatonine";
import type { SupplementSlug, SupplementData } from "@/types/supplementen";

const alleSupplementen: Record<SupplementSlug, SupplementData> = {
  magnesium: magnesiumData,
  ashwagandha: ashwagandhaData,
  "omega-3": omega3Data,
  "vitamine-d": vitamineDData,
  melatonine: melatonineData,
};

export function getSupplementData(slug: SupplementSlug): SupplementData {
  return alleSupplementen[slug];
}

export const ALL_SUPPLEMENT_SLUGS: SupplementSlug[] = [
  "magnesium",
  "ashwagandha",
  "omega-3",
  "vitamine-d",
  "melatonine",
];

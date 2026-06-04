import type { ComparisonPageData } from "@/types/supplement";
import { magnesiumData } from "./magnesium";
import { omega3Data } from "./omega-3";
import { ashwagandhaData } from "./ashwagandha";
import { vitamineDData } from "./vitamine-d";
import { creatineData } from "./creatine";
import { zinkData } from "./zink";
import { eiwitpoederData } from "./eiwitpoeder";

const allSupplementData: Record<string, ComparisonPageData> = {
  magnesium: magnesiumData,
  "omega-3-supplement": omega3Data,
  ashwagandha: ashwagandhaData,
  "vitamine-d": vitamineDData,
  creatine: creatineData,
  zink: zinkData,
  eiwitpoeder: eiwitpoederData,
};

export const SUPPLEMENT_SLUGS = Object.keys(allSupplementData);

export function getSupplementComparisonData(
  slug: string,
): ComparisonPageData | undefined {
  return allSupplementData[slug];
}

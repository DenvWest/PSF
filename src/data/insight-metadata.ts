import type { InsightItem } from "@/types/insight";

export type ContentMetadata = Pick<
  InsightItem,
  "theme" | "planPhase" | "gapSignal" | "profile" | "relatedSupplementId"
>;

/** Overlay gekeyed op InsightItem.slug; ongetagde slugs blijven inert (undefined). */
export const CONTENT_METADATA: Record<string, ContentMetadata> = {
  "eiwitbehoefte-na-40": {
    theme: "nutrition",
    gapSignal: "protein_gap_signal",
    relatedSupplementId: "eiwitpoeder",
  },
  "creatine-en-herstel": {
    theme: "movement",
    relatedSupplementId: "creatine",
  },
  "magnesium-en-slaapkwaliteit": {
    theme: "sleep",
    planPhase: 2,
    relatedSupplementId: "magnesium-glycinaat",
  },
  cortisol: {
    theme: "stress",
    profile: "Stressdrager",
  },
};

export function getContentMetadata(slug: string): ContentMetadata {
  return CONTENT_METADATA[slug] ?? {};
}

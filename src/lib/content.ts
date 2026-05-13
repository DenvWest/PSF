import { DEFAULT_ORG_ID } from "@/config/org";
import type { ComparisonPageData } from "@/types/supplement";

/**
 * Content indirection layer.
 *
 * Currently returns static TS data files for the default org.
 * Future: lookup from CMS/database per organization.
 */

export async function getProfileCopy(
  slug: string,
  _orgId: string = DEFAULT_ORG_ID,
) {
  const profiles: Record<string, () => Promise<Record<string, unknown>>> = {
    stressdrager: () => import("@/data/profiles/stressdrager") as Promise<Record<string, unknown>>,
    "lage-batterij": () => import("@/data/profiles/lage-batterij") as Promise<Record<string, unknown>>,
    "onrustige-slaper": () => import("@/data/profiles/onrustige-slaper") as Promise<Record<string, unknown>>,
    overtrainer: () => import("@/data/profiles/overtrainer") as Promise<Record<string, unknown>>,
  };

  const loader = profiles[slug];
  if (!loader) return null;

  const mod = await loader();
  return mod;
}

export async function getSupplementData(
  slug: string,
  _orgId: string = DEFAULT_ORG_ID,
): Promise<ComparisonPageData | null> {
  const { getSupplementComparisonData } = await import("@/data/supplements");
  return getSupplementComparisonData(slug) ?? null;
}

export async function getNurtureContent(
  _orgId: string = DEFAULT_ORG_ID,
) {
  const mod = await import("@/data/nurture-content");
  return mod.nurtureContent;
}

export async function getIntakeQuestions(
  _orgId: string = DEFAULT_ORG_ID,
) {
  const { QUESTIONS } = await import("@/data/intake-questions");
  return QUESTIONS;
}

import { approvedClaims } from "@/data/approved-claims";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";

/**
 * De tellingen achter de bewijsband op de homepage.
 *
 * Alles wordt afgeleid uit de bron-data, nooit ingetypt: hardgecodeerde
 * aantallen op deze site zijn aantoonbaar weggelopen van de waarheid
 * ("6 domeinen" bij zeven, "+2 meer" bij drie). Een vergelijking erbij of een
 * claim eraf verandert de band vanzelf mee.
 */
export type HomepageProofCounts = {
  comparisons: number;
  products: number;
  approvedClaims: number;
  peerReviewedSources: number;
};

export function getHomepageProofCounts(): HomepageProofCounts {
  const comparisons = SUPPLEMENT_SLUGS.length;

  const products = SUPPLEMENT_SLUGS.reduce((total, slug) => {
    const data = getSupplementComparisonData(slug);
    return total + (data?.products.length ?? 0);
  }, 0);

  const entries = Object.values(approvedClaims);

  const approvedClaimCount = entries.reduce(
    (total, entry) =>
      total + entry.claims.filter((claim) => claim.status === "approved").length,
    0,
  );

  const peerReviewedSources = entries.reduce(
    (total, entry) => total + entry.supportingEvidence.length,
    0,
  );

  return {
    comparisons,
    products,
    approvedClaims: approvedClaimCount,
    peerReviewedSources,
  };
}

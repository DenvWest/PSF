import {
  getClaimById,
  type ClaimNutrient,
  type EfsaClaimId,
} from "@/data/approved-claims";
import type { DoseringPerDagdosis } from "@/types/supplement";

function nutrientAmount(
  dosering: DoseringPerDagdosis,
  nutrient: ClaimNutrient,
): number | null {
  switch (nutrient) {
    case "magnesium":
      return dosering.elementair && dosering.eenheid === "mg"
        ? dosering.hoeveelheid
        : null;
    case "epa_dha": {
      if (dosering.epaMg == null || dosering.dhaMg == null) {
        return null;
      }
      return dosering.epaMg + dosering.dhaMg;
    }
    case "dha":
      return dosering.dhaMg ?? null;
    case "vitamine_d":
      return dosering.eenheid === "ug" ? dosering.hoeveelheid : null;
    case "zink":
      return dosering.elementair && dosering.eenheid === "mg"
        ? dosering.hoeveelheid
        : null;
    case "creatine":
      return dosering.eenheid === "g" ? dosering.hoeveelheid : null;
    default:
      return null;
  }
}

export function productMeetsClaimThreshold(
  dosering: DoseringPerDagdosis,
  claimId: EfsaClaimId,
): boolean {
  const claim = getClaimById(claimId);
  if (!claim || claim.status !== "approved") {
    return false;
  }

  const amount = nutrientAmount(dosering, claim.threshold.nutrient);
  if (amount == null) {
    return false;
  }

  return amount >= claim.threshold.minAmount;
}

export function productMeetsAllLinkedClaims(input: {
  doseringPerDagdosis: DoseringPerDagdosis;
  efsaClaimIds: EfsaClaimId[];
}): boolean {
  if (input.efsaClaimIds.length === 0) {
    return false;
  }

  return input.efsaClaimIds.every((claimId) =>
    productMeetsClaimThreshold(input.doseringPerDagdosis, claimId),
  );
}

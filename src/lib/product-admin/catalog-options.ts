import { approvedClaims, getUsableClaims, type EfsaClaimId } from "@/data/approved-claims";

/** Sleutels waarop sup_product_actives.nutrient_key kan staan: de claim-ingrediënten plus EPA/DHA-rijen voor omega-3. */
export const NUTRIENT_KEYS: string[] = [...Object.keys(approvedClaims), "epa", "dha"];

export const CERTIFICATION_SUGGESTIONS = ["third_party_tested", "ifos", "creapure", "ksm66", "vegan", "gmp"];

export interface SelectableClaim {
  id: EfsaClaimId;
  text: string;
  ingredient: string;
}

export function listSelectableClaims(): SelectableClaim[] {
  return Object.keys(approvedClaims).flatMap((key) =>
    getUsableClaims(key).map((claim) => ({
      id: claim.id,
      text: claim.text,
      ingredient: approvedClaims[key as keyof typeof approvedClaims].ingredient,
    })),
  );
}

export function isSelectableClaim(claimId: string): claimId is EfsaClaimId {
  return listSelectableClaims().some((c) => c.id === claimId);
}

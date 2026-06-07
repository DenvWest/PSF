import { productMeetsAllLinkedClaims } from "@/lib/claim-condition";
import type {
  DoseringPerDagdosis,
  EfsaClaimId,
  IngredientClaimKey,
  SupplementProduct,
} from "@/types/supplement";

type ProductClaimInput = Omit<
  SupplementProduct,
  "voldoetAanClaimConditie"
> & {
  werkzameStof: IngredientClaimKey;
  vorm: string;
  doseringPerDagdosis: DoseringPerDagdosis;
  efsaClaimIds: EfsaClaimId[];
  thirdPartyTested: boolean;
};

export function withClaimFields(product: ProductClaimInput): SupplementProduct {
  return {
    ...product,
    voldoetAanClaimConditie: productMeetsAllLinkedClaims({
      doseringPerDagdosis: product.doseringPerDagdosis,
      efsaClaimIds: product.efsaClaimIds,
    }),
  };
}

import type { DomainKey } from "@/data/nurture-content";
import type { IngredientClaimKey } from "@/data/approved-claims";

export const DOMAIN_SUPPLEMENT_CANDIDATES: Record<
  DomainKey,
  IngredientClaimKey[]
> = {
  sleep_score: ["magnesium"],
  energy_score: [],
  stress_score: [],
  nutrition_score: ["omega3"],
  movement_score: ["magnesium"],
  recovery_score: ["magnesium"],
  connection_score: [],
};

export const DOMAIN_TO_INGREDIENT: Partial<Record<DomainKey, IngredientClaimKey>> =
  {
    sleep_score: "magnesium",
    nutrition_score: "omega3",
    movement_score: "magnesium",
    recovery_score: "magnesium",
  };

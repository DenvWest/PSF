import { describe, expect, it } from "vitest";
import type { FoodSource } from "@/data/nutrition/food-sources";
import { formatVerifiedFoodPortionNl } from "@/lib/nutrition-p4-food-display";

describe("formatVerifiedFoodPortionNl", () => {
  it("toont portie en eenheid alleen bij verified NEVO-bron", () => {
    const verified = {
      portionNl: "125 g",
      amount: 16,
      verified: true,
      nutrientValue: { value: 12.8, unit: "µg" as const, per: "100g" as const, source: { origin: "nevo" as const, ref: "123", edition: "2025/9.0" } },
    } satisfies Pick<FoodSource, "portionNl" | "amount" | "verified" | "nutrientValue">;

    expect(formatVerifiedFoodPortionNl(verified as FoodSource)).toBe("125 g: circa 16 µg");
    expect(
      formatVerifiedFoodPortionNl({
        ...verified,
        verified: false,
      } as FoodSource),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  getAllowedComparisonPath,
  isComparisonAllowed,
} from "@/lib/comparison-availability";

describe("comparison-availability", () => {
  it("allows magnesium comparison", () => {
    expect(isComparisonAllowed("magnesium")).toBe(true);
    expect(getAllowedComparisonPath("magnesium")).toBe("/beste/magnesium");
  });

  it("forbids melatonine comparison", () => {
    expect(isComparisonAllowed("melatonine")).toBe(false);
    expect(getAllowedComparisonPath("melatonine")).toBeNull();
  });

  it("maps route id magnesium-glycinaat to magnesium", () => {
    expect(isComparisonAllowed("magnesium-glycinaat")).toBe(true);
  });
});

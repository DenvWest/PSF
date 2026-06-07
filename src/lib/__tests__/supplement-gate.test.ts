import { describe, it, expect } from "vitest";
import {
  isSupplementSuggestionAllowed,
  resolveGatedComparisonPath,
} from "@/lib/supplement-gate";

describe("resolveGatedComparisonPath", () => {
  it("magnesium approved → /beste/magnesium", () => {
    expect(resolveGatedComparisonPath("magnesium")).toBe("/beste/magnesium");
  });

  it("ashwagandha on_hold → null", () => {
    expect(resolveGatedComparisonPath("ashwagandha")).toBeNull();
  });

  it("melatonine forbidden → null", () => {
    expect(resolveGatedComparisonPath("melatonine")).toBeNull();
  });

  it("eiwitpoeder approved zonder claims → comparisonPath", () => {
    expect(resolveGatedComparisonPath("eiwitpoeder")).toBe(
      "/beste/eiwitpoeder",
    );
  });
});

describe("isSupplementSuggestionAllowed", () => {
  it("tierAllowsSupplement false blokkeert niet op path-niveau", () => {
    expect(
      isSupplementSuggestionAllowed("magnesium", {
        tierAllowsSupplement: false,
      }),
    ).toBe(false);
  });

  it("cross-domein mismatch blokkeert wanneer domains gelijk", () => {
    expect(
      isSupplementSuggestionAllowed("magnesium", {
        tipDomain: "sleep_score",
        supplementDomain: "sleep_score",
      }),
    ).toBe(false);
  });
});

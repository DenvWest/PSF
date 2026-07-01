import { describe, it, expect } from "vitest";
import {
  isGatedComparisonPathAllowed,
  isSupplementSuggestionAllowed,
  resolveGatedComparisonPath,
} from "@/lib/supplement-gate";
import { isComparisonAllowed } from "@/lib/comparison-availability";

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

describe("isGatedComparisonPathAllowed", () => {
  it("approved comparison → true", () => {
    expect(isGatedComparisonPathAllowed("/beste/magnesium")).toBe(true);
  });

  it("on_hold comparison → false, terwijl de losse gate 'm wél zou toestaan", () => {
    expect(isComparisonAllowed("ashwagandha")).toBe(true);
    expect(isGatedComparisonPathAllowed("/beste/ashwagandha")).toBe(false);
  });

  it("onbekend of niet-/beste pad → false", () => {
    expect(isGatedComparisonPathAllowed("/beste/onbekend")).toBe(false);
    expect(isGatedComparisonPathAllowed("/energie-na-40")).toBe(false);
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

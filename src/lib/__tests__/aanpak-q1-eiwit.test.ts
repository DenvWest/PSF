import { describe, expect, it } from "vitest";
import { shouldShowAanpakQ1EiwitHero } from "@/lib/aanpak-q1-eiwit";

describe("shouldShowAanpakQ1EiwitHero", () => {
  it("false zonder answers", () => {
    expect(shouldShowAanpakQ1EiwitHero(null)).toBe(false);
    expect(shouldShowAanpakQ1EiwitHero(undefined)).toBe(false);
  });

  it("true bij NUT_PROT 1 of 2", () => {
    expect(shouldShowAanpakQ1EiwitHero({ NUT_PROT: 1 })).toBe(true);
    expect(shouldShowAanpakQ1EiwitHero({ NUT_PROT: 2 })).toBe(true);
  });

  it("false bij NUT_PROT 3 of 4", () => {
    expect(shouldShowAanpakQ1EiwitHero({ NUT_PROT: 3 })).toBe(false);
    expect(shouldShowAanpakQ1EiwitHero({ NUT_PROT: 4 })).toBe(false);
  });
});

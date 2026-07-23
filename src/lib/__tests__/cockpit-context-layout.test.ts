import { describe, expect, it } from "vitest";
import { resolveCockpitContextPresentation } from "@/lib/cockpit-context-layout";

describe("resolveCockpitContextPresentation", () => {
  it("geeft sidebar op brede viewports", () => {
    expect(resolveCockpitContextPresentation(true, false)).toBe("sidebar");
    expect(resolveCockpitContextPresentation(true, true)).toBe("sidebar");
  });

  it("geeft sheet op smalle viewports", () => {
    expect(resolveCockpitContextPresentation(false, true)).toBe("sheet");
  });

  it("geeft drawer op tablet-breedte", () => {
    expect(resolveCockpitContextPresentation(false, false)).toBe("drawer");
  });
});

import { describe, expect, it } from "vitest";
import {
  resolveCockpitContextPresentation,
  resolveCockpitContextTriggerAction,
} from "@/lib/cockpit-context-layout";

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

describe("resolveCockpitContextTriggerAction", () => {
  it("opent het paneel in sheet- en drawer-modus", () => {
    expect(resolveCockpitContextTriggerAction("sheet", false)).toBe("open");
    expect(resolveCockpitContextTriggerAction("drawer", false)).toBe("open");
  });

  it("negeert de inklap-stand buiten de sidebar", () => {
    expect(resolveCockpitContextTriggerAction("sheet", true)).toBe("open");
    expect(resolveCockpitContextTriggerAction("drawer", true)).toBe("open");
  });

  it("klapt de ingeklapte sidebar weer uit", () => {
    expect(resolveCockpitContextTriggerAction("sidebar", true)).toBe("expand");
  });

  it("focust de zichtbare sidebar", () => {
    expect(resolveCockpitContextTriggerAction("sidebar", false)).toBe("focus");
  });
});

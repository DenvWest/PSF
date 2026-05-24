import { describe, expect, it } from "vitest";
import {
  getDisplayStatus,
  getDisplayStatusFraming,
  getDisplayStatusTone,
} from "@/lib/score-display";

describe("getDisplayStatus", () => {
  it("maps boundary values", () => {
    expect(getDisplayStatus(80)).toBe("Sterk");
    expect(getDisplayStatus(79)).toBe("Voldoende");
    expect(getDisplayStatus(60)).toBe("Voldoende");
    expect(getDisplayStatus(59)).toBe("Aandacht");
    expect(getDisplayStatus(40)).toBe("Aandacht");
    expect(getDisplayStatus(39)).toBe("Prioriteit");
  });

  it("handles non-finite input", () => {
    expect(getDisplayStatus(Number.NaN)).toBe("Voldoende");
  });
});

describe("getDisplayStatusTone", () => {
  it("returns tone per status", () => {
    expect(getDisplayStatusTone("Sterk")).toBe("sage");
    expect(getDisplayStatusTone("Prioriteit")).toBe("terra-deep");
  });
});

describe("getDisplayStatusFraming", () => {
  it("uses compliance-safe wording", () => {
    const text = getDisplayStatusFraming("Slaap", "Aandacht");
    expect(text).toContain("aandachtspunt");
    expect(text).not.toMatch(/\d/);
  });
});

import { describe, expect, it } from "vitest";
import {
  isProteinAgeBand,
  proteinAgeNote,
  proteinTargetLine,
} from "@/lib/nutrition-protein-personal";

describe("eiwit-personalisatie in het logboek", () => {
  it("toont de range als er een gewicht bekend is", () => {
    expect(proteinTargetLine({ gramsLow: 95, gramsHigh: 110 })).toBe(
      "Op jouw gewicht: 95–110 g per dag.",
    );
  });

  it("zwijgt zonder gewicht in plaats van een standaard te verzinnen", () => {
    expect(proteinTargetLine(null)).toBeNull();
  });

  it("legt de hogere ondergrens alleen uit in de bovenste band", () => {
    expect(proteinAgeNote("55+")).toContain("verdeling over de dag");
    for (const band of ["40–44", "45–49", "50–54", null, undefined]) {
      expect(proteinAgeNote(band)).toBeNull();
    }
  });

  it("noemt in de leeftijdsuitleg geen getal", () => {
    // De handeling is de verdeling, niet een hoger cijfer. Een zin die alleen
    // "je hebt meer nodig" zegt geeft hem een getal en geen handeling.
    const note = proteinAgeNote("55+") ?? "";
    expect(note).not.toMatch(/\d+\s?(g|gram)\b/i);
    expect(note).not.toMatch(/\d+[,.]\d+/);
  });

  it("herkent de band die de vloer optilt", () => {
    expect(isProteinAgeBand("55+")).toBe(true);
    expect(isProteinAgeBand("50–54")).toBe(false);
    expect(isProteinAgeBand(null)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  getProteinEmphasis,
  proteinEmphasisForPalBand,
} from "@/lib/nutrition-protein-emphasis";

describe("proteinEmphasisForPalBand", () => {
  it("verhoogt de nadruk bij actieve banden", () => {
    expect(proteinEmphasisForPalBand("active").level).toBe("elevated");
    expect(proteinEmphasisForPalBand("very_active").level).toBe("elevated");
  });

  it("geen ophoging bij lage activiteit", () => {
    expect(proteinEmphasisForPalBand("sedentary")).toEqual({
      level: "standard",
      note: null,
    });
    expect(proteinEmphasisForPalBand("light").note).toBeNull();
  });

  it("scherpere toon bij een eiwit-gap", () => {
    expect(proteinEmphasisForPalBand("active", "below").note).toContain(
      "blijft nu achter",
    );
    expect(proteinEmphasisForPalBand("active", "meets").note).toContain(
      "hogere kant",
    );
  });

  it("gebruikt nooit status-/tekorttaal (compliance)", () => {
    const bands = ["active", "very_active"] as const;
    const proteinBands = [undefined, "below", "around", "meets"] as const;
    for (const band of bands) {
      for (const pb of proteinBands) {
        const note = (proteinEmphasisForPalBand(band, pb).note ?? "").toLowerCase();
        expect(note).not.toContain("tekort");
        expect(note).not.toContain("deficiën");
        expect(note).not.toContain("g/kg");
      }
    }
  });
});

describe("getProteinEmphasis", () => {
  it("leidt PAL af uit de bewegingsantwoorden", () => {
    expect(getProteinEmphasis({ MOV_STR: 4, MOV_CARD: 4 }).level).toBe("elevated");
    expect(getProteinEmphasis({ MOV_STR: 1, MOV_CARD: 1 }).level).toBe("standard");
  });
});

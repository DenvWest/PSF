import { describe, expect, it } from "vitest";
import { computeProteinTarget } from "@/lib/protein-target";

describe("computeProteinTarget", () => {
  it("schaalt met gewicht en hoge trainingsbelasting", () => {
    expect(computeProteinTarget({ weightKg: 80, trainingLoad: 4 })).toEqual({
      perKgLow: 1.6,
      perKgHigh: 1.8,
      gramsLow: 130, // 80 * 1.6 = 128 → 130
      gramsHigh: 145, // 80 * 1.8 = 144 → 145
    });
  });

  it("lage trainingsbelasting → conservatieve range", () => {
    expect(computeProteinTarget({ weightKg: 90, trainingLoad: 1 })).toMatchObject({
      perKgLow: 1.0,
      perKgHigh: 1.2,
    });
  });

  it("matige trainingsbelasting → actieve range", () => {
    expect(computeProteinTarget({ weightKg: 90, trainingLoad: 2 })).toMatchObject({
      perKgLow: 1.2,
      perKgHigh: 1.4,
    });
  });

  it("ontbrekende trainingsbelasting → basis 30+ range", () => {
    expect(computeProteinTarget({ weightKg: 80 })?.perKgLow).toBe(1.0);
  });

  it("weigert ongeldig gewicht", () => {
    expect(computeProteinTarget({ weightKg: 10 })).toBeNull();
    expect(computeProteinTarget({ weightKg: 500 })).toBeNull();
    expect(computeProteinTarget({ weightKg: Number.NaN })).toBeNull();
  });

  it("clampt trainingsbelasting buiten bereik", () => {
    expect(computeProteinTarget({ weightKg: 80, trainingLoad: 9 })?.perKgHigh).toBe(1.8);
  });
});

describe("leeftijdsvloer (55+)", () => {
  it("tilt de ondergrens op zonder de bovengrens te raken", () => {
    // PROT-AGE/ESPEN verdedigen ≥1,0–1,2 g/kg voor ouderen. De bovengrens
    // hoort bij training, niet bij leeftijd — die twee optellen zou
    // dubbeltellen zijn.
    const basis = computeProteinTarget({ weightKg: 80 });
    const ouder = computeProteinTarget({ weightKg: 80, ageRange: "55+" });
    expect(basis?.perKgLow).toBe(1.0);
    expect(ouder?.perKgLow).toBe(1.2);
    expect(ouder?.perKgHigh).toBe(basis?.perKgHigh);
  });

  it("laat de drie banden onder 55 ongemoeid", () => {
    // Binnen 40–54 legt geen enkele bron een grens; een getal zou daar
    // verzonnen zijn.
    for (const ageRange of ["40–44", "45–49", "50–54"]) {
      const result = computeProteinTarget({ weightKg: 80, ageRange });
      expect(result?.perKgLow, ageRange).toBe(1.0);
    }
  });

  it("verlaagt nooit wat training al hoger legde", () => {
    // Een 55-plusser die zwaar traint houdt zijn hogere ondergrens: de vloer
    // is een minimum, geen vervanging.
    const zwaar = computeProteinTarget({ weightKg: 80, trainingLoad: 4 });
    const zwaarOuder = computeProteinTarget({
      weightKg: 80,
      trainingLoad: 4,
      ageRange: "55+",
    });
    expect(zwaarOuder?.perKgLow).toBe(zwaar?.perKgLow);
    expect(zwaarOuder?.perKgLow).toBe(1.6);
  });

  it("negeert een onbekende leeftijdsband in plaats van te raden", () => {
    const result = computeProteinTarget({ weightKg: 80, ageRange: "onzin" });
    expect(result?.perKgLow).toBe(1.0);
  });
});

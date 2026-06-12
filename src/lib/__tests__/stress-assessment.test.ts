import { describe, it, expect } from "vitest";
import { assessStress } from "@/lib/stress-assessment";
import {
  STRESS_STATEMENTS,
  regieReflection,
  type StressDimensionKey,
} from "@/data/stress-checkin";

const FORBIDDEN = ["tekort", "diagnose", "cortisol", "gezond", "ongezond", "verhoogd", "normaalwaarde"];

describe("assessStress — band + choices", () => {
  it("STR_FREQ:1 + STR_RCV:4 → spanning aandacht met choices; herstel sterk zonder choices", () => {
    const results = assessStress({ STR_FREQ: 1, STR_RCV: 4 });
    const spanning = results.find((r) => r.dimension === "spanning");
    const herstel = results.find((r) => r.dimension === "herstel");

    expect(spanning?.band).toBe("aandacht");
    expect(spanning?.choices.length).toBeGreaterThan(0);
    expect(spanning?.deepen).not.toBeNull();

    expect(herstel?.band).toBe("sterk");
    expect(herstel?.choices).toHaveLength(0);
    expect(herstel?.deepen).toBeNull();
  });

  it("resultaat heeft geen supplement-veld", () => {
    const results = assessStress({ STR_FREQ: 1, STR_RCV: 2 });
    for (const result of results) {
      expect("supplement" in result).toBe(false);
    }
  });

  it("assessStress leest geen grip", () => {
    const results = assessStress({ STR_FREQ: 2, STR_RCV: 3, grip: 5 } as never);
    expect(results).toHaveLength(2);
    for (const result of results) {
      expect("grip" in result).toBe(false);
    }
  });
});

describe("assessStress — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const dimensions: StressDimensionKey[] = ["spanning", "herstel"];
    const bands = ["aandacht", "redelijk", "sterk"] as const;

    for (const dim of dimensions) {
      for (const band of bands) {
        const text = STRESS_STATEMENTS[dim][band].toLowerCase();
        for (const word of FORBIDDEN) {
          expect(text.includes(word), `${dim}/${band}: "${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });
});

describe("regieReflection", () => {
  it("grip 1 geeft validatie-zin voor lage regie", () => {
    const text = regieReflection(1);
    expect(text).toContain("normaal");
    expect(text).toContain("niet in één keer");
  });

  it("grip 3 geeft op-weg-zin", () => {
    const text = regieReflection(3);
    expect(text).toContain("op weg");
  });

  it("grip 5 geeft bevestiging", () => {
    const text = regieReflection(5);
    expect(text).toContain("pakt dit zelf op");
  });

  it("geen regieReflection bevat verboden woorden", () => {
    for (const grip of [1, 2, 3, 4, 5]) {
      const text = regieReflection(grip).toLowerCase();
      for (const word of FORBIDDEN) {
        expect(text.includes(word), `grip ${grip}: "${text}" bevat "${word}"`).toBe(false);
      }
    }
  });
});

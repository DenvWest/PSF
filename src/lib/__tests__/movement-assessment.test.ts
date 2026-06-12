import { describe, it, expect } from "vitest";
import { assessMovement } from "@/lib/movement-assessment";
import {
  MOVEMENT_STATEMENTS,
  type MovementDimensionKey,
} from "@/data/movement-checkin";
import { getUsableClaims } from "@/data/approved-claims";

const FORBIDDEN = ["tekort", "diagnose", "gezond", "ongezond", "verhoogd", "normaal"];

describe("assessMovement — band + supplement", () => {
  it("MOV_STR:1 + MOV_CARD:4 → kracht aandacht met choices + creatine; conditie sterk zonder choices", () => {
    const results = assessMovement({ MOV_STR: 1, MOV_CARD: 4 });
    const kracht = results.find((r) => r.dimension === "kracht");
    const conditie = results.find((r) => r.dimension === "conditie");

    expect(kracht?.band).toBe("aandacht");
    expect(kracht?.choices.length).toBeGreaterThan(0);
    expect(kracht?.deepen).not.toBeNull();
    expect(kracht?.supplement).not.toBeNull();
    expect(kracht?.supplement?.comparisonPath).toBe("/beste/creatine");
    expect(kracht?.supplement?.claimText).toBe(getUsableClaims("creatine")[0].text);

    expect(conditie?.band).toBe("sterk");
    expect(conditie?.choices).toHaveLength(0);
    expect(conditie?.deepen).toBeNull();
    expect(conditie?.supplement).toBeNull();
  });

  it("MOV_STR:4 + MOV_CARD:1 → kracht sterk zonder supplement; conditie aandacht met choices", () => {
    const results = assessMovement({ MOV_STR: 4, MOV_CARD: 1 });
    const kracht = results.find((r) => r.dimension === "kracht");
    const conditie = results.find((r) => r.dimension === "conditie");

    expect(kracht?.band).toBe("sterk");
    expect(kracht?.choices).toHaveLength(0);
    expect(kracht?.deepen).toBeNull();
    expect(kracht?.supplement).toBeNull();

    expect(conditie?.band).toBe("aandacht");
    expect(conditie?.choices.length).toBeGreaterThan(0);
    expect(conditie?.supplement).toBeNull();
  });

  it("MOV_STR:3 → band redelijk met choices", () => {
    const results = assessMovement({ MOV_STR: 3 });
    const kracht = results.find((r) => r.dimension === "kracht");

    expect(kracht?.band).toBe("redelijk");
    expect(kracht?.choices.length).toBeGreaterThan(0);
    expect(kracht?.deepen).not.toBeNull();
  });
});

describe("assessMovement — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const dimensions: MovementDimensionKey[] = ["kracht", "conditie"];
    const bands = ["aandacht", "redelijk", "sterk"] as const;

    for (const dim of dimensions) {
      for (const band of bands) {
        const text = MOVEMENT_STATEMENTS[dim][band].toLowerCase();
        for (const word of FORBIDDEN) {
          expect(text.includes(word), `${dim}/${band}: "${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });

  it("supplement zit nooit op conditie", () => {
    for (const movCard of [1, 2, 3, 4]) {
      const results = assessMovement({ MOV_CARD: movCard });
      const conditie = results.find((r) => r.dimension === "conditie");
      expect(conditie?.supplement).toBeNull();
    }
  });
});

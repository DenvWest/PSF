import { describe, it, expect } from "vitest";
import { assessMovement } from "@/lib/movement-assessment";
import {
  MOVEMENT_STATEMENTS,
  type MovementDimensionKey,
} from "@/data/movement-checkin";
import { getUsableClaims } from "@/data/approved-claims";

const FORBIDDEN = ["tekort", "diagnose", "gezond", "ongezond", "verhoogd", "normaal"];

describe("assessMovement — band + supplement", () => {
  it("MOV2_STR:1 + MOV2_CARD:5 → kracht aandacht met choices + creatine; conditie sterk zonder choices", () => {
    const results = assessMovement({ MOV2_STR: 1, MOV2_CARD: 5 });
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

  it("MOV2_STR:5 + MOV2_CARD:1 → kracht sterk zonder supplement; conditie aandacht met choices", () => {
    const results = assessMovement({ MOV2_STR: 5, MOV2_CARD: 1 });
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

  it("MOV2_STR:3 → band redelijk met choices", () => {
    const results = assessMovement({ MOV2_STR: 3 });
    const kracht = results.find((r) => r.dimension === "kracht");

    expect(kracht?.band).toBe("redelijk");
    expect(kracht?.choices.length).toBeGreaterThan(0);
    expect(kracht?.deepen).not.toBeNull();
  });

  it("klachten en motivatie hebben geen verdieping", () => {
    const results = assessMovement({
      MOV2_PAIN: 1,
      MOV2_MOTIV: 1,
    });
    const klachten = results.find((r) => r.dimension === "klachten");
    const motivatie = results.find((r) => r.dimension === "motivatie");

    expect(klachten?.deepen).toBeNull();
    expect(motivatie?.deepen).toBeNull();
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
    for (const movCard of [1, 2, 3, 4, 5]) {
      const results = assessMovement({ MOV2_CARD: movCard });
      const conditie = results.find((r) => r.dimension === "conditie");
      expect(conditie?.supplement).toBeNull();
    }
  });
});

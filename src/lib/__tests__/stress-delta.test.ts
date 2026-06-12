import { describe, it, expect } from "vitest";
import {
  stressDirection,
  stressStartStatement,
  type StressDirection,
} from "@/lib/stress-delta";

const FORBIDDEN = ["tekort", "diagnose", "cortisol", "gezond", "ongezond", "verhoogd", "normaalwaarde"];

describe("stressDirection", () => {
  it("delta +4 = stable", () => {
    expect(stressDirection(50, 54)).toBe("stable");
  });

  it("delta -4 = stable", () => {
    expect(stressDirection(50, 46)).toBe("stable");
  });

  it("delta +5 = improved", () => {
    expect(stressDirection(50, 55)).toBe("improved");
  });

  it("delta -5 = worsened", () => {
    expect(stressDirection(50, 45)).toBe("worsened");
  });
});

describe("stressStartStatement — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const directions: StressDirection[] = ["improved", "stable", "worsened"];
    for (const direction of directions) {
      const text = stressStartStatement(direction).toLowerCase();
      for (const word of FORBIDDEN) {
        expect(text.includes(word), `${direction}: "${text}" bevat "${word}"`).toBe(false);
      }
    }
  });
});

import { describe, it, expect } from "vitest";
import {
  sleepDirection,
  sleepStartStatement,
  type SleepDirection,
} from "@/lib/sleep-delta";

const FORBIDDEN = [
  "tekort",
  "diagnose",
  "gezond",
  "ongezond",
  "verhoogd",
  "normaalwaarde",
];

describe("sleepDirection", () => {
  it("delta +4 = stable", () => {
    expect(sleepDirection(50, 54)).toBe("stable");
  });

  it("delta -4 = stable", () => {
    expect(sleepDirection(50, 46)).toBe("stable");
  });

  it("delta +5 = improved", () => {
    expect(sleepDirection(50, 55)).toBe("improved");
  });

  it("delta -5 = worsened", () => {
    expect(sleepDirection(50, 45)).toBe("worsened");
  });
});

describe("sleepStartStatement — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const directions: SleepDirection[] = ["improved", "stable", "worsened"];
    for (const direction of directions) {
      const text = sleepStartStatement(direction).toLowerCase();
      for (const word of FORBIDDEN) {
        expect(text.includes(word), `${direction}: "${text}" bevat "${word}"`).toBe(false);
      }
    }
  });
});

import { describe, expect, it } from "vitest";
import { deriveTrainingLoadFromAnswers } from "@/lib/training-load";

describe("deriveTrainingLoadFromAnswers", () => {
  it("neemt het max van MOV_STR en MOV_CARD", () => {
    expect(deriveTrainingLoadFromAnswers({ MOV_STR: 2, MOV_CARD: 4 })).toBe(4);
    expect(deriveTrainingLoadFromAnswers({ MOV_STR: 3, MOV_CARD: 1 })).toBe(3);
  });

  it("clampt op 4", () => {
    expect(deriveTrainingLoadFromAnswers({ MOV_STR: 9, MOV_CARD: 0 })).toBe(4);
  });

  it("ontbrekende antwoorden → undefined (geen belasting)", () => {
    expect(deriveTrainingLoadFromAnswers({})).toBeUndefined();
  });

  it("load 0 → undefined, niet 0", () => {
    expect(deriveTrainingLoadFromAnswers({ MOV_STR: 0, MOV_CARD: 0 })).toBeUndefined();
  });
});

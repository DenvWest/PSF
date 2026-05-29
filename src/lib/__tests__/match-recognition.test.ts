import { describe, expect, it } from "vitest";
import {
  matchesRecognitionLine,
  pickRecognitionLines,
  type RecognitionLineCandidate,
} from "@/lib/content/match-recognition";

const lines: RecognitionLineCandidate[] = [
  {
    body_text: "Wakker in de nacht",
    match_question_id: "SLP_WAKE",
    match_operator: "<=",
    match_value: 2,
    priority: 2,
  },
  {
    body_text: "Lang inslapen",
    match_question_id: "SLP_ONSET",
    match_operator: "<=",
    match_value: 2,
    priority: 1,
  },
  {
    body_text: "In array",
    match_question_id: "STR_FREQ",
    match_operator: "in",
    match_value: [1, 2],
    priority: 1,
  },
];

describe("matchesRecognitionLine", () => {
  it("matches <= operator", () => {
    expect(
      matchesRecognitionLine(lines[0], { SLP_WAKE: 2 }),
    ).toBe(true);
    expect(
      matchesRecognitionLine(lines[0], { SLP_WAKE: 3 }),
    ).toBe(false);
  });

  it("matches in operator", () => {
    expect(
      matchesRecognitionLine(lines[2], { STR_FREQ: 2 }),
    ).toBe(true);
    expect(
      matchesRecognitionLine(lines[2], { STR_FREQ: 3 }),
    ).toBe(false);
  });

  it("returns false when answer missing", () => {
    expect(matchesRecognitionLine(lines[0], {})).toBe(false);
  });
});

describe("pickRecognitionLines", () => {
  it("returns top 3 by priority ascending", () => {
    const picked = pickRecognitionLines(lines, {
      SLP_WAKE: 1,
      SLP_ONSET: 1,
      STR_FREQ: 1,
    });
    expect(picked).toHaveLength(3);
    expect(picked[0]).toBe("Lang inslapen");
    expect(picked).toContain("Wakker in de nacht");
    expect(picked).toContain("In array");
  });

  it("limits to three lines", () => {
    const many = Array.from({ length: 5 }, (_, index) => ({
      body_text: `Line ${index}`,
      match_question_id: "SLP_WAKE",
      match_operator: "<=" as const,
      match_value: 4,
      priority: index,
    }));
    expect(
      pickRecognitionLines(many, { SLP_WAKE: 1 }).length,
    ).toBe(3);
  });
});

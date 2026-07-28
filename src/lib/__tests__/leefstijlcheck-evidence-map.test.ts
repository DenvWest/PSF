import { describe, it, expect } from "vitest";
import {
  EVIDENCE_QUESTIONS_BY_DOMAIN,
  LEEFSTIJLCHECK_QUESTION_EVIDENCE,
} from "@/data/leefstijlcheck-evidence";
import type { QuestionId } from "@/data/intake-questions";

const INTERVENTION_SCORING_QUESTIONS: QuestionId[] = [
  "SLP_QUAL",
  "SLP_CONS",
  "SLP_ONSET",
  "SLP_WAKE",
  "STR_FREQ",
  "STR_RCV",
  "NUT_O3",
  "NUT_PROT",
  "MOV_STR",
  "MOV_CARD",
  "CON_SOC",
];

describe("EVIDENCE_QUESTIONS_BY_DOMAIN", () => {
  it("dekt alle interventie-scoringvragen", () => {
    const mapped = new Set(
      Object.values(EVIDENCE_QUESTIONS_BY_DOMAIN).flat(),
    );

    for (const questionId of INTERVENTION_SCORING_QUESTIONS) {
      expect(mapped.has(questionId)).toBe(true);
    }
  });

  it("verwijst alleen naar bekende evidence-items", () => {
    const known = new Set(
      LEEFSTIJLCHECK_QUESTION_EVIDENCE.map((item) => item.questionId),
    );

    for (const questionId of Object.values(EVIDENCE_QUESTIONS_BY_DOMAIN).flat()) {
      expect(known.has(questionId)).toBe(true);
    }
  });
});

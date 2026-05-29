import { describe, expect, it } from "vitest";
import {
  buildEvidenceChatAnswer,
  EVIDENCE_CHAT_OUT_OF_SCOPE_MESSAGE,
  normalizeEvidenceQuestion,
  normalizeThemeDomainLabel,
} from "@/lib/evidence-rag";

describe("normalizeEvidenceQuestion", () => {
  it("accepts valid questions", () => {
    expect(normalizeEvidenceQuestion("  Hoe helpt magnesium bij slaap?  ")).toBe(
      "Hoe helpt magnesium bij slaap?",
    );
  });

  it("rejects too short or long input", () => {
    expect(normalizeEvidenceQuestion("ok")).toBeNull();
    expect(normalizeEvidenceQuestion("x".repeat(501))).toBeNull();
  });
});

describe("normalizeThemeDomainLabel", () => {
  it("accepts measured theme slugs", () => {
    expect(normalizeThemeDomainLabel("sleep")).toBe("sleep");
  });

  it("rejects connection and unknown", () => {
    expect(normalizeThemeDomainLabel("connection")).toBeNull();
    expect(normalizeThemeDomainLabel("energy")).toBeNull();
  });
});

describe("buildEvidenceChatAnswer", () => {
  it("returns out-of-scope message without citations", () => {
    expect(buildEvidenceChatAnswer([])).toBe(EVIDENCE_CHAT_OUT_OF_SCOPE_MESSAGE);
  });

  it("lists only claim text and sources", () => {
    const answer = buildEvidenceChatAnswer([
      {
        id: "1",
        claimText: "Magnesium draagt bij tot normale psychologische functie.",
        domainLabel: "sleep",
        sourceLabel: "Mah J, Pitre T. BMC 2021.",
        sourceUrl: "https://example.com",
      },
    ]);
    expect(answer).toContain("gepubliceerde evidence");
    expect(answer).toContain("Magnesium draagt bij");
    expect(answer).toContain("Mah J, Pitre T.");
    expect(answer).toContain("https://example.com");
  });
});

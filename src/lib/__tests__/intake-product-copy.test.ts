import { describe, expect, it } from "vitest";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";

describe("intake-product-copy", () => {
  it("avoids herstelplan and herstelprofiel in canonical strings", () => {
    const corpus = [
      ...Object.values(INTAKE_DELIVERABLE),
      ...Object.values(INTAKE_CTA),
    ].join(" ");
    expect(corpus.toLowerCase()).not.toContain("herstelplan");
    expect(corpus.toLowerCase()).not.toContain("herstelprofiel");
  });
});

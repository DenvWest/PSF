import { describe, expect, it } from "vitest";
import {
  INTAKE_CTA,
  INTAKE_DELIVERABLE,
  intakeCtaMatchProfile,
} from "@/lib/intake-product-copy";

describe("intake-product-copy", () => {
  it("avoids herstelplan and herstelprofiel in canonical strings", () => {
    const corpus = [
      ...Object.values(INTAKE_DELIVERABLE),
      ...Object.values(INTAKE_CTA),
    ].join(" ");
    expect(corpus.toLowerCase()).not.toContain("herstelplan");
    expect(corpus.toLowerCase()).not.toContain("herstelprofiel");
  });

  it("builds profile match CTA with leefstijloverzicht", () => {
    expect(intakeCtaMatchProfile("Onrustige Slaper")).toBe(
      "Ontdek jouw leefstijloverzicht — match met Onrustige Slaper",
    );
  });
});

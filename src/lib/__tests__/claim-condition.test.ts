import { describe, it, expect } from "vitest";
import {
  productMeetsAllLinkedClaims,
  productMeetsClaimThreshold,
} from "@/lib/claim-condition";

describe("productMeetsClaimThreshold", () => {
  it("magnesium 200mg elementair voldoet aan 56,25mg drempel", () => {
    expect(
      productMeetsClaimThreshold(
        { hoeveelheid: 200, eenheid: "mg", elementair: true },
        "magnesium.nerve-function",
      ),
    ).toBe(true);
  });

  it("magnesium 50mg elementair voldoet niet", () => {
    expect(
      productMeetsClaimThreshold(
        { hoeveelheid: 50, eenheid: "mg", elementair: true },
        "magnesium.fatigue",
      ),
    ).toBe(false);
  });

  it("omega3 EPA+DHA 650mg voldoet aan hart-claim", () => {
    expect(
      productMeetsClaimThreshold(
        {
          hoeveelheid: 650,
          eenheid: "mg",
          elementair: false,
          epaMg: 400,
          dhaMg: 250,
        },
        "omega3.heart",
      ),
    ).toBe(true);
  });

  it("omega3 DHA 130mg voldoet niet aan hersen-claim", () => {
    expect(
      productMeetsClaimThreshold(
        {
          hoeveelheid: 720,
          eenheid: "mg",
          elementair: false,
          epaMg: 590,
          dhaMg: 130,
        },
        "omega3.brain-dha",
      ),
    ).toBe(false);
  });
});

describe("productMeetsAllLinkedClaims", () => {
  it("alle gekoppelde claim-IDs moeten voldoen", () => {
    expect(
      productMeetsAllLinkedClaims({
        doseringPerDagdosis: {
          hoeveelheid: 200,
          eenheid: "mg",
          elementair: true,
        },
        efsaClaimIds: [
          "magnesium.nerve-function",
          "magnesium.muscle-function",
        ],
      }),
    ).toBe(true);
  });

  it("lege claim-IDs → false", () => {
    expect(
      productMeetsAllLinkedClaims({
        doseringPerDagdosis: {
          hoeveelheid: 200,
          eenheid: "mg",
          elementair: true,
        },
        efsaClaimIds: [],
      }),
    ).toBe(false);
  });
});

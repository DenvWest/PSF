import { describe, expect, it } from "vitest";
import { productMeetsClaimThreshold } from "@/lib/claim-condition";
import {
  parseEuroToCents,
  validateActiveInput,
  validateImageInput,
  validateOfferPrice,
  validateSourceInput,
} from "@/lib/product-admin/edit-validation";
import { buildDosering } from "@/lib/supplement-catalog-db/loader";

describe("parseEuroToCents", () => {
  it("accepteert komma en punt", () => {
    expect(parseEuroToCents("12,95")).toBe(1295);
    expect(parseEuroToCents("12.5")).toBe(1250);
  });
  it("wijst leeg, tekst en negatief af", () => {
    expect(parseEuroToCents("")).toBeNull();
    expect(parseEuroToCents("abc")).toBeNull();
    expect(parseEuroToCents("-1")).toBeNull();
  });
});

describe("validateActiveInput", () => {
  it("eist een positieve hoeveelheid en een bekende eenheid", () => {
    expect(validateActiveInput({ amount: 300, unit: "mg" })).toBeNull();
    expect(validateActiveInput({ amount: 0, unit: "mg" })).not.toBeNull();
    expect(validateActiveInput({ amount: Number.NaN, unit: "mg" })).not.toBeNull();
    expect(validateActiveInput({ amount: 5, unit: "kg" })).not.toBeNull();
  });
});

describe("validateImageInput", () => {
  it("eist bron én licentie-notitie", () => {
    expect(validateImageInput({ source: "own", licenseNote: "eigen foto" })).toBeNull();
    expect(validateImageInput({ source: "", licenseNote: "x" })).not.toBeNull();
    expect(validateImageInput({ source: "own", licenseNote: "   " })).not.toBeNull();
    expect(validateImageInput({ source: "gestolen", licenseNote: "x" })).not.toBeNull();
  });
});

describe("validateSourceInput", () => {
  it("eist een URL of titel en een geldige URL", () => {
    expect(validateSourceInput({ kind: "etiket", url: "", title: "Etiket 2026" })).toBeNull();
    expect(validateSourceInput({ kind: "etiket", url: "https://a.nl/x", title: "" })).toBeNull();
    expect(validateSourceInput({ kind: "etiket", url: "", title: "" })).not.toBeNull();
    expect(validateSourceInput({ kind: "etiket", url: "javascript:1", title: "" })).not.toBeNull();
  });
});

describe("validateOfferPrice", () => {
  it("eist een positieve prijs", () => {
    expect(validateOfferPrice(1295)).toBeNull();
    expect(validateOfferPrice(0)).not.toBeNull();
    expect(validateOfferPrice(null)).not.toBeNull();
  });
});

describe("claimdrempel na wijziging van een werkzame stof", () => {
  const active = (amount: number) => [
    { product_id: "p", nutrient_key: "magnesium", amount_per_serving: amount, unit: "mg", is_elemental: true },
  ];

  it("zakt onder de drempel als de dosis omlaag gaat", () => {
    expect(productMeetsClaimThreshold(buildDosering(active(300)), "magnesium.fatigue")).toBe(true);
    expect(productMeetsClaimThreshold(buildDosering(active(20)), "magnesium.fatigue")).toBe(false);
  });
});

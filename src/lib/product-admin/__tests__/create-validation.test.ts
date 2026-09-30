import { describe, expect, it } from "vitest";
import { NUTRIENT_KEYS, isSelectableClaim, listSelectableClaims } from "@/lib/product-admin/catalog-options";
import {
  validateCertificationKey,
  validateImagePath,
  validateNewActive,
  validateNewOffer,
  validateNewProduct,
} from "@/lib/product-admin/edit-validation";
import { buildProductSlug } from "@/lib/product-admin/slug";

describe("buildProductSlug", () => {
  it("combineert merk en naam", () => {
    expect(buildProductSlug("Arctic Blue", "Visolie", new Set())).toBe("arctic-blue-visolie");
  });
  it("herhaalt het merk niet als de naam ermee begint", () => {
    expect(buildProductSlug("Vital Nutrition", "Vital Nutrition Ashwagandha KSM-66", new Set())).toBe(
      "vital-nutrition-ashwagandha-ksm-66",
    );
  });
  it("lost botsingen op met een suffix", () => {
    const taken = new Set(["arctic-blue-visolie", "arctic-blue-visolie-2"]);
    expect(buildProductSlug("Arctic Blue", "Visolie", taken)).toBe("arctic-blue-visolie-3");
  });
  it("valt terug op 'product' bij een lege naam", () => {
    expect(buildProductSlug("", "!!!", new Set())).toBe("product");
  });
});

describe("validateNewProduct", () => {
  it("eist naam, merk en categorie", () => {
    expect(validateNewProduct({ name: "X", brandId: "b", categoryId: "c" })).toBeNull();
    expect(validateNewProduct({ name: " ", brandId: "b", categoryId: "c" })).not.toBeNull();
    expect(validateNewProduct({ name: "X", brandId: "", categoryId: "c" })).not.toBeNull();
    expect(validateNewProduct({ name: "X", brandId: "b", categoryId: "" })).not.toBeNull();
  });
});

describe("validateImagePath", () => {
  it("volgt de naamconventie in public/images/producten", () => {
    expect(validateImagePath("/images/producten/Vital-Nutrition-Ashwagandha-KSM-66.jpg")).toBeNull();
    expect(validateImagePath("/images/producten/Met Spatie.jpg")).not.toBeNull();
    expect(validateImagePath("/images/andere/x.jpg")).not.toBeNull();
    expect(validateImagePath("/images/producten/../../geheim.jpg")).not.toBeNull();
    expect(validateImagePath("/images/producten/x.gif")).not.toBeNull();
  });
});

describe("validateNewActive", () => {
  it("staat alleen bekende stoffen toe", () => {
    expect(validateNewActive({ nutrientKey: "magnesium", allowedKeys: NUTRIENT_KEYS, amount: 300, unit: "mg" })).toBeNull();
    expect(validateNewActive({ nutrientKey: "epa", allowedKeys: NUTRIENT_KEYS, amount: 300, unit: "mg" })).toBeNull();
    expect(validateNewActive({ nutrientKey: "onzin", allowedKeys: NUTRIENT_KEYS, amount: 300, unit: "mg" })).not.toBeNull();
    expect(validateNewActive({ nutrientKey: "magnesium", allowedKeys: NUTRIENT_KEYS, amount: 0, unit: "mg" })).not.toBeNull();
  });
});

describe("claims en certificeringen", () => {
  it("biedt alleen goedgekeurde claims aan", () => {
    const claims = listSelectableClaims();
    expect(claims.length).toBeGreaterThan(0);
    expect(isSelectableClaim(claims[0].id)).toBe(true);
    expect(isSelectableClaim("verzonnen.claim")).toBe(false);
  });
  it("valideert certificeringssleutels", () => {
    expect(validateCertificationKey("third_party_tested")).toBeNull();
    expect(validateCertificationKey("Met Spatie")).not.toBeNull();
  });
});

describe("validateNewOffer", () => {
  it("eist retailer en prijs, en een geldige affiliate-URL als die is ingevuld", () => {
    expect(validateNewOffer({ retailerId: "r", priceCents: 2500, affiliateUrl: "" })).toBeNull();
    expect(validateNewOffer({ retailerId: "", priceCents: 2500, affiliateUrl: "" })).not.toBeNull();
    expect(validateNewOffer({ retailerId: "r", priceCents: null, affiliateUrl: "" })).not.toBeNull();
    expect(validateNewOffer({ retailerId: "r", priceCents: 2500, affiliateUrl: "javascript:1" })).not.toBeNull();
    expect(validateNewOffer({ retailerId: "r", priceCents: 2500, affiliateUrl: "https://a.nl/x?sub=1" })).toBeNull();
  });
});

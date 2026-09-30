import { describe, expect, it } from "vitest";
import {
  isEditableBrandField,
  isEditableCategoryField,
  validateBrandField,
  validateCategoryField,
  validateNewBrandName,
} from "@/lib/product-admin/validation";

describe("merk- en categorievelden", () => {
  it("laat alleen de allowlist toe en beschermt slug en koppelingen", () => {
    expect(isEditableBrandField("name")).toBe(true);
    expect(isEditableBrandField("slug")).toBe(false);
    expect(isEditableBrandField("pd_partner_id")).toBe(false);
    expect(isEditableCategoryField("description")).toBe(true);
    expect(isEditableCategoryField("slug")).toBe(false);
    expect(isEditableCategoryField("ingredient_claim_key")).toBe(false);
    expect(isEditableCategoryField("comparison_path")).toBe(false);
  });

  it("eist een naam en een geldige website", () => {
    expect(validateBrandField("name", "")).not.toBeNull();
    expect(validateBrandField("website", "vitalnutrition.nl")).toBeNull();
    expect(validateBrandField("website", "javascript:1")).not.toBeNull();
    expect(validateBrandField("website", "")).toBeNull();
    expect(validateBrandField("website", "data:text/html,x")).not.toBeNull();
    expect(validateBrandField("website", "javascript:1")).not.toBeNull();
    expect(validateBrandField("website", "shop.nl:8080/x")).toBeNull();
    expect(validateCategoryField("name", "")).not.toBeNull();
    expect(validateCategoryField("description", "")).toBeNull();
  });

  it("valideert de naam van een nieuw merk", () => {
    expect(validateNewBrandName("  ")).not.toBeNull();
    expect(validateNewBrandName("x".repeat(81))).not.toBeNull();
    expect(validateNewBrandName("Arctic Blue")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  isEditableProductField,
  normalizeProductFieldValue,
  validateOptionalPositiveNumber,
  validateProductField,
} from "@/lib/product-admin/validation";

describe("verpakkings- en portievelden", () => {
  it("staan op de allowlist", () => {
    expect(isEditableProductField("container_size")).toBe(true);
    expect(isEditableProductField("container_unit")).toBe(true);
    expect(isEditableProductField("servings_per_container")).toBe(true);
    expect(isEditableProductField("serving_size")).toBe(true);
    expect(isEditableProductField("serving_unit")).toBe(true);
  });

  it("validateOptionalPositiveNumber accepteert leeg, wijst 0/negatief/niet-getal af", () => {
    expect(validateOptionalPositiveNumber("", false)).toBeNull();
    expect(validateOptionalPositiveNumber("120", false)).toBeNull();
    expect(validateOptionalPositiveNumber("1,5", false)).toBeNull();
    expect(validateOptionalPositiveNumber("0", false)).not.toBeNull();
    expect(validateOptionalPositiveNumber("-5", false)).not.toBeNull();
    expect(validateOptionalPositiveNumber("abc", false)).not.toBeNull();
  });

  it("validateOptionalPositiveNumber eist een heel getal als integer=true", () => {
    expect(validateOptionalPositiveNumber("60", true)).toBeNull();
    expect(validateOptionalPositiveNumber("60.5", true)).not.toBeNull();
  });

  it("validateProductField past numerieke validatie toe op de juiste velden", () => {
    expect(validateProductField("container_size", "500")).toBeNull();
    expect(validateProductField("container_size", "-1")).not.toBeNull();
    expect(validateProductField("servings_per_container", "100")).toBeNull();
    expect(validateProductField("servings_per_container", "100.5")).not.toBeNull();
    expect(validateProductField("serving_size", "30")).toBeNull();
    expect(validateProductField("container_unit", "g")).toBeNull();
  });

  it("normalizeProductFieldValue zet komma om naar punt, alleen voor numerieke velden", () => {
    expect(normalizeProductFieldValue("container_size", "1,5")).toBe("1.5");
    expect(normalizeProductFieldValue("container_unit", "1,5 kg")).toBe("1,5 kg");
    expect(normalizeProductFieldValue("container_size", "")).toBe("");
  });
});

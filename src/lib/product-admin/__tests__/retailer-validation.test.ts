import { describe, expect, it } from "vitest";
import {
  isEditableRetailerField,
  validateNewRetailer,
  validateRetailerField,
} from "@/lib/product-admin/retailer-validation";

describe("retailervelden", () => {
  it("laat alleen de allowlist toe en beschermt soort en slug", () => {
    expect(isEditableRetailerField("name")).toBe(true);
    expect(isEditableRetailerField("pd_partner_id")).toBe(true);
    expect(isEditableRetailerField("relationship")).toBe(false);
    expect(isEditableRetailerField("slug")).toBe(false);
    expect(isEditableRetailerField("active")).toBe(false);
  });

  it("valideert naam, basis-URL en tracking-parameter", () => {
    expect(validateRetailerField("name", "")).not.toBeNull();
    expect(validateRetailerField("base_url", "https://www.vitaminstore.nl")).toBeNull();
    expect(validateRetailerField("base_url", "javascript:1")).not.toBeNull();
    expect(validateRetailerField("tracking_param", "subid")).toBeNull();
    expect(validateRetailerField("tracking_param", "a b&c=1")).not.toBeNull();
    expect(validateRetailerField("tracking_param", "")).toBeNull();
  });

  it("valideert een nieuwe retailer", () => {
    expect(validateNewRetailer({ name: "Bol", relationship: "network" })).toBeNull();
    expect(validateNewRetailer({ name: " ", relationship: "network" })).not.toBeNull();
    expect(validateNewRetailer({ name: "Bol", relationship: "onbekend" })).not.toBeNull();
  });
});

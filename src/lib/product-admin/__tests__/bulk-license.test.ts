import { describe, expect, it } from "vitest";
import { imagesNeedingLicense, validateBulkLicense } from "@/lib/product-admin/bulk-license";

describe("imagesNeedingLicense", () => {
  it("slaat afbeeldingen met een notitie over", () => {
    const images = [
      { id: "1", source: "own", license_note: "Eigen foto" },
      { id: "2", source: "own", license_note: null },
      { id: "3", source: null, license_note: "   " },
    ];
    expect(imagesNeedingLicense(images).map((i) => i.id)).toEqual(["2", "3"]);
  });
});

describe("validateBulkLicense", () => {
  const note = "Aanname eigenaar (2026-10-10): gebruik via het affiliate-programma van Vitaminstore.";
  it("accepteert een geldige bron en notitie", () => {
    expect(validateBulkLicense({ source: "merchant_feed", licenseNote: note })).toBeNull();
  });
  it("weigert een onbekende bron", () => {
    expect(validateBulkLicense({ source: "internet", licenseNote: note })).toMatch(/bron/);
  });
  it("weigert een te korte of lege notitie", () => {
    expect(validateBulkLicense({ source: "own", licenseNote: "" })).not.toBeNull();
    expect(validateBulkLicense({ source: "own", licenseNote: "eigen foto" })).toMatch(/minstens/);
  });
});

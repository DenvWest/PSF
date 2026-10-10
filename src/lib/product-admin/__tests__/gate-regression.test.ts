import { describe, expect, it } from "vitest";
import { gateRegressions, publishedEditBlock } from "@/lib/product-admin/gate-regression";
import type { GateInput } from "@/lib/product-admin/publish-gate";
import type { ProductDossier } from "@/lib/product-admin/queries";

const TODAY = "2026-10-10";

function gateInput(over: Partial<GateInput> = {}): GateInput {
  return {
    images: [{ source: "manufacturer", license_note: "Toestemming" }],
    actives: [{ amount_per_serving: 300, unit: "mg" }],
    claims: [],
    offers: [{ active: true, price_checked_at: "2026-10-05T10:00:00Z" }],
    sourceCount: 1,
    score: { available: true, detail: "72/100" },
    today: TODAY,
    ...over,
  };
}

function dossier(status: string, over: Partial<ProductDossier> = {}): ProductDossier {
  return {
    product: { id: "p1", status },
    actives: [{ id: "a1", nutrient_key: "magnesium", form_key: null, amount_per_serving: 300, unit: "mg", is_elemental: true }],
    ingredients: [],
    certifications: [],
    claims: [],
    images: [{ id: "i1", path: "x.jpg", alt: null, position: 0, source: "manufacturer", license_note: "Toestemming", checked_at: null }],
    offers: [
      { id: "o1", price_cents: 1000, currency: "EUR", active: true, price_checked_at: "2026-10-05T10:00:00Z", source: "manual", affiliate_url: null, sup_retailers: null },
    ],
    sources: [{ id: "s1", kind: "studie", url: null, title: null, checked_at: null }],
    score: null,
    scoreInputState: {},
    gate: [{ key: "score", label: "PS-Score te berekenen", ok: true, detail: "72/100" }],
    ...over,
  } as unknown as ProductDossier;
}

describe("gateRegressions", () => {
  it("meldt alleen criteria die eerst slaagden", () => {
    const before = gateInput({ sourceCount: 0 });
    const after = gateInput({ sourceCount: 0, images: [] });
    expect(gateRegressions(before, after).map((c) => c.key)).toEqual(["images"]);
  });
});

describe("publishedEditBlock", () => {
  it("laat concept-producten vrij", () => {
    expect(publishedEditBlock(dossier("draft"), { kind: "removeSource", sourceId: "s1" }, TODAY)).toBeNull();
  });

  it("blokkeert het verwijderen van de laatste bron bij een gepubliceerd product", () => {
    expect(publishedEditBlock(dossier("published"), { kind: "removeSource", sourceId: "s1" }, TODAY)).toMatch(
      /Minstens één bron/,
    );
  });

  it("blokkeert het verwijderen van de laatste afbeelding", () => {
    expect(publishedEditBlock(dossier("published"), { kind: "removeImage", imageId: "i1" }, TODAY)).toMatch(/Afbeelding/);
  });

  it("blokkeert het deactiveren van de enige aanbieding", () => {
    expect(
      publishedEditBlock(dossier("published"), { kind: "setOfferActive", offerId: "o1", active: false }, TODAY),
    ).toMatch(/aanbieding/);
  });

  it("blokkeert het verwijderen van de laatste werkzame stof", () => {
    expect(publishedEditBlock(dossier("published"), { kind: "removeActive", activeId: "a1" }, TODAY)).toMatch(
      /Werkzame stoffen/,
    );
  });

  it("blokkeert het wissen van de licentie-notitie", () => {
    expect(
      publishedEditBlock(dossier("published"), { kind: "updateImage", imageId: "i1", source: "own", licenseNote: " " }, TODAY),
    ).toMatch(/Afbeelding/);
  });

  it("laat een verbetering van een falend product toe", () => {
    const failing = dossier("published", { sources: [] });
    expect(
      publishedEditBlock(failing, { kind: "updateImage", imageId: "i1", source: "own", licenseNote: "Eigen foto 2026" }, TODAY),
    ).toBeNull();
  });

  it("laat een wijziging toe die de poort intact laat", () => {
    expect(publishedEditBlock(dossier("published"), { kind: "updateActive", activeId: "a1", amount: 200, unit: "mg" }, TODAY)).toBeNull();
  });
});

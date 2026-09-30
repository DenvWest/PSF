import { describe, expect, it } from "vitest";
import {
  evaluatePublishGate,
  gateFailures,
  isFreshPrice,
  productFreshness,
  type GateInput,
} from "@/lib/product-admin/publish-gate";
import { isEditableProductField, validateProductField } from "@/lib/product-admin/validation";

const TODAY = "2026-09-30";

function input(over: Partial<GateInput> = {}): GateInput {
  return {
    images: [{ source: "manufacturer", license_note: "Toestemming per mail 2026-08-01" }],
    actives: [{ amount_per_serving: 300, unit: "mg" }],
    claims: [{ efsa_claim_id: "magnesium-vermoeidheid", meets_condition: true }],
    offers: [{ active: true, price_checked_at: "2026-09-20T10:00:00Z" }],
    sourceCount: 1,
    score: { available: true, detail: "72/100" },
    today: TODAY,
    ...over,
  };
}

const failedKeys = (i: GateInput) => gateFailures(evaluatePublishGate(i)).map((c) => c.key);

describe("evaluatePublishGate", () => {
  it("laat een compleet product door", () => {
    expect(failedKeys(input())).toEqual([]);
  });

  it("blokkeert een afbeelding zonder licentie-notitie", () => {
    expect(failedKeys(input({ images: [{ source: "own", license_note: "  " }] }))).toEqual(["images"]);
  });

  it("blokkeert zonder afbeeldingen", () => {
    expect(failedKeys(input({ images: [] }))).toEqual(["images"]);
  });

  it("accepteert één gelicentieerde afbeelding naast een onvolledige", () => {
    expect(
      failedKeys(
        input({
          images: [
            { source: null, license_note: null },
            { source: "own", license_note: "eigen foto" },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it("blokkeert werkzame stoffen zonder hoeveelheid, eenheid of zonder rijen", () => {
    expect(failedKeys(input({ actives: [] }))).toEqual(["actives"]);
    expect(failedKeys(input({ actives: [{ amount_per_serving: 0, unit: "mg" }] }))).toEqual(["actives"]);
    expect(failedKeys(input({ actives: [{ amount_per_serving: 5, unit: "" }] }))).toEqual(["actives"]);
  });

  it("blokkeert een claim waarvan de drempel niet gehaald is, en noemt die claim", () => {
    const criteria = evaluatePublishGate(
      input({ claims: [{ efsa_claim_id: "a", meets_condition: true }, { efsa_claim_id: "b", meets_condition: false }] }),
    );
    const claims = criteria.find((c) => c.key === "claims");
    expect(claims?.ok).toBe(false);
    expect(claims?.detail).toContain("b");
  });

  it("staat een product zonder claims toe", () => {
    expect(failedKeys(input({ claims: [] }))).toEqual([]);
  });

  it("blokkeert oude, ontbrekende of inactieve prijzen", () => {
    expect(failedKeys(input({ offers: [{ active: true, price_checked_at: "2026-08-01T00:00:00Z" }] }))).toEqual(["offers"]);
    expect(failedKeys(input({ offers: [{ active: true, price_checked_at: null }] }))).toEqual(["offers"]);
    expect(failedKeys(input({ offers: [{ active: false, price_checked_at: "2026-09-29T00:00:00Z" }] }))).toEqual(["offers"]);
    expect(failedKeys(input({ offers: [] }))).toEqual(["offers"]);
  });

  it("blokkeert zonder bron of zonder berekenbare score", () => {
    expect(failedKeys(input({ sourceCount: 0 }))).toEqual(["sources"]);
    expect(failedKeys(input({ score: { available: false, detail: "Score-invoer ontbreekt" } }))).toEqual(["score"]);
  });

  it("meldt alle falende punten tegelijk", () => {
    expect(
      failedKeys(input({ images: [], sourceCount: 0, offers: [], score: { available: false, detail: "x" } })),
    ).toEqual(["images", "offers", "sources", "score"]);
  });
});

describe("isFreshPrice", () => {
  it("telt precies 30 dagen nog als vers", () => {
    expect(isFreshPrice("2026-08-31T00:00:00Z", TODAY)).toBe(true);
    expect(isFreshPrice("2026-08-30T00:00:00Z", TODAY)).toBe(false);
    expect(isFreshPrice(null, TODAY)).toBe(false);
  });
});

describe("productFreshness", () => {
  it("is vers bij recente controle en verse prijzen", () => {
    expect(
      productFreshness({
        dataCheckedAt: "2026-09-01T00:00:00Z",
        activeOffers: [{ active: true, price_checked_at: "2026-09-25T00:00:00Z" }],
        today: TODAY,
      }).state,
    ).toBe("vers");
  });

  it("is verouderd bij data ouder dan 90 dagen of een oude prijs", () => {
    const old = productFreshness({
      dataCheckedAt: "2026-05-01T00:00:00Z",
      activeOffers: [{ active: true, price_checked_at: "2026-09-25T00:00:00Z" }],
      today: TODAY,
    });
    expect(old.state).toBe("verouderd");
    expect(old.staleData).toBe(true);

    const stalePrice = productFreshness({
      dataCheckedAt: "2026-09-25T00:00:00Z",
      activeOffers: [{ active: true, price_checked_at: "2026-07-01T00:00:00Z" }],
      today: TODAY,
    });
    expect(stalePrice.stalePrices).toBe(1);
    expect(stalePrice.state).toBe("verouderd");
  });

  it("is onbekend zonder controledatum en zonder aanbiedingen", () => {
    expect(productFreshness({ dataCheckedAt: null, activeOffers: [], today: TODAY }).state).toBe("onbekend");
  });

  it("negeert inactieve aanbiedingen bij het tellen van oude prijzen", () => {
    expect(
      productFreshness({
        dataCheckedAt: "2026-09-25T00:00:00Z",
        activeOffers: [{ active: false, price_checked_at: null }],
        today: TODAY,
      }).stalePrices,
    ).toBe(0);
  });
});

describe("validateProductField", () => {
  it("laat alleen de allowlist toe", () => {
    expect(isEditableProductField("name")).toBe(true);
    expect(isEditableProductField("status")).toBe(false);
    expect(isEditableProductField("slug")).toBe(false);
  });

  it("eist een naam en een geldige URL", () => {
    expect(validateProductField("name", "")).not.toBeNull();
    expect(validateProductField("product_url", "javascript:alert(1)")).not.toBeNull();
    expect(validateProductField("product_url", "shop.nl/product")).toBeNull();
    expect(validateProductField("product_url", "")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { classifyPriceAge, summarizePrices } from "@/lib/product-admin/price-decay";
import { computePartnerSignals, type PartnerSignalBundle } from "@/lib/partnerdesk/partner-signals";
import type { PdPartner } from "@/types/partnerdesk";

const TODAY = "2026-10-10";
const daysAgo = (n: number) => new Date(Date.parse(TODAY) - n * 86_400_000).toISOString();

describe("classifyPriceAge", () => {
  it("deelt in op leeftijd", () => {
    expect(classifyPriceAge(daysAgo(10), TODAY)).toBe("fresh");
    expect(classifyPriceAge(daysAgo(22), TODAY)).toBe("fresh");
    expect(classifyPriceAge(daysAgo(23), TODAY)).toBe("warn");
    expect(classifyPriceAge(daysAgo(30), TODAY)).toBe("warn");
    expect(classifyPriceAge(daysAgo(31), TODAY)).toBe("stale");
    expect(classifyPriceAge(daysAgo(37), TODAY)).toBe("stale");
    expect(classifyPriceAge(daysAgo(38), TODAY)).toBe("overdue");
  });

  it("telt een nooit gecontroleerde prijs als over de termijn", () => {
    expect(classifyPriceAge(null, TODAY)).toBe("overdue");
  });
});

describe("summarizePrices", () => {
  it("telt per toestand en bewaart maximaal 5 slugs", () => {
    const offers = [
      { slug: "a", price_checked_at: daysAgo(5) },
      { slug: "b", price_checked_at: daysAgo(25) },
      { slug: "c", price_checked_at: daysAgo(33) },
      { slug: "d", price_checked_at: null },
      ...["e", "f", "g", "h"].map((slug) => ({ slug, price_checked_at: daysAgo(60) })),
    ];
    const s = summarizePrices(offers, TODAY);
    expect(s).toMatchObject({ warn: 1, stale: 1, overdue: 5 });
    expect(s.slugs).toHaveLength(5);
    expect(s.slugs).not.toContain("a");
  });
});

describe("prices_stale-signaal", () => {
  const bundle = (prices: PartnerSignalBundle["prices"]): PartnerSignalBundle => ({
    partner: { id: "p1", created_at: "2026-01-01T00:00:00Z", status: "active", archived_at: null } as PdPartner,
    contracts: [],
    rules: [],
    contacts: [],
    prices,
  });
  const find = (b: PartnerSignalBundle) => computePartnerSignals(b, TODAY).find((s) => s.type === "prices_stale");

  it("geeft geen signaal zonder verouderde prijzen", () => {
    expect(find(bundle({ warn: 0, stale: 0, overdue: 0, slugs: [] }))).toBeUndefined();
    expect(find(bundle(undefined))).toBeUndefined();
  });

  it("is amber zolang de termijn loopt", () => {
    expect(find(bundle({ warn: 2, stale: 1, overdue: 0, slugs: ["a"] }))?.severity).toBe("amber");
  });

  it("wordt rood na de termijn", () => {
    expect(find(bundle({ warn: 0, stale: 0, overdue: 1, slugs: ["a"] }))?.severity).toBe("red");
  });
});

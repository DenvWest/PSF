import { describe, expect, it } from "vitest";
import { FORM_BIOAVAILABILITY } from "@/data/supplement-hub/score-model";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import {
  buildProductSamenvatting,
  getCategoryPeers,
  getHubProductBySlug,
  getHubProductSlugs,
  getHubProducts,
} from "@/lib/supplement-hub/product-catalog";

const products = getHubProducts();

describe("productcatalogus", () => {
  it("bevat elk product uit elke vergelijking", () => {
    expect(products.length).toBe(22);
  });

  it("gebruikt uitsluitend vormen die in de vormregistratie staan", () => {
    const onbekend: string[] = [];
    for (const [category, entries] of Object.entries(PRODUCT_SCORE_INPUTS)) {
      const forms = FORM_BIOAVAILABILITY[category as keyof typeof FORM_BIOAVAILABILITY];
      for (const [slug, inputs] of Object.entries(entries)) {
        if (!forms?.[inputs.formKey]) {
          onbekend.push(`${category}/${slug} → ${inputs.formKey}`);
        }
      }
    }
    expect(onbekend).toEqual([]);
  });

  it("geeft elk product een score binnen 0–100", () => {
    for (const product of products) {
      expect(product.score.total).toBeGreaterThanOrEqual(0);
      expect(product.score.total).toBeLessThanOrEqual(100);
    }
  });

  it("rangschikt binnen de categorie, niet erbuiten", () => {
    const magnesium = products.filter((p) => p.category === "magnesium");
    expect(magnesium).toHaveLength(3);
    for (const product of magnesium) {
      expect(product.kwaliteitsrang.total).toBe(3);
      expect(product.kostenrang.total).toBe(3);
    }
    expect(magnesium.map((p) => p.kwaliteitsrang.position).sort()).toEqual([1, 2, 3]);
  });

  it("geeft de laagste prijs per dag kostenrang 1", () => {
    for (const category of new Set(products.map((p) => p.category))) {
      const inCategory = products.filter((p) => p.category === category);
      const goedkoopste = inCategory.reduce((a, b) =>
        a.cost.centenPerDag <= b.cost.centenPerDag ? a : b,
      );
      expect(goedkoopste.kostenrang.position).toBe(1);
    }
  });

  it("rekent per etiketdag zodra er geen erkende claim is", () => {
    const zonderClaim = products.filter(
      (p) => p.claimStance === "geen_erkende_claim" || p.claimStance === "onbepaald",
    );
    expect(zonderClaim.length).toBeGreaterThan(0);
    for (const product of zonderClaim) {
      expect(product.cost.basis).toBe("etiketdag");
      expect(product.cost.centenPerDag).toBe(product.cost.etiketCentenPerDag);
    }
  });

  it("schaalt de prijs op wanneer de dosering onder de claimdrempel ligt", () => {
    const opgeschaald = products.filter(
      (p) => p.cost.centenPerDag > p.cost.etiketCentenPerDag,
    );
    for (const product of opgeschaald) {
      expect(product.cost.basis).toBe("claim-conforme-dag");
      expect(product.claimStance).not.toBe("voldoet");
    }
  });

  it("markeert ashwagandha en eiwitpoeder als zonder Europees erkende claim", () => {
    const botanicalsEnEiwit = products.filter(
      (p) => p.category === "ashwagandha" || p.category === "eiwitpoeder",
    );
    for (const product of botanicalsEnEiwit) {
      expect(["geen_erkende_claim", "onbepaald"]).toContain(product.claimStance);
    }
  });

  it("laat geen product zonder onderbouwing per onderdeel achter", () => {
    for (const product of products) {
      for (const component of product.score.components) {
        expect(component.reden.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("productpagina's", () => {
  it("heeft een unieke slug per product, zodat /product/[slug] eenduidig is", () => {
    const slugs = getHubProductSlugs();
    expect(slugs).toHaveLength(products.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("vindt elk product terug op zijn eigen href", () => {
    for (const product of products) {
      expect(product.href).toBe(`/product/${product.slug}`);
      expect(getHubProductBySlug(product.slug)).toBe(product);
    }
  });

  it("geeft niets terug voor een onbekende slug", () => {
    expect(getHubProductBySlug("bestaat-niet")).toBeNull();
  });

  it("toont als alternatieven alleen de rest van dezelfde categorie", () => {
    for (const product of products) {
      const peers = getCategoryPeers(product);
      expect(peers).toHaveLength(product.kwaliteitsrang.total - 1);
      for (const peer of peers) {
        expect(peer.category).toBe(product.category);
        expect(peer.slug).not.toBe(product.slug);
      }
    }
  });

  it("bouwt een samenvatting die de claimtoestand niet mooier maakt dan hij is", () => {
    for (const product of products) {
      const tekst = buildProductSamenvatting(product);
      expect(tekst.length).toBeGreaterThan(80);

      if (product.claimStance === "geen_erkende_claim") {
        expect(tekst).toContain("geen Europees erkende gezondheidsclaim");
      }
      if (product.claimStance === "onbepaald") {
        expect(tekst).toContain("niet uit het etiket vast te stellen");
      }
      if (product.claimStance !== "voldoet") {
        expect(tekst).not.toContain("mag het product de");
      }
    }
  });

  it("draagt de affiliate-sleutel wel op de catalogus, niet in de score", () => {
    for (const product of products) {
      expect(product.affiliateSlug).toBeTruthy();
      expect(JSON.stringify(product.score)).not.toContain(product.affiliateSlug);
    }
  });
});

import { describe, expect, it } from "vitest";
import { buildProductSchema, jsonLdScript } from "@/lib/seo/structuredData";
import { omega3Data } from "@/data/supplements/omega-3";

const PRODUCT = omega3Data.products[0];
const PAGE_URL = "https://perfectsupplement.nl/beste/omega-3-supplement";

describe("buildProductSchema", () => {
  it("bevat geen offers of aggregateRating (geen prijsdata, PS-Score is geen klantreview)", () => {
    const schema = buildProductSchema(PRODUCT, PAGE_URL);
    expect(schema).not.toHaveProperty("offers");
    expect(schema).not.toHaveProperty("aggregateRating");
  });

  it("verwijst naar de productanker op de pagina-url", () => {
    const schema = buildProductSchema(PRODUCT, PAGE_URL);
    expect(schema.url).toBe(`${PAGE_URL}#${PRODUCT.slug}`);
  });

  it("draagt naam en merk uit het product", () => {
    const schema = buildProductSchema(PRODUCT, PAGE_URL);
    expect(schema.name).toBe(PRODUCT.name);
    expect(schema.brand).toEqual({ "@type": "Brand", name: PRODUCT.brand });
  });
});

describe("jsonLdScript", () => {
  it("escapet < zodat </script> uit DB-/feedtekst niet kan injecteren", () => {
    const malicious = { name: 'Product</script><script>alert(1)</script>' };
    const html = jsonLdScript(malicious);
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003cscript>");
  });

  it("blijft geldige JSON op het oorspronkelijke object na het ongedaan maken van de escape", () => {
    const schema = { "@type": "Product", name: "A < B" };
    const html = jsonLdScript(schema);
    expect(JSON.parse(html.replace(/\\u003c/g, "<"))).toEqual(schema);
  });
});

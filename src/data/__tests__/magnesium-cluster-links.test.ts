import { describe, expect, it } from "vitest";
import { alleArtikelen, getArtikelBySlug } from "@/data/blog";
import { kennisbankTerms } from "@/data/kennisbank";

const MAGNESIUM_CLUSTER = [
  "magnesium-tekort-herkennen",
  "hoeveel-magnesium-per-dag",
  "magnesium-wanneer-innemen",
  "magnesium-en-spierkrampen",
  "magnesium-uit-voeding",
  "magnesium-voor-wie-wel-niet",
  "magnesium-en-stress",
  "magnesium-overgang-vrouwen",
];

const STATISCHE_PADEN = new Set([
  "/beste/magnesium",
  "/energie-na-40",
  "/herstel-verbeteren-na-40",
  "/intake",
  "/overgang",
  "/slaap-verbeteren-na-40",
  "/stress-verminderen-na-40",
  "/supplementen",
  "/voeding-na-40",
]);

const LINK_RE = /\[[^\]]+\]\((\/[^)]+)\)/g;

function internalLinks(text: string): string[] {
  return [...text.matchAll(LINK_RE)].map((m) => m[1]!);
}

function artikelTeksten(slug: string): string[] {
  const artikel = getArtikelBySlug(slug);
  if (!artikel) return [];
  const uit: string[] = [artikel.heroIntro];
  for (const sectie of artikel.secties) {
    if (sectie.tekst) uit.push(sectie.tekst);
    if (sectie.inleiding) uit.push(sectie.inleiding);
    if (sectie.items) uit.push(...sectie.items);
    if (sectie.callouts) uit.push(...sectie.callouts.map((c) => c.tekst));
  }
  return uit;
}

describe("magnesium-cluster", () => {
  const kennisbankSlugs = new Set(kennisbankTerms.map((t) => t.slug));
  const blogSlugs = new Set(alleArtikelen.map((a) => a.slug));

  it.each(MAGNESIUM_CLUSTER)("%s bestaat en is compleet", (slug) => {
    const artikel = getArtikelBySlug(slug);
    expect(artikel, `artikel ontbreekt: ${slug}`).toBeDefined();
    expect(artikel!.metaTitle!.length).toBeLessThanOrEqual(70);
    expect(artikel!.metaDescription!.length).toBeLessThanOrEqual(175);
    expect(artikel!.keywords!.length).toBeGreaterThanOrEqual(5);
    expect(artikel!.referenties.length).toBeGreaterThanOrEqual(5);
    expect(artikel!.kernpunten!.length).toBeGreaterThanOrEqual(3);
    expect(artikel!.laatstBijgewerktOp).toBeDefined();
  });

  it.each(MAGNESIUM_CLUSTER)("%s verwijst alleen naar bestaande paden", (slug) => {
    for (const link of artikelTeksten(slug).flatMap(internalLinks)) {
      if (link.startsWith("/blog/")) {
        expect(blogSlugs.has(link.slice("/blog/".length)), link).toBe(true);
      } else if (link.startsWith("/kennisbank/")) {
        expect(kennisbankSlugs.has(link.slice("/kennisbank/".length)), link).toBe(true);
      } else {
        expect(STATISCHE_PADEN.has(link), link).toBe(true);
      }
    }
  });

  it.each(MAGNESIUM_CLUSTER)("%s stuurt door naar de supplementengids", (slug) => {
    const artikel = getArtikelBySlug(slug)!;
    const paden = [
      ...artikelTeksten(slug).flatMap(internalLinks),
      artikel.vergelijkingExtraLink?.href ?? "",
    ];
    expect(paden).toContain("/supplementen");
  });

  it.each(MAGNESIUM_CLUSTER)("%s linkt naar minimaal twee andere pagina's", (slug) => {
    const uniek = new Set(artikelTeksten(slug).flatMap(internalLinks));
    expect(uniek.size).toBeGreaterThanOrEqual(2);
  });

  it("gerelateerde sluggen bestaan allemaal", () => {
    for (const slug of MAGNESIUM_CLUSTER) {
      for (const rel of getArtikelBySlug(slug)!.gerelateerdeSluggen) {
        expect(blogSlugs.has(rel), `${slug} → ${rel}`).toBe(true);
      }
    }
  });

  it("gebruikt geen markdown-opmaak die de renderer niet kent", () => {
    for (const slug of MAGNESIUM_CLUSTER) {
      for (const tekst of artikelTeksten(slug)) {
        expect(tekst, slug).not.toMatch(/\*\*/);
      }
    }
  });
});

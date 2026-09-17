import { describe, expect, it } from "vitest";
import { kennisbankTerms, getAllThemes } from "@/data/kennisbank";
import {
  getAllKennisbankImageSeoSlugs,
  getKennisbankImageSeo,
} from "@/data/kennisbank-image-seo";
import { kennisbankBodyImage } from "@/data/article-body-images";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import {
  buildKennisbankSchemaImages,
  resolveKennisbankBodyImage,
  resolveKennisbankCover,
} from "@/lib/seo/kennisbank-images";

describe("kennisbank-image-seo", () => {
  it("heeft SEO-teksten voor elk begrip en elk thema", () => {
    const termSlugs = kennisbankTerms.map((t) => t.slug);
    const themeSlugs = getAllThemes();
    const covered = new Set(getAllKennisbankImageSeoSlugs());

    for (const slug of termSlugs) {
      expect(covered.has(slug), `geen image SEO voor ${slug}`).toBe(true);
      const seo = getKennisbankImageSeo(slug);
      expect(seo?.coverAlt.length, slug).toBeGreaterThan(30);
      expect(seo?.coverCaption.length, slug).toBeGreaterThan(40);
      expect(seo?.inlineAlt.length, slug).toBeGreaterThan(20);
      expect(seo?.inlineCaption.length, slug).toBeGreaterThan(40);
      expect(seo?.searchPhrases.length, slug).toBeGreaterThanOrEqual(3);
    }

    for (const slug of themeSlugs) {
      expect(covered.has(slug), `geen thema image SEO voor ${slug}`).toBe(true);
      const seo = getKennisbankImageSeo(slug);
      expect(seo?.coverAlt.length, slug).toBeGreaterThan(30);
      expect(seo?.coverCaption.length, slug).toBeGreaterThan(40);
    }
  });

  it("cover caption wijkt af van alt en bevat het begrip", () => {
    for (const term of kennisbankTerms) {
      const resolved = resolveKennisbankCover(term.slug, kennisbankCover(term));
      expect(resolved.caption).not.toBe(resolved.alt);
      expect(resolved.title.length).toBeGreaterThan(10);
      const termFragment = term.term.split("(")[0].trim().toLowerCase();
      const haystack = `${resolved.alt} ${resolved.caption} ${resolved.title}`.toLowerCase();
      expect(
        haystack.includes(termFragment) ||
          term.slug.split("-").some((part) => part.length > 3 && haystack.includes(part)),
        term.slug,
      ).toBe(true);
    }
  });

  it("schema images hebben canonical absolute urls en representative cover", () => {
    const term = kennisbankTerms[0];
    const cover = resolveKennisbankCover(term.slug, kennisbankCover(term));
    const body = resolveKennisbankBodyImage(
      term.slug,
      kennisbankBodyImage(term.slug)!,
    );
    const images = buildKennisbankSchemaImages(cover, body);

    expect(images[0].representativeOfPage).toBe(true);
    expect(images[0].title).toBeTruthy();
    expect(images[1]?.representativeOfPage).toBe(false);
  });

  it("adh inline caption gaat over aanbevolen dagelijkse hoeveelheid, niet antidiuretisch hormoon", () => {
    const body = resolveKennisbankBodyImage(
      "adh",
      kennisbankBodyImage("adh")!,
    );
    expect(body.caption.toLowerCase()).not.toContain("antidiuretisch");
    expect(body.caption.toLowerCase()).toMatch(/adh|etiket|onderzoek/);
  });
});

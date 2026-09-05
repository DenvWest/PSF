import { describe, expect, it } from "vitest";
import { alleArtikelen } from "@/data/blog";
import { kennisbankTerms } from "@/data/kennisbank";
import {
  blogBodyImage,
  kennisbankBodyImage,
} from "@/data/article-body-images";
import sitemap from "@/app/sitemap";

describe("article body images", () => {
  it("elk blogartikel heeft een inline-beeld met alt en caption", () => {
    for (const artikel of alleArtikelen) {
      const image = blogBodyImage(artikel.slug);
      expect(image, `geen inline-beeld voor blog ${artikel.slug}`).toBeDefined();
      expect(image?.src).toBe(`/images/blog/inline/${artikel.slug}.jpg`);
      expect(image?.alt.length).toBeGreaterThan(20);
      expect(image?.caption.length).toBeGreaterThan(40);
    }
  });

  it("elk kennisbank-begrip heeft een inline-beeld met alt en caption", () => {
    for (const term of kennisbankTerms) {
      const image = kennisbankBodyImage(term.slug);
      expect(image, `geen inline-beeld voor kennisbank ${term.slug}`).toBeDefined();
      expect(image?.src).toBe(`/images/kennisbank/inline/${term.slug}.jpg`);
      expect(image?.alt.length).toBeGreaterThan(20);
      expect(image?.caption.length).toBeGreaterThan(40);
    }
  });
});

describe("sitemap article images", () => {
  it("blogartikelen en kennisbanktermen hebben cover plus inline in images", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    const sampleBlog = alleArtikelen.find((a) => !a.pad);
    expect(sampleBlog).toBeDefined();
    const blogEntry = byUrl.get(`https://perfectsupplement.nl/blog/${sampleBlog!.slug}`);
    expect(blogEntry?.images?.length).toBe(2);

    const sampleTerm = kennisbankTerms[0];
    const kbEntry = byUrl.get(`https://perfectsupplement.nl/kennisbank/${sampleTerm.slug}`);
    expect(kbEntry?.images?.length).toBe(2);
  });
});

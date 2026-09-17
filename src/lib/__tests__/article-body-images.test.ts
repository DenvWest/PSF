import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { alleArtikelen } from "@/data/blog";
import { kennisbankTerms } from "@/data/kennisbank";
import { blogBodyImage, kennisbankBodyImage } from "@/data/article-body-images";
import { blogCover } from "@/lib/blog-cover";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import sitemap from "@/app/sitemap";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

function fileMd5(src: string): string {
  return createHash("md5").update(readFileSync(publicPad(src))).digest("hex");
}

describe("article body images", () => {
  it("elk blogartikel heeft een inline-beeld met alt, caption en bestand", () => {
    for (const artikel of alleArtikelen) {
      const image = blogBodyImage(artikel.slug);
      expect(image, `geen inline-beeld voor blog ${artikel.slug}`).toBeDefined();
      if (!image) continue;
      expect(image.src).toMatch(
        new RegExp(`^/images/blog/inline/${artikel.slug}(-v\\d+)?\\.jpg$`),
      );
      expect(existsSync(publicPad(image.src)), `${artikel.slug} → ${image.src}`).toBe(
        true,
      );
      expect(image.alt.length, artikel.slug).toBeGreaterThan(20);
      expect(image.caption.length, artikel.slug).toBeGreaterThan(40);
    }
  });

  it("blogcovers en inline-beelden zijn uniek per artikel en verschillen per slug", () => {
    const coverByHash = new Map<string, string>();
    const inlineByHash = new Map<string, string>();

    for (const artikel of alleArtikelen) {
      const cover = blogCover(artikel);
      const body = blogBodyImage(artikel.slug);
      expect(body, artikel.slug).toBeDefined();
      if (!body) continue;

      const coverHash = fileMd5(cover.src);
      const bodyHash = fileMd5(body.src);
      expect(coverHash, `${artikel.slug} cover==inline`).not.toBe(bodyHash);

      const earlierCover = coverByHash.get(coverHash);
      expect(earlierCover, `${artikel.slug} deelt cover met ${earlierCover}`).toBeUndefined();
      coverByHash.set(coverHash, artikel.slug);

      const earlierInline = inlineByHash.get(bodyHash);
      expect(
        earlierInline,
        `${artikel.slug} deelt inline met ${earlierInline}`,
      ).toBeUndefined();
      inlineByHash.set(bodyHash, artikel.slug);
    }
  });

  it("elk kennisbank-begrip heeft cover en inline-beeld die bestaan", () => {
    for (const term of kennisbankTerms) {
      const cover = kennisbankCover(term);
      expect(existsSync(publicPad(cover.src)), `${term.slug} cover → ${cover.src}`).toBe(
        true,
      );

      const image = kennisbankBodyImage(term.slug);
      expect(image, `geen inline-beeld voor kennisbank ${term.slug}`).toBeDefined();
      if (!image) continue;
      expect(image.src).toMatch(
        new RegExp(`^/images/kennisbank/inline/${term.slug}(-v\\d+)?\\.jpg$`),
      );
      expect(existsSync(publicPad(image.src)), `${term.slug} → ${image.src}`).toBe(
        true,
      );
      expect(image.alt.length, term.slug).toBeGreaterThan(20);
      expect(image.caption.length, term.slug).toBeGreaterThan(40);
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

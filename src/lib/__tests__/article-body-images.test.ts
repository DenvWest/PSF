import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { alleArtikelen } from "@/data/blog";
import { kennisbankTerms } from "@/data/kennisbank";
import { blogBodyImage, kennisbankBodyImage } from "@/data/article-body-images";
import { blogCover } from "@/lib/blog-cover";
import { kennisbankCover } from "@/lib/kennisbank-cover";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("article body images", () => {
  it("elk blogartikel heeft een bestaande inline-foto", () => {
    for (const artikel of alleArtikelen) {
      const cover = blogCover(artikel);
      const image = blogBodyImage(artikel.slug, cover.alt, artikel.titel);
      expect(image, artikel.slug).toBeDefined();
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

  it("elk kennisbankartikel heeft cover en inline", () => {
    for (const term of kennisbankTerms) {
      const cover = kennisbankCover(term);
      expect(cover, term.slug).toBeDefined();
      if (!cover) continue;
      expect(existsSync(publicPad(cover.src)), `${term.slug} cover → ${cover.src}`).toBe(
        true,
      );

      const image = kennisbankBodyImage(term.slug, cover.alt, term.term);
      expect(image, term.slug).toBeDefined();
      if (!image) continue;
      expect(image.src).toMatch(
        new RegExp(`^/images/kennisbank/inline/${term.slug}(-v\\d+)?\\.jpg$`),
      );
      expect(existsSync(publicPad(image.src)), `${term.slug} → ${image.src}`).toBe(
        true,
      );
    }
  });
});

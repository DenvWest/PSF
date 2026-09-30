import { existsSync, readFileSync, readdirSync } from "node:fs";
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
  it("een inline-beeld is optioneel, maar bestaat en heeft alt en caption als het er is", () => {
    for (const artikel of alleArtikelen) {
      const image = blogBodyImage(artikel.slug);
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

  it("geen blog-inlinebestand staat los van een artikel", () => {
    const gebruikt = new Set(
      alleArtikelen.flatMap((a) => {
        const image = blogBodyImage(a.slug);
        return image ? [image.src.replace(/^.*\//, "")] : [];
      }),
    );
    const opSchijf = readdirSync(join(process.cwd(), "public/images/blog/inline")).filter(
      (f) => f.endsWith(".jpg"),
    );
    const pijlerPaginas = new Set(["overgang.jpg", "testosteron-na-40.jpg"]);
    for (const bestand of opSchijf) {
      if (pijlerPaginas.has(bestand)) continue;
      expect(gebruikt.has(bestand), `${bestand} wordt nergens gebruikt`).toBe(true);
    }
  });

  it("elk blogbeeld (cover en inline) is uniek in pixels en in alt-tekst", () => {
    const perHash = new Map<string, string>();
    const perAlt = new Map<string, string>();
    const registreer = (label: string, src: string, alt: string) => {
      const hash = fileMd5(src);
      expect(perHash.get(hash), `${label} deelt bestand met ${perHash.get(hash)}`).toBeUndefined();
      perHash.set(hash, label);
      expect(perAlt.get(alt), `${label} deelt alt met ${perAlt.get(alt)}`).toBeUndefined();
      perAlt.set(alt, label);
    };
    for (const artikel of alleArtikelen) {
      const cover = blogCover(artikel);
      registreer(`${artikel.slug} cover`, cover.src, cover.alt);
      const body = blogBodyImage(artikel.slug);
      if (body) registreer(`${artikel.slug} inline`, body.src, body.alt);
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

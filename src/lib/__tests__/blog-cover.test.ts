import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { alleArtikelen } from "@/data/blog";
import { BLOG_POSTS, getCoverImageSrc } from "@/data/blog-posts";
import {
  ALLE_CATEGORIE_COVERS,
  blogCover,
  categorieCover,
} from "@/lib/blog-cover";
import { getBlogLibraryItems } from "@/lib/library/blog-items";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("blog-cover", () => {
  it("elk categoriebeeld bestaat op schijf", () => {
    for (const cover of ALLE_CATEGORIE_COVERS) {
      expect(existsSync(publicPad(cover.src)), cover.src).toBe(true);
      expect(cover.alt.length).toBeGreaterThan(20);
    }
  });

  it("blogCover valt terug op het categoriebeeld zonder eigen cover", () => {
    const cover = blogCover({
      categorie: "supplementen",
    });
    expect(cover).toEqual(categorieCover("supplementen"));
  });

  it("elk bibliotheek-item heeft een bestaand coverbestand", () => {
    const items = getBlogLibraryItems();
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      expect(item.image, item.id).toBeDefined();
      const src = item.image?.src ?? "";
      expect(src.startsWith("/images/blog/"), `${item.id} src=${src}`).toBe(true);
      expect(existsSync(publicPad(src)), `${item.id} → ${src}`).toBe(true);
      expect(item.image?.alt.length, item.id).toBeGreaterThan(10);
    }
  });

  it("eigen coverImage van artikelen wijst naar een bestaand bestand", () => {
    for (const artikel of alleArtikelen) {
      const cover = blogCover(artikel);
      expect(existsSync(publicPad(cover.src)), `${artikel.slug} → ${cover.src}`).toBe(
        true,
      );
    }
  });

  it("legacy blog-posts covers bestaan", () => {
    for (const post of BLOG_POSTS) {
      const src = getCoverImageSrc(post);
      expect(existsSync(publicPad(src)), `${post.slug} → ${src}`).toBe(true);
    }
  });
});

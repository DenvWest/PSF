import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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

  it("elk artikel heeft een eigen cover, niet alleen de categorie-fallback", () => {
    const fallback = categorieCover("supplementen").src;
    const zonder = alleArtikelen.filter((artikel) => !artikel.coverImage);
    expect(zonder.map((artikel) => artikel.slug)).toEqual([]);

    for (const artikel of alleArtikelen) {
      const cover = blogCover(artikel);
      expect(cover.src, artikel.slug).not.toBe(fallback);
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

  it("kiest de nieuwste coverversie als die op schijf staat", () => {
    const cover = blogCover({
      categorie: "slaap",
      coverImage: "/images/blog/cortisol-en-slaap.jpg",
      coverImageAlt: "Rustige slaapkamer in avondlicht",
    });
    expect(cover.src).toBe("/images/blog/cortisol-en-slaap-v2.jpg");
    expect(existsSync(publicPad(cover.src))).toBe(true);
  });

  it("elke bibliotheekkaart heeft een visueel uniek coverbeeld", () => {
    const items = getBlogLibraryItems();
    const bySrc = new Map<string, string[]>();
    const byHash = new Map<string, string[]>();

    for (const item of items) {
      const src = item.image?.src ?? "";
      bySrc.set(src, [...(bySrc.get(src) ?? []), item.id]);
      const digest = createHash("sha256")
        .update(readFileSync(publicPad(src)))
        .digest("hex");
      byHash.set(digest, [...(byHash.get(digest) ?? []), item.id]);
    }

    const gedeeldPad = [...bySrc.entries()].filter(([, ids]) => ids.length > 1);
    expect(gedeeldPad, `zelfde pad: ${JSON.stringify(gedeeldPad)}`).toEqual([]);

    const gedeeldHash = [...byHash.entries()].filter(([, ids]) => ids.length > 1);
    expect(gedeeldHash, `zelfde bestand: ${JSON.stringify(gedeeldHash)}`).toEqual(
      [],
    );

    const python = `
from PIL import Image
import sys

def ahash(path, size=8):
    img = Image.open(path).convert("L").resize((size, size), Image.Resampling.BILINEAR)
    pixels = list(img.getdata())
    avg = sum(pixels) / len(pixels)
    return "".join("1" if p >= avg else "0" for p in pixels)

paths = [line.strip() for line in sys.stdin if line.strip()]
hashes = [(path, ahash(path)) for path in paths]
dupes = []
for i, (a_path, a_hash) in enumerate(hashes):
    for b_path, b_hash in hashes[i + 1:]:
        dist = sum(x != y for x, y in zip(a_hash, b_hash))
        if dist <= 1:
            dupes.append(f"d={dist} {a_path} <-> {b_path}")
print("\\n".join(dupes) if dupes else "OK")
`;

    const output = execFileSync("python3", ["-c", python], {
      encoding: "utf8",
      input: items.map((item) => publicPad(item.image?.src ?? "")).join("\n"),
    });
    expect(output.trim(), output).toBe("OK");
  });
});

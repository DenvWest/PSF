import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { kennisbankTerms } from "@/data/kennisbank";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import { getKennisbankLibraryItems } from "@/lib/library/kennisbank-items";

function publicPad(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("kennisbank-cover", () => {
  it("kiest -v2 boven het basisbestand", () => {
    const term = kennisbankTerms.find((item) => item.slug === "epa-dha");
    expect(term).toBeDefined();
    if (!term) return;
    const cover = kennisbankCover(term);
    expect(cover?.src).toBe("/images/kennisbank/epa-dha-v2.jpg");
  });

  it("elk bibliotheek-item heeft een bestaand coverbestand", () => {
    const items = getKennisbankLibraryItems();
    expect(items.length).toBe(kennisbankTerms.length);

    for (const item of items) {
      expect(item.image, item.id).toBeDefined();
      const src = item.image?.src ?? "";
      expect(src.startsWith("/images/kennisbank/"), `${item.id} src=${src}`).toBe(
        true,
      );
      expect(existsSync(publicPad(src)), `${item.id} → ${src}`).toBe(true);
    }
  });

  it("elk begrip heeft een eigen cover, geen gedeelde thema-fallback", () => {
    const seen = new Map<string, string>();
    for (const term of kennisbankTerms) {
      expect(term.coverImage, term.slug).toBeDefined();
      const cover = kennisbankCover(term);
      expect(cover.src).toBe(term.coverImage);
      expect(cover.src.includes("/thema-"), `${term.slug} valt terug op thema`).toBe(
        false,
      );
      const previous = seen.get(cover.src);
      expect(previous, `dubbele cover ${cover.src} (${previous} en ${term.slug})`).toBeUndefined();
      seen.set(cover.src, term.slug);
    }
  });
});

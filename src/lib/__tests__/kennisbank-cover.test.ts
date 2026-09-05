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
});

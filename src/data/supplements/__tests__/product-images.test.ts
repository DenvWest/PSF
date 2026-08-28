import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";

/**
 * Productafbeeldingen zijn een stille faalbron: een verkeerde hoofdletter of
 * een spatie in de bestandsnaam werkt lokaal en breekt op de server. Deze test
 * legt de conventie uit CLAUDE.md vast — exact match, alles in één map, geen
 * spaties — zodat hij niet opnieuw wegdrijft.
 */

const PRODUCTEN_DIR = join(process.cwd(), "public/images/producten");
const PRODUCTEN_PREFIX = "/images/producten/";

const ALLE_PRODUCTEN = [
  magnesiumData,
  omega3Data,
  vitamineDData,
  zinkData,
  creatineData,
  ashwagandhaData,
  eiwitpoederData,
].flatMap((data) =>
  data.products.map((product) => ({
    key: `${data.category}/${product.slug}`,
    imageSrc: product.imageSrc,
  })),
);

describe("productafbeeldingen", () => {
  it("heeft voor elk product een imageSrc", () => {
    const zonder = ALLE_PRODUCTEN.filter((p) => !p.imageSrc).map((p) => p.key);
    expect(zonder).toEqual([]);
  });

  it("verwijst uitsluitend naar public/images/producten/", () => {
    const buitenMap = ALLE_PRODUCTEN.filter(
      (p) => p.imageSrc && !p.imageSrc.startsWith(PRODUCTEN_PREFIX),
    ).map((p) => `${p.key} → ${p.imageSrc}`);
    expect(buitenMap).toEqual([]);
  });

  it("matcht exact met een bestaand bestand, hoofdlettergevoelig", () => {
    const opSchijf = new Set(readdirSync(PRODUCTEN_DIR));
    const mist = ALLE_PRODUCTEN.filter((p) => {
      if (!p.imageSrc) return false;
      const bestand = p.imageSrc.slice(PRODUCTEN_PREFIX.length);
      return !existsSync(join(PRODUCTEN_DIR, bestand)) || !opSchijf.has(bestand);
    }).map((p) => `${p.key} → ${p.imageSrc}`);
    expect(mist).toEqual([]);
  });

  it("gebruikt geen spaties in bestandsnamen", () => {
    const metSpatie = readdirSync(PRODUCTEN_DIR).filter((naam) =>
      naam.includes(" "),
    );
    expect(metSpatie).toEqual([]);
  });
});

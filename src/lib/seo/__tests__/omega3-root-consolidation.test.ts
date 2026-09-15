import { afterEach, describe, expect, it } from "vitest";
import { blogArtikelPad, blogArtikelPadRaw } from "@/lib/blog-artikel-pad";
import {
  OMEGA3_GUIDE_PATH,
  OMEGA3_ROOT_PATHS,
  isOmega3RootConsolidationEnabled,
  isOmega3RootPath,
  resolveOmega3RootHref,
  shouldIndexPath,
} from "@/lib/seo/omega3-root-consolidation";

function setFlag(value: "1" | null) {
  if (value === null) {
    delete process.env.NEXT_PUBLIC_OMEGA3_ROOT_301;
    return;
  }
  process.env.NEXT_PUBLIC_OMEGA3_ROOT_301 = value;
}

const watIsOmega3 = { slug: "wat-is-omega-3", pad: "/wat-is-omega-3" };
const gewoonArtikel = { slug: "magnesium-en-slaap" };

afterEach(() => {
  setFlag(null);
});

describe("omega-3 rootconsolidatie — uit (huidige stand)", () => {
  it("staat standaard uit", () => {
    setFlag(null);
    expect(isOmega3RootConsolidationEnabled()).toBe(false);
  });

  it("laat elke link en elke sitemap-regel ongemoeid", () => {
    setFlag(null);

    for (const path of OMEGA3_ROOT_PATHS) {
      expect(resolveOmega3RootHref(path)).toBe(path);
      expect(shouldIndexPath(path)).toBe(true);
    }
    expect(blogArtikelPad(watIsOmega3)).toBe("/wat-is-omega-3");
  });
});

describe("omega-3 rootconsolidatie — aan", () => {
  it("stuurt beide root-URL's naar de gids", () => {
    setFlag("1");

    for (const path of OMEGA3_ROOT_PATHS) {
      expect(isOmega3RootPath(path)).toBe(true);
      expect(resolveOmega3RootHref(path)).toBe(OMEGA3_GUIDE_PATH);
    }
  });

  it("houdt de twee pagina's uit de sitemap", () => {
    setFlag("1");

    for (const path of OMEGA3_ROOT_PATHS) {
      expect(shouldIndexPath(path)).toBe(false);
    }
    expect(shouldIndexPath("/beste/magnesium")).toBe(true);
  });

  it("laat interne links rechtstreeks naar de gids wijzen, niet via een 301", () => {
    setFlag("1");

    expect(blogArtikelPad(watIsOmega3)).toBe(OMEGA3_GUIDE_PATH);
    // Het ruwe pad blijft bestaan — daarmee filtert de sitemap, en daarmee is
    // terugdraaien één vlag.
    expect(blogArtikelPadRaw(watIsOmega3)).toBe("/wat-is-omega-3");
  });

  it("raakt andere artikelen niet", () => {
    setFlag("1");

    expect(resolveOmega3RootHref("/beste/omega-3-supplement")).toBe(
      "/beste/omega-3-supplement",
    );
    expect(blogArtikelPad(gewoonArtikel)).toBe("/blog/magnesium-en-slaap");
  });
});

import type { MetadataRoute } from "next";
import { PROFILE_SLUGS } from "@/data/profiles";
import { GUIDE_SLUGS } from "@/data/gids";
import { kennisbankTerms } from "@/data/kennisbank";
import { alleArtikelen } from "@/data/blog";
import { GELDIGE_CATEGORIE_IDS } from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import { getHubProductSlugs } from "@/lib/supplement-hub/product-catalog";
import { blogCover } from "@/lib/blog-cover";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import {
  articleBodyImageSrcs,
  blogBodyImage,
  kennisbankBodyImage,
} from "@/data/article-body-images";

const BASE = "https://perfectsupplement.nl";
const LAST_MOD = new Date("2026-05-01");
const PILLAR_LAST_MOD = new Date("2026-05-20");

const VERGELIJKINGS_PADEN = SUPPLEMENT_SLUGS.map((s) => `/beste/${s}`);

const PILLAR_PADEN = [
  "/slaap-verbeteren-na-40",
  "/stress-verminderen-na-40",
  "/energie-na-40",
  "/herstel-verbeteren-na-40",
  "/voeding-na-40",
  "/beweging-na-40",
  "/testosteron-na-40",
  "/overgang",
];

const STATISCHE_PADEN = [
  "/",
  "/intake",
  "/rapport",
  "/supplementen",
  "/gidsen",
  "/over-ons",
  "/contact",
  "/methodologie",
  "/ps-score",
];

type Entry = MetadataRoute.Sitemap[number];

function entries(
  paden: string[],
  priority: number,
  changeFrequency: Entry["changeFrequency"],
): Entry[] {
  return paden.map((pad) => ({
    url: `${BASE}${pad}`,
    lastModified: LAST_MOD,
    changeFrequency,
    priority,
  }));
}

function vergelijkingEntries(
  priority: number,
  changeFrequency: Entry["changeFrequency"],
): Entry[] {
  return SUPPLEMENT_SLUGS.map((slug) => {
    const data = getSupplementComparisonData(slug);
    return {
      url: `${BASE}/beste/${slug}`,
      lastModified: data ? new Date(data.lastUpdated) : LAST_MOD,
      changeFrequency,
      priority,
    };
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const vergelijking = vergelijkingEntries(0.9, "weekly");

  const profielen = entries(
    PROFILE_SLUGS.map((s) => `/profiel/${s}`),
    0.8,
    "monthly",
  );

  const pillars = PILLAR_PADEN.map((pad) => ({
    url: `${BASE}${pad}`,
    lastModified: PILLAR_LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const gids = entries(
    GUIDE_SLUGS.map((s) => `/gids/${s}`),
    0.8,
    "monthly",
  );

  const inzichten = entries(["/inzichten"], 0.8, "weekly");

  const kennisbankHub = entries(["/kennisbank"], 0.7, "monthly");
  const kennisbank = kennisbankTerms.map((term) => {
    const cover = kennisbankCover(term);
    const srcs = articleBodyImageSrcs(cover.src, kennisbankBodyImage(term.slug));
    return {
      url: `${BASE}/kennisbank/${term.slug}`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: srcs.map((src) => `${BASE}${src}`),
    };
  });

  const vergelijkingSet = new Set(VERGELIJKINGS_PADEN);
  const blogHub = entries(
    ["/blog", ...GELDIGE_CATEGORIE_IDS.map((c) => `/blog/${c}`)],
    0.7,
    "weekly",
  );
  const blog = alleArtikelen
    .filter((artikel) => !vergelijkingSet.has(blogArtikelPad(artikel)))
    .map((artikel) => {
      const cover = blogCover(artikel);
      const srcs = articleBodyImageSrcs(cover.src, blogBodyImage(artikel.slug));
      return {
        url: `${BASE}${blogArtikelPad(artikel)}`,
        lastModified: LAST_MOD,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: srcs.map((src) => `${BASE}${src}`),
      };
    });

  const producten = entries(
    getHubProductSlugs().map((slug) => `/product/${slug}`),
    0.8,
    "weekly",
  );

  const statisch = entries(STATISCHE_PADEN, 0.5, "yearly");

  return [
    ...vergelijking,
    ...pillars,
    ...profielen,
    ...gids,
    ...producten,
    ...inzichten,
    ...kennisbankHub,
    ...kennisbank,
    ...blogHub,
    ...blog,
    ...statisch,
  ];
}

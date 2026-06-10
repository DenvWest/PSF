import type { MetadataRoute } from "next";
import { PROFILE_SLUGS } from "@/data/profiles";
import { GUIDE_SLUGS } from "@/data/gids";
import { kennisbankTerms } from "@/data/kennisbank";
import { alleArtikelen } from "@/data/blog";
import { GELDIGE_CATEGORIE_IDS } from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { SUPPLEMENT_SLUGS } from "@/data/supplements";

const BASE = "https://perfectsupplement.nl";
const LAST_MOD = new Date("2026-05-01");
const PILLAR_LAST_MOD = new Date("2026-05-20");

const VERGELIJKINGS_PADEN = SUPPLEMENT_SLUGS.map((s) => `/beste/${s}`);

const PILLAR_PADEN = [
  "/slaap-verbeteren-na-40",
  "/stress-verminderen-man",
  "/energie-na-40",
  "/herstel-verbeteren-na-40",
  "/voeding-na-40",
  "/beweging-na-40",
  "/testosteron-na-40",
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

export default function sitemap(): MetadataRoute.Sitemap {
  const vergelijking = entries(VERGELIJKINGS_PADEN, 0.9, "weekly");

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

  const kennisbank = entries(
    ["/kennisbank", ...kennisbankTerms.map((t) => `/kennisbank/${t.slug}`)],
    0.7,
    "monthly",
  );

  const vergelijkingSet = new Set(VERGELIJKINGS_PADEN);
  const blogCanonicals = alleArtikelen
    .map((a) => blogArtikelPad(a))
    .filter((pad) => !vergelijkingSet.has(pad));

  const blog = entries(
    [
      "/blog",
      ...GELDIGE_CATEGORIE_IDS.map((c) => `/blog/${c}`),
      ...blogCanonicals,
    ],
    0.7,
    "weekly",
  );

  const statisch = entries(STATISCHE_PADEN, 0.5, "yearly");

  return [
    ...vergelijking,
    ...pillars,
    ...profielen,
    ...gids,
    ...kennisbank,
    ...blog,
    ...statisch,
  ];
}

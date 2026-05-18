import type { MetadataRoute } from "next";
import { PROFILE_SLUGS } from "@/data/profiles";
import { THEMA_SLUGS } from "@/data/thema";
import { kennisbankTerms } from "@/data/kennisbank";
import { alleArtikelen } from "@/data/blog";
import { GELDIGE_CATEGORIE_IDS } from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { SUPPLEMENT_SLUGS } from "@/data/supplements";

const BASE = "https://perfectsupplement.nl";
const LAST_MOD = new Date("2026-05-01");

const VERGELIJKINGS_PADEN = SUPPLEMENT_SLUGS.map((s) => `/beste/${s}`);

const STATISCHE_PADEN = [
  "/",
  "/intake",
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

  const themas = entries(
    THEMA_SLUGS.map((s) => `/thema/${s}`),
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
    ...profielen,
    ...themas,
    ...kennisbank,
    ...blog,
    ...statisch,
  ];
}

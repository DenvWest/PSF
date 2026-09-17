import type { MetadataRoute } from "next";
import { PROFILE_SLUGS } from "@/data/profiles";
import { GUIDE_SLUGS } from "@/data/gids";
import { kennisbankTerms } from "@/data/kennisbank";
import { alleArtikelen } from "@/data/blog";
import { GELDIGE_CATEGORIE_IDS } from "@/data/blog/categorieen";
import { blogArtikelPad, blogArtikelPadRaw } from "@/lib/blog-artikel-pad";
import { shouldIndexPath } from "@/lib/seo/omega3-root-consolidation";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import {
  ALL_SUPPLEMENT_SLUGS,
  getSupplementData,
} from "@/data/supplement-guides";
import { VOEDING_STOF_SLUGS } from "@/lib/voeding-public";
import { getHubProductSlugs } from "@/lib/supplement-hub/product-catalog";
import { blogCover } from "@/lib/blog-cover";
import { kennisbankCover } from "@/lib/kennisbank-cover";
import { NUTRIENT_PAGE_SLUGS } from "@/data/nutrition/nutrient-pages";
import { STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM } from "@/lib/redactie-standaarden";
import {
  articleBodyImageSrcs,
  blogBodyImage,
  kennisbankBodyImage,
} from "@/data/article-body-images";

/**
 * De sitemap, als lijst van secties in plaats van een handmatig samengestelde
 * return.
 *
 * ## Waarom secties en geen platte array
 *
 * De vorige vorm bouwde losse lijsten op en voegde ze onderaan met de hand
 * samen. Daardoor kon een hele pagina-soort ontbreken zonder dat iets faalde:
 * de acht supplementgidsen (`/supplementen/*`) stonden er maandenlang niet in
 * — de complete educatieve laag tussen artikel en vergelijking, alleen
 * bereikbaar via interne links.
 *
 * `SITEMAP_SECTIONS` is daarom een `Record` over een gesloten union. Een nieuwe
 * pagina-soort toevoegen aan `SitemapSectionId` zonder hem te vullen is een
 * typefout, geen stille omissie.
 *
 * ## Waarom `lastModified` soms ontbreekt
 *
 * Elke entry droeg eerst dezelfde constante (`2026-05-01`). Een sitemap waarin
 * 115 URL's op dezelfde dag zijn gewijzigd is geen signaal maar ruis, en Google
 * negeert een lastmod die hij niet vertrouwt. De regel is nu:
 *
 * - is er een échte datum in de data → gebruik die;
 * - is die er niet → laat `lastModified` weg.
 *
 * Weglaten is eerlijker dan een verzonnen datum, en het maakt de secties die
 * wél een datum dragen weer een bruikbaar signaal.
 *
 * Voor blog en kennisbank is dat `laatstBijgewerktOp ?? STANDAARD_INHOUD_...`
 * — exact de datum die de pagina zelf onderaan toont. Sitemap en pagina spreken
 * elkaar zo niet tegen.
 */

const BASE = "https://perfectsupplement.nl";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Routes die bewust NIET in de sitemap staan, met de reden erbij.
 *
 * Deze lijst is het verschil tussen "vergeten" en "besloten". Staat een
 * indexeerbare route hier niet in en ook niet in een sectie, dan is dat een
 * gat — zie `src/app/__tests__/sitemap.test.ts`.
 */
export const SITEMAP_EXCLUDED: ReadonlyArray<{
  pad: string;
  reden: string;
}> = [
  {
    pad: "/rapport",
    reden: "Persoonlijk rapport; staat in robots.disallow.",
  },
  {
    pad: "/dashboard",
    reden: "Achter login; geen zoekwaarde.",
  },
  {
    pad: "/account",
    reden: "Achter login.",
  },
  {
    pad: "/intake/voeding",
    reden:
      "Check-instrument, geen landingspagina. Wordt vanaf fase 4 vanuit content aangeboden.",
  },
  {
    pad: "/intake/slaap",
    reden: "Check-instrument, geen landingspagina.",
  },
  {
    pad: "/intake/stress",
    reden: "Check-instrument, geen landingspagina.",
  },
  {
    pad: "/intake/beweging",
    reden: "Check-instrument, geen landingspagina.",
  },
  {
    pad: "/gidsen/[slug]",
    reden:
      "Duplicate intent met /gids/[thema] op zes thema's — beslissing staat open " +
      "(ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md fase 9, wacht op Search Console).",
  },
  {
    pad: "/intake/plan/[domain]",
    reden: "Persoonlijk plan uit de check; geen zoekwaarde en geen stabiele inhoud.",
  },
];

function paths(
  paden: readonly string[],
  priority: number,
  changeFrequency: Entry["changeFrequency"],
): Entry[] {
  return paden.map((pad) => ({
    url: `${BASE}${pad}`,
    changeFrequency,
    priority,
  }));
}

/** De datum die de pagina zelf onderaan toont — sitemap en pagina blijven gelijk. */
function reviewDate(laatstBijgewerktOp: string | undefined): Date {
  return new Date(laatstBijgewerktOp ?? STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM);
}

const PILLAR_PADEN = [
  "/slaap-verbeteren-na-40",
  "/stress-verminderen-na-40",
  "/energie-na-40",
  "/herstel-verbeteren-na-40",
  "/voeding-na-40",
  "/voedingstekort",
  "/beweging-na-40",
  "/testosteron-na-40",
  "/overgang",
] as const;

/** Hubs en vaste pagina's zonder eigen wijzigingsdatum. */
const HUB_PADEN = [
  "/",
  "/intake",
  "/supplementen",
  "/voeding",
  "/gidsen",
  "/over-ons",
  "/contact",
  "/methodologie",
  "/ps-score",
  "/profiel",
] as const;

/**
 * Informatieve pagina's die geen blog, gids of vergelijking zijn.
 *
 * Drie root-pagina's staan hier bewust NIET, hoewel ze erop lijken:
 * supplement-kiezen, wat-is-omega-3 en waar-let-je-op-bij-omega-3 dragen een
 * eigen `pad` in `cornerstone-supplementen.ts` en komen dus al uit de
 * blog-sectie. Ze hier herhalen leverde een dubbele URL op.
 */
const INFORMATIEVE_PADEN = [
  "/faqs",
  "/onderbouwing",
  "/onderbouwing/voeding",
  "/hoe-werkt-dashboard",
] as const;

/**
 * Juridisch en transparantie. Lage prioriteit, maar wél indexeerbaar: het zijn
 * E-E-A-T-signalen, en de affiliate-disclosure hoort vindbaar te zijn.
 */
const JURIDISCHE_PADEN = [
  "/privacy",
  "/cookies",
  "/disclaimer",
  "/medische-disclaimer",
  "/juridisch",
  "/affiliate-disclosure",
] as const;

type SitemapSectionId =
  | "vergelijkingen"
  | "supplementgidsen"
  | "pillars"
  | "profielen"
  | "gezondheidsgidsen"
  | "voedingsstoffen"
  | "voedingRoute"
  | "producten"
  | "inzichten"
  | "kennisbank"
  | "blog"
  | "hubs"
  | "informatief"
  | "juridisch";

/**
 * Elke pagina-soort precies één keer. Het `Record` over de gesloten union is
 * de vangrail: een nieuwe `SitemapSectionId` zonder implementatie compileert niet.
 */
const SITEMAP_SECTIONS: Record<SitemapSectionId, () => Entry[]> = {
  vergelijkingen: () =>
    SUPPLEMENT_SLUGS.map((slug) => {
      const data = getSupplementComparisonData(slug);
      return {
        url: `${BASE}/beste/${slug}`,
        ...(data ? { lastModified: new Date(data.lastUpdated) } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      };
    }),

  // De laag die eerder volledig ontbrak.
  supplementgidsen: () =>
    ALL_SUPPLEMENT_SLUGS.map((slug) => {
      const data = getSupplementData(slug);
      return {
        url: `${BASE}/supplementen/${slug}`,
        lastModified: new Date(data.dateModified ?? data.datePublished),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    }),

  pillars: () => paths(PILLAR_PADEN, 0.85, "monthly"),

  // Het scharnier tussen artikel, voeding, check en supplement.
  voedingsstoffen: () =>
    paths(
      [
        "/voedingsstoffen",
        ...NUTRIENT_PAGE_SLUGS.map((slug) => `/voedingsstoffen/${slug}`),
      ],
      0.8,
      "monthly",
    ),

  profielen: () =>
    paths(
      PROFILE_SLUGS.map((s) => `/profiel/${s}`),
      0.8,
      "monthly",
    ),

  gezondheidsgidsen: () =>
    paths(
      GUIDE_SLUGS.map((s) => `/gids/${s}`),
      0.8,
      "monthly",
    ),

  voedingRoute: () =>
    paths(
      VOEDING_STOF_SLUGS.map((slug) => `/voeding/${slug}`),
      0.75,
      "monthly",
    ),

  producten: () =>
    paths(
      getHubProductSlugs().map((slug) => `/product/${slug}`),
      0.8,
      "weekly",
    ),

  inzichten: () => paths(["/inzichten"], 0.8, "weekly"),

  kennisbank: () => [
    ...paths(["/kennisbank"], 0.7, "monthly"),
    ...kennisbankTerms.map((term) => {
      const cover = kennisbankCover(term);
      const srcs = articleBodyImageSrcs(
        cover.src,
        kennisbankBodyImage(term.slug),
      );
      return {
        url: `${BASE}/kennisbank/${term.slug}`,
        lastModified: reviewDate(term.laatstBijgewerktOp),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        images: srcs.map((src) => `${BASE}${src}`),
      };
    }),
  ],

  blog: () => {
    // Zeven cornerstone-"artikelen" dragen een `pad` naar /beste/*; die staan al
    // in de vergelijkingen-sectie en mogen hier niet nog een keer.
    const vergelijkingSet = new Set(
      SUPPLEMENT_SLUGS.map((s) => `/beste/${s}`),
    );
    return [
      ...paths(
        ["/blog", ...GELDIGE_CATEGORIE_IDS.map((c) => `/blog/${c}`)],
        0.7,
        "weekly",
      ),
      ...alleArtikelen
        .filter((artikel) => !vergelijkingSet.has(blogArtikelPad(artikel)))
        .filter((artikel) => shouldIndexPath(blogArtikelPadRaw(artikel)))
        .map((artikel) => {
          const cover = blogCover(artikel);
          const srcs = articleBodyImageSrcs(
            cover.src,
            blogBodyImage(artikel.slug),
          );
          return {
            url: `${BASE}${blogArtikelPad(artikel)}`,
            lastModified: reviewDate(artikel.laatstBijgewerktOp),
            changeFrequency: "weekly" as const,
            priority: 0.7,
            images: srcs.map((src) => `${BASE}${src}`),
          };
        }),
    ];
  },

  hubs: () => paths(HUB_PADEN, 0.5, "weekly"),

  informatief: () => paths(INFORMATIEVE_PADEN, 0.6, "monthly"),

  juridisch: () => paths(JURIDISCHE_PADEN, 0.3, "yearly"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(SITEMAP_SECTIONS).flatMap((build) => build());
}

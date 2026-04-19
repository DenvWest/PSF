import type { Metadata } from "next";

export type BlogCategoryKey = "omega-3" | "magnesium" | "default";

export type BlogPost = {
  title: string;
  /** URL path segment without slashes, e.g. wat-is-omega-3 */
  slug: string;
  excerpt: string;
  category: string;
  /** ISO 8601 date (used for sorting, Open Graph, structured data) */
  publishedAt: string;
  /** Human-readable, e.g. "8 min" */
  readingTime: string;
  /** Path under /public, e.g. /images/blog/omega-3-basics.jpg */
  coverImage: string;
  coverImageAlt: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords: string[];
  categoryKey: BlogCategoryKey;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "supplement-kiezen-waar-op-letten",
    title: "Supplement kiezen: waar op letten?",
    excerpt:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie — zonder marketingpraat.",
    category: "Keuzehulp",
    publishedAt: "2026-03-01",
    readingTime: "14 min",
    coverImageAlt:
      "Illustratie bij artikel over supplementen kiezen: aandacht voor etiket, dosering en kwaliteit.",
    seoTitle:
      "Supplement kiezen: waar op letten? Dosering, vorm en transparantie",
    metaDescription:
      "Hoe beoordeel je supplementen? Uitleg over dosering, opneembare vorm, zuiverheid en transparantie op het etiket — inhoudelijk, zonder marketingclaims.",
    keywords: [
      "supplement kiezen",
      "supplement beoordelen",
      "kwaliteit supplementen",
      "dosering supplement",
      "transparantie etiket",
    ],
    categoryKey: "default",
    coverImage: "/images/blog/supplement-kiezen.jpg",
  },
  {
    slug: "wat-is-omega-3",
    title: "Wat is omega-3?",
    excerpt:
      "Een introductie op de rol van omega-3 vetzuren in het lichaam en waarom de bron ertoe doet.",
    category: "Ingrediënten",
    publishedAt: "2025-03-15",
    readingTime: "8 min",
    coverImageAlt:
      "Ondersteunende afbeelding bij uitleg over omega-3 vetzuren EPA en DHA in supplementen.",
    seoTitle: "Wat is omega-3? EPA, DHA en supplementen inhoudelijk uitgelegd",
    metaDescription:
      "Wat is omega-3? Informatie over EPA en DHA, het verschil tussen bronnen en waarom samenstelling bij supplementen belangrijk is voor vergelijken.",
    keywords: [
      "wat is omega 3",
      "EPA DHA uitleg",
      "omega-3 vetzuren",
      "omega-3 supplement vergelijken",
    ],
    categoryKey: "omega-3",
    coverImage: "/images/blog/omega-3-basics.jpg",
  },
  {
    slug: "waar-let-je-op-bij-omega-3",
    title: "Waar let je op bij omega-3?",
    excerpt:
      "Kwaliteit, dosering en zuiverheid — wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    category: "Ingrediënten",
    publishedAt: "2025-03-10",
    readingTime: "12 min",
    coverImageAlt:
      "Visueel bij artikel over omega-3 kiezen: vergelijken op samenstelling, dosering en prijs per dag.",
    seoTitle:
      "Omega-3 supplement kiezen: waar let je op bij EPA, DHA en prijs?",
    metaDescription:
      "Omega-3 supplement kiezen: waar let je op bij EPA en DHA, dagdosering, prijs per dag en kwaliteit? Praktische criteria om producten eerlijk te vergelijken.",
    keywords: [
      "omega-3 supplement kiezen",
      "EPA DHA dosering",
      "omega-3 vergelijken",
      "prijs per dag omega-3",
    ],
    categoryKey: "omega-3",
    coverImage: "/images/blog/omega-3-criteria.jpg",
  },
  {
    slug: "omega-3-vergelijken",
    title: "Omega-3 vergelijken",
    excerpt:
      "Populaire omega-3 supplementen naast elkaar op EPA/DHA-gehalte, prijs per dag en kwaliteitsindicatoren.",
    category: "Vergelijking",
    publishedAt: "2026-04-19",
    readingTime: "12 min",
    coverImageAlt:
      "Afbeelding bij vergelijking van omega-3 supplementen op EPA/DHA, prijs per dag en transparantie.",
    seoTitle:
      "Omega-3 supplementen vergelijken op EPA/DHA en prijs per dag",
    metaDescription:
      "Omega-3 supplementen vergelijken op EPA/DHA, prijs per dag en transparantie. Overzicht om producten inhoudelijk naast elkaar te zetten — zonder marketingruis.",
    keywords: [
      "omega-3 vergelijken",
      "EPA DHA vergelijking",
      "omega-3 supplementen overzicht",
      "prijs per dag visolie",
    ],
    categoryKey: "omega-3",
    coverImage: "/images/blog/omega-3-vergelijken.jpg",
  },
  {
    slug: "beste-omega-3-supplement",
    title: "Beste omega-3 supplement",
    excerpt:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    category: "Keuzehulp",
    publishedAt: "2025-02-01",
    readingTime: "15 min",
    coverImageAlt:
      "Afbeelding bij keuzehulp voor omega-3 supplementen op basis van inhoud, gebruiksgemak en prijs per dag.",
    seoTitle:
      "Beste omega-3 supplement kiezen: criteria op inhoud en prijs per dag",
    metaDescription:
      "Beste omega-3 supplement: keuzehulp op basis van EPA/DHA, gebruiksgemak en prijs per dag. Geen ranking-hype, wel concrete criteria voor jouw situatie.",
    keywords: [
      "beste omega-3 supplement",
      "omega-3 keuzehulp",
      "EPA DHA vergelijken",
      "omega-3 prijs per dag",
    ],
    categoryKey: "omega-3",
    coverImage: "/images/blog/omega-3-beste-keuze.jpg",
  },
  {
    slug: "magnesium-vergelijken",
    title: "Magnesium vergelijken",
    excerpt:
      "Vormen, doseringen en toepassingen — van magnesiumcitraat tot bisglycinaat.",
    category: "Vergelijking",
    publishedAt: "2025-01-15",
    readingTime: "9 min",
    coverImageAlt:
      "Afbeelding bij vergelijking van magnesiumvormen en elementaire dosering per portie.",
    seoTitle:
      "Magnesium supplementen vergelijken: vormen en elementaire dosering",
    metaDescription:
      "Magnesium supplementen vergelijken op vorm (bijv. citraat, bisglycinaat), elementaire dosering en toepassing. Helder overzicht om bewust te kiezen.",
    keywords: [
      "magnesium vergelijken",
      "magnesium vormen",
      "elementair magnesium",
      "magnesium citraat bisglycinaat",
    ],
    categoryKey: "magnesium",
    coverImage: "/images/blog/magnesium-vergelijken.jpg",
  },
  {
    slug: "beste-magnesium",
    title: "Beste magnesium supplement",
    excerpt:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    category: "Keuzehulp",
    publishedAt: "2025-01-10",
    readingTime: "13 min",
    coverImageAlt:
      "Afbeelding bij keuzehulp magnesium: vergelijken van vormen, dosering en praktisch gebruik.",
    seoTitle:
      "Beste magnesium supplement kiezen: vormen en gebruik vergeleken",
    metaDescription:
      "Beste magnesium supplement kiezen: vergelijk vormen zoals bisglycinaat en citraat op elementair magnesium, gebruik en prijs per dag — inhoudelijk toegelicht.",
    keywords: [
      "beste magnesium supplement",
      "magnesium vergelijken",
      "magnesium bisglycinaat citraat",
      "elementair magnesium kiezen",
    ],
    categoryKey: "magnesium",
    coverImage: "/images/blog/magnesium-beste-keuze.jpg",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/**
 * Public URL path for `next/image` (must be under `/public`, e.g. `/images/blog/x.jpg`).
 * Strips accidental `public/` prefixes; never use `/public/images/...` in data.
 */
export function getCoverImageSrc(post: BlogPost): string {
  const raw = (post.coverImage ?? "").trim();
  if (!raw) return "";

  let p = raw.replace(/\\/g, "/");
  if (p.startsWith("/public/")) p = p.slice("/public".length);
  else if (p.startsWith("public/")) p = `/${p.slice("public/".length)}`;
  if (!p.startsWith("/")) p = `/${p}`;

  return p;
}

export function formatPublishedLabel(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

function absoluteUrl(path: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return undefined;
  try {
    return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
  } catch {
    return undefined;
  }
}

/** Next.js metadata for article routes; uses title template from root layout. */
export function buildArticlePageMetadata(slug: string): Metadata {
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.seoTitle?.trim() || post.title;
  const description = post.metaDescription?.trim() || post.excerpt;
  const cover = getCoverImageSrc(post);
  const canonicalPath = `/${post.slug}`;
  const ogImage = absoluteUrl(cover) ?? cover;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt,
      images: [
        {
          url: ogImage,
          alt: post.coverImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

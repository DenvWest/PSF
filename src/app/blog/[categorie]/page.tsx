import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogArticlePage from "@/components/blog/BlogArticlePage";
import BlogCategoriePageContent from "@/components/blog/BlogCategoriePageContent";
import {
  alleArtikelen,
  getArtikelBySlug,
  getGerelateerdeArtikelen,
} from "@/data/blog";
import { getBlogLibraryItems } from "@/lib/library/blog-items";
import {
  AUDIENCE_PARAM,
  resolveContentAudience,
} from "@/lib/content-audience";
import {
  CATEGORIE_CONFIG,
  GELDIGE_CATEGORIE_IDS,
  isGeldigeCategorie,
} from "@/data/blog/categorieen";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { blogCover } from "@/lib/blog-cover";
import { absoluteUrl } from "@/lib/public-site-url";
import { BLOG_HUB_LABEL } from "@/components/blog/blog-layout";

interface Props {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const categorieParams = GELDIGE_CATEGORIE_IDS.map((c) => ({ categorie: c }));
  const artikelParams = alleArtikelen.map((a) => ({ categorie: a.slug }));
  return [...categorieParams, ...artikelParams];
}

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { categorie } = await params;

  if (isGeldigeCategorie(categorie)) {
    const config = CATEGORIE_CONFIG[categorie];
    return {
      title: config.metaTitle,
      description: config.metaDescription,
      alternates: { canonical: absoluteUrl(`/blog/${categorie}`) },
    };
  }

  const artikel = getArtikelBySlug(categorie);
  if (!artikel) return {};

  const title = artikel.metaTitle ?? artikel.titel;
  const description = artikel.metaDescription ?? artikel.heroIntro;

  const cover = blogCover(artikel);
  const coverUrl = absoluteUrl(cover.src);

  return {
    title,
    description,
    keywords: artikel.keywords,
    alternates: { canonical: absoluteUrl(blogArtikelPad(artikel)) },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: artikel.gepubliceerdOp,
      images: [{ url: coverUrl, alt: cover.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverUrl],
    },
  };
}

export default async function BlogCategoriePage({
  params,
  searchParams,
}: Props) {
  const { categorie } = await params;
  const query = await searchParams;
  const audience = resolveContentAudience(
    typeof query[AUDIENCE_PARAM] === "string" ? query[AUDIENCE_PARAM] : undefined,
  );

  // /blog/stress, /blog/slaap, /blog/energie, /blog/supplementen
  if (isGeldigeCategorie(categorie)) {
    const config = CATEGORIE_CONFIG[categorie];
    const items = getBlogLibraryItems();

    const categoryUrl = `https://perfectsupplement.nl/blog/${categorie}`;

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: "https://perfectsupplement.nl",
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: BLOG_HUB_LABEL,
                      item: "https://perfectsupplement.nl/blog",
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: config.naam,
                      item: categoryUrl,
                    },
                  ],
                },
                {
                  "@type": "CollectionPage",
                  name: `${config.naam} — ${BLOG_HUB_LABEL}`,
                  description: config.metaDescription,
                  url: categoryUrl,
                  isPartOf: {
                    "@type": "WebSite",
                    name: "PerfectSupplement",
                    url: "https://perfectsupplement.nl",
                  },
                },
              ],
            }),
          }}
        />
        <BlogCategoriePageContent
          config={config}
          items={items}
          audience={audience}
        />
      </>
    );
  }

  // /blog/cortisol-verlagen-natuurlijk etc.
  const artikel = getArtikelBySlug(categorie);
  if (!artikel) notFound();

  const gerelateerde = getGerelateerdeArtikelen(artikel);
  return <BlogArticlePage artikel={artikel} gerelateerde={gerelateerde} />;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogArticlePage from "@/components/blog/BlogArticlePage";
import BlogCategoriePageContent from "@/components/blog/BlogCategoriePageContent";
import {
  alleArtikelen,
  getArtikelBySlug,
  getArtikelenByCategorie,
  getGerelateerdeArtikelen,
} from "@/data/blog";
import {
  CATEGORIE_CONFIG,
  GELDIGE_CATEGORIE_IDS,
  isGeldigeCategorie,
} from "@/data/blog/categorieen";
import type { BlogCategorie } from "@/types/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const artikelParams = alleArtikelen.map((a) => ({ slug: a.slug }));
  const categorieParams = GELDIGE_CATEGORIE_IDS.map((c) => ({ slug: c }));
  return [...categorieParams, ...artikelParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (isGeldigeCategorie(slug)) {
    const config = CATEGORIE_CONFIG[slug];
    return {
      title: config.metaTitle,
      description: config.metaDescription,
      alternates: { canonical: `/blog/${slug}` },
    };
  }

  const artikel = getArtikelBySlug(slug);
  if (!artikel) return {};

  const title = artikel.metaTitle ?? artikel.titel;
  const description = artikel.metaDescription ?? artikel.heroIntro;

  return {
    title,
    description,
    keywords: artikel.keywords,
    alternates: { canonical: `/blog/${artikel.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: artikel.gepubliceerdOp,
    },
  };
}

function telAantalPerCategorie(): Record<BlogCategorie, number> {
  return GELDIGE_CATEGORIE_IDS.reduce(
    (acc, cat) => {
      acc[cat] = alleArtikelen.filter((a) => a.categorie === cat).length;
      return acc;
    },
    {} as Record<BlogCategorie, number>,
  );
}

export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params;

  // Categorie-pagina: /blog/stress, /blog/slaap, /blog/energie, /blog/supplementen
  if (isGeldigeCategorie(slug)) {
    const config = CATEGORIE_CONFIG[slug];
    const artikelen = getArtikelenByCategorie(slug);
    const aantalPerCategorie = telAantalPerCategorie();

    return (
      <BlogCategoriePageContent
        config={config}
        artikelen={artikelen}
        aantalPerCategorie={aantalPerCategorie}
      />
    );
  }

  // Artikel-pagina: /blog/cortisol-verlagen-natuurlijk etc.
  const artikel = getArtikelBySlug(slug);
  if (!artikel) notFound();

  const gerelateerde = getGerelateerdeArtikelen(artikel);
  return <BlogArticlePage artikel={artikel} gerelateerde={gerelateerde} />;
}

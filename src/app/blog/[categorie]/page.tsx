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
import { blogArtikelPad } from "@/lib/blog-artikel-pad";

interface Props {
  params: Promise<{ categorie: string }>;
}

export async function generateStaticParams() {
  const categorieParams = GELDIGE_CATEGORIE_IDS.map((c) => ({ categorie: c }));
  const artikelParams = alleArtikelen.map((a) => ({ categorie: a.slug }));
  return [...categorieParams, ...artikelParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;

  if (isGeldigeCategorie(categorie)) {
    const config = CATEGORIE_CONFIG[categorie];
    return {
      title: config.metaTitle,
      description: config.metaDescription,
      alternates: { canonical: `/blog/${categorie}` },
    };
  }

  const artikel = getArtikelBySlug(categorie);
  if (!artikel) return {};

  const title = artikel.metaTitle ?? artikel.titel;
  const description = artikel.metaDescription ?? artikel.heroIntro;

  return {
    title,
    description,
    keywords: artikel.keywords,
    alternates: { canonical: blogArtikelPad(artikel) },
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

export default async function BlogCategoriePage({ params }: Props) {
  const { categorie } = await params;

  // /blog/stress, /blog/slaap, /blog/energie, /blog/supplementen
  if (isGeldigeCategorie(categorie)) {
    const config = CATEGORIE_CONFIG[categorie];
    const artikelen = getArtikelenByCategorie(categorie);
    const aantalPerCategorie = telAantalPerCategorie();

    return (
      <BlogCategoriePageContent
        config={config}
        artikelen={artikelen}
        aantalPerCategorie={aantalPerCategorie}
      />
    );
  }

  // /blog/cortisol-verlagen-natuurlijk etc.
  const artikel = getArtikelBySlug(categorie);
  if (!artikel) notFound();

  const gerelateerde = getGerelateerdeArtikelen(artikel);
  return <BlogArticlePage artikel={artikel} gerelateerde={gerelateerde} />;
}

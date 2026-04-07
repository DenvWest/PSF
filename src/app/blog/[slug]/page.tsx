import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogArticlePage from "@/components/blog/BlogArticlePage";
import {
  alleArtikelen,
  getArtikelBySlug,
  getGerelateerdeArtikelen,
} from "@/data/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return alleArtikelen.map((artikel) => ({ slug: artikel.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artikel = getArtikelBySlug(slug);
  if (!artikel) return {};

  const title = artikel.metaTitle ?? artikel.titel;
  const description = artikel.metaDescription ?? artikel.heroIntro;

  return {
    title,
    description,
    keywords: artikel.keywords,
    alternates: {
      canonical: `/blog/${artikel.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: artikel.gepubliceerdOp,
    },
  };
}

export default async function BlogArtikelPage({ params }: Props) {
  const { slug } = await params;
  const artikel = getArtikelBySlug(slug);

  if (!artikel) notFound();

  const gerelateerde = getGerelateerdeArtikelen(artikel);

  return <BlogArticlePage artikel={artikel} gerelateerde={gerelateerde} />;
}

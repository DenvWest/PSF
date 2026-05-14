import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupplementData, ALL_SUPPLEMENT_SLUGS } from "@/data/supplement-guides";
import type { SupplementSlug } from "@/types/supplement-guide";
import SupplementPage from "@/components/supplement-guides/SupplementPage";

type Props = { params: Promise<{ supplement: string }> };

export function generateStaticParams() {
  return ALL_SUPPLEMENT_SLUGS.map((slug) => ({ supplement: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { supplement } = await params;
  if (!ALL_SUPPLEMENT_SLUGS.includes(supplement as SupplementSlug)) {
    return {};
  }
  const data = getSupplementData(supplement as SupplementSlug);
  const ogUrl = `https://perfectsupplement.nl/supplementen/${supplement}`;
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `/supplementen/${supplement}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: "article",
      url: ogUrl,
    },
  };
}

export default async function Page({ params }: Props) {
  const { supplement } = await params;
  if (!ALL_SUPPLEMENT_SLUGS.includes(supplement as SupplementSlug)) {
    notFound();
  }
  const data = getSupplementData(supplement as SupplementSlug);
  return <SupplementPage data={data} />;
}

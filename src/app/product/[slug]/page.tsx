import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ProductDetail from "@/components/supplement-hub/ProductDetail";
import {
  buildProductSamenvatting,
  getCategoryPeers,
  getHubProductBySlug,
  getHubProductSlugs,
  formatScore,
} from "@/lib/supplement-hub/product-catalog";
import { absoluteUrl } from "@/lib/public-site-url";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getHubProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getHubProductBySlug(slug);
  if (!product) {
    return {};
  }

  const title = `${product.volledigeNaam} — PS-Score ${formatScore(product.score.total)}`;
  const description = `${product.doseringLabel ?? "Dosering niet op etiket"}, ${product.vormLabel.toLowerCase()}. Onafhankelijk beoordeeld op dosering, vorm, etiket en toetsing — met de EU-claimvoorwaarde en de prijs per claim-conforme dag.`;
  const url = absoluteUrl(product.href);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.volledigeNaam} — PS-Score ${formatScore(product.score.total)}`,
      description,
      type: "article",
      url,
      images: product.imageSrc
        ? [{ url: absoluteUrl(product.imageSrc), alt: product.imageAlt }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getHubProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const peers = getCategoryPeers(product);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://perfectsupplement.nl" },
    { name: "Supplementen", url: "/supplementen" },
    { name: product.categoryLabel, url: product.guideHref },
    { name: product.volledigeNaam, url: product.href },
  ]);

  /**
   * Product-schema zonder `offers`: we tonen op deze pagina geen prijs van een
   * specifieke verkoper, alleen onze eigen kosten-per-dag-berekening. Een
   * offers-blok zou een aanbieding suggereren die hier niet staat.
   */
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.volledigeNaam,
    brand: { "@type": "Brand", name: product.brand },
    category: product.categoryLabel,
    description: buildProductSamenvatting(product),
    ...(product.imageSrc ? { image: absoluteUrl(product.imageSrc) } : {}),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "PS-Score",
        value: product.score.total,
        maxValue: 100,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, productSchema]),
        }}
      />

      <main className="bg-[#FDFCFA] pb-20">
        <Container className="pt-10 md:pt-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Supplementen", href: "/supplementen" },
              { label: product.categoryLabel, href: product.guideHref },
              { label: product.name },
            ]}
          />
          <div className="mt-10">
            <ProductDetail product={product} peers={peers} />
          </div>
        </Container>
      </main>
    </>
  );
}

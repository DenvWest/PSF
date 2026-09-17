import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import PublicFoodSourcesBlock from "@/components/nutrition/PublicFoodSourcesBlock";
import {
  getPublicNutrientPage,
  isVoedingStofSlug,
  VOEDING_STOF_SLUGS,
} from "@/lib/voeding-public";
import { buildArticleSchema } from "@/lib/seo/structuredData";

type Props = { params: Promise<{ stof: string }> };

export function generateStaticParams() {
  return VOEDING_STOF_SLUGS.map((stof) => ({ stof }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stof } = await params;
  if (!isVoedingStofSlug(stof)) return {};
  const page = getPublicNutrientPage(stof);
  const path = `/voeding/${stof}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    ...canonicalMetadata(path),
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: path,
      type: "article",
    },
  };
}

export default async function VoedingStofPage({ params }: Props) {
  const { stof } = await params;
  if (!isVoedingStofSlug(stof)) notFound();

  const page = getPublicNutrientPage(stof);
  const path = `/voeding/${stof}` as const;

  const articleSchema = buildArticleSchema({
    headline: page.metaTitle,
    description: page.metaDescription,
    path,
    datePublished: "2026-09-15",
  });

  const siblingLinks = VOEDING_STOF_SLUGS.filter((slug) => slug !== stof).map((slug) => ({
    slug,
    page: getPublicNutrientPage(slug),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="pb-16 md:pb-20 py-12 md:py-16">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/voeding" className="hover:text-stone-800">Voeding</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-stone-800">{page.label}</li>
            </ol>
          </nav>

          <header className="mt-6 max-w-3xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
              {page.label} uit voeding
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{page.intro}</p>
          </header>

          <div className="mt-10 max-w-4xl">
            <PublicFoodSourcesBlock page={page} />
          </div>

          <section className="mt-12 max-w-3xl" aria-label="Gerelateerde stoffen">
            <h2 className="font-display text-xl font-semibold text-stone-900">
              Andere stoffen
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {siblingLinks.map(({ slug, page: sibling }) => (
                <li key={slug}>
                  <Link
                    href={`/voeding/${slug}`}
                    className="inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-ps-green/35 hover:text-ps-green"
                  >
                    {sibling.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <MedicalDisclaimer className="mt-10 max-w-3xl" />
        </Container>
      </main>
    </>
  );
}

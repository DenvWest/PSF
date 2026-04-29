import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { PROFILE_PAGES, PROFILE_SLUGS } from "@/data/profiles";
import type { ProfilePageData, StepCareLayer, SupplementSuggestion } from "@/types/profile-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROFILE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = PROFILE_PAGES[slug];
  if (!profile) return {};

  return {
    title: profile.seo.title,
    description: profile.seo.description,
    alternates: { canonical: profile.seo.canonical },
    openGraph: {
      title: profile.seo.title,
      description: profile.seo.description,
      url: profile.seo.canonical,
    },
  };
}

export default async function ProfielPage({ params }: Props) {
  const { slug } = await params;
  const profile: ProfilePageData | undefined = PROFILE_PAGES[slug];

  if (!profile) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: profile.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `https://perfectsupplement.nl${crumb.href}`,
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: profile.hero.headline,
    description: profile.seo.description,
    url: profile.seo.canonical,
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: "https://perfectsupplement.nl",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main>
        <Container>
          <article>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="pt-6 pb-2">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
                {profile.breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center gap-1">
                    {index < profile.breadcrumbs.length - 1 ? (
                      <>
                        <Link href={crumb.href} className="hover:text-slate-600 transition-colors">
                          {crumb.name}
                        </Link>
                        <span aria-hidden="true">/</span>
                      </>
                    ) : (
                      <span className="text-slate-600">{crumb.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-12">
              <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl text-slate-900 leading-tight">
                {profile.hero.headline}
              </h1>
              <p className="mt-4 text-xl text-slate-600 max-w-2xl leading-relaxed">
                {profile.hero.subline}
              </p>
            </section>

            {/* Herkenning */}
            <section id="herkenning" className="py-12">
              <h2 className="font-[var(--font-heading)] text-2xl text-slate-900">
                {profile.recognition.intro}
              </h2>
              <div className="mt-6 space-y-4">
                {profile.recognition.points.map((point, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-6">
                    <p className="text-slate-700">{point.situation}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-slate-600 font-medium">{profile.recognition.closer}</p>
            </section>

            {/* Begrip */}
            <section id="wat-er-gebeurt" className="py-12">
              <h2 className="font-[var(--font-heading)] text-2xl text-slate-900">
                {profile.understanding.title}
              </h2>
              <div className="mt-6 space-y-4">
                {profile.understanding.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-slate-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Step-care */}
            <section id="wat-je-kunt-doen" className="py-12">
              {profile.stepCare.map((layer: StepCareLayer) => (
                <div key={layer.id} className="mb-12">
                  <h2 className="font-[var(--font-heading)] text-2xl text-slate-900">
                    {layer.title}
                  </h2>
                  <p className="text-slate-500 mt-1">{layer.subtitle}</p>
                  <div className="space-y-4 mt-6">
                    {layer.items.map((item, index) => (
                      <div key={index} className="bg-slate-50 rounded-xl p-6">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                        <p className="text-emerald-700 font-medium mt-3 text-sm">
                          → {item.actionable}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Supplementen */}
            <section id="supplementen" className="py-12">
              <h2 className="font-[var(--font-heading)] text-2xl text-slate-900">
                Supplementen die dit profiel ondersteunen
              </h2>
              <p className="text-slate-500 mt-2">
                Supplementen zijn geen vervanging voor leefstijlaanpassingen — ze versterken het
                effect als de basis op orde is.
              </p>
              <div className="mt-6 space-y-4">
                {profile.supplements.map((supp: SupplementSuggestion, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900">{supp.name}</h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">{supp.why_this_profile}</p>
                    <p className="text-slate-400 text-xs mt-2 italic">{supp.efsa_claim}</p>
                    {supp.hasComparison ? (
                      <Link
                        href={supp.href}
                        className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        rel="nofollow sponsored"
                        target="_blank"
                      >
                        Bekijk vergelijking →
                      </Link>
                    ) : (
                      <Link
                        href={supp.href}
                        className="inline-block mt-4 text-slate-500 hover:text-slate-700 underline text-sm transition-colors"
                      >
                        Meer informatie →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Leefstijlcheck CTA */}
            <section className="py-16 text-center">
              <div className="bg-slate-50 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
                <h2 className="font-[var(--font-heading)] text-2xl text-slate-900">
                  {profile.guidanceCta.title}
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed">{profile.guidanceCta.text}</p>
                <Link
                  href="/intake"
                  className="inline-block mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                >
                  Doe de gratis Leefstijlcheck
                </Link>
              </div>
            </section>

            {/* Gerelateerde content */}
            {(profile.relatedPillar || profile.relatedComparisons.length > 0) && (
              <section className="py-12 border-t border-slate-200">
                <h2 className="font-[var(--font-heading)] text-xl text-slate-900 mb-6">
                  Verder lezen
                </h2>

                {profile.relatedPillar && (
                  <div className="mb-4">
                    <p className="text-slate-600 text-sm">{profile.relatedPillar.turboSnippet}</p>
                    <Link
                      href={profile.relatedPillar.href}
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Lees meer →
                    </Link>
                  </div>
                )}

                {profile.relatedComparisons.map((item, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-slate-600 text-sm">{item.turboSnippet}</p>
                    <Link
                      href={item.href}
                      className="text-emerald-600 hover:underline font-medium"
                    >
                      Bekijk de vergelijking →
                    </Link>
                  </div>
                ))}
              </section>
            )}

            {/* Disclaimer */}
            <aside className="py-8 text-xs text-slate-400">
              <p>
                PerfectSupplement geeft informatie en suggesties, geen medische diagnoses of
                behandelingen. Bij aanhoudende klachten: raadpleeg je huisarts. Supplementen zijn
                geen vervanging voor een gevarieerd voedingspatroon en een gezonde leefstijl.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}

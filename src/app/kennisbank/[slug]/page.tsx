import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Container from '@/components/layout/Container'
import {
  kennisbankTerms,
  getTermBySlug,
  themeLabels,
} from '@/data/kennisbank'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return kennisbankTerms.map((term) => ({ slug: term.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const term = getTermBySlug(slug)
  if (!term) return {}

  return {
    title: `${term.metaTitle} | PerfectSupplement`,
    description: term.metaDescription,
    alternates: {
      canonical: `https://perfectsupplement.nl/kennisbank/${term.slug}`,
    },
    openGraph: {
      title: `${term.metaTitle} | PerfectSupplement`,
      description: term.metaDescription,
    },
  }
}

const comparisonLabels: Record<string, string> = {
  '/beste-magnesium': 'Beste magnesium supplement',
  '/beste-omega-3-supplement': 'Beste omega-3 supplement',
  '/beste-ashwagandha': 'Beste ashwagandha supplement',
  '/beste-vitamine-d': 'Beste vitamine D supplement',
  '/beste-creatine': 'Beste creatine supplement',
  '/beste-zink': 'Beste zink supplement',
}

function renderParagraphs(text: string) {
  return text
    .split('\n\n')
    .filter((p) => p.trim().length > 0)
    .map((paragraph, i) => (
      <p key={i} className="mt-4 text-[1.0625rem] leading-[1.75] text-stone-600 first:mt-0">
        {paragraph.trim()}
      </p>
    ))
}

export default async function KennisbankTermPage({ params }: Props) {
  const { slug } = await params
  const term = getTermBySlug(slug)
  if (!term) notFound()

  const relatedTerms = term.relatedSlugs
    .map((s) => getTermBySlug(s))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.shortDefinition,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'PerfectSupplement Kennisbank',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://perfectsupplement.nl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kennisbank',
        item: 'https://perfectsupplement.nl/kennisbank',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: term.term,
        item: `https://perfectsupplement.nl/kennisbank/${term.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main>
        <Container>
          <div className="py-10 md:py-16">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-10">
              <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-stone-400">
                <li>
                  <Link href="/" className="transition hover:text-stone-600">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="select-none">›</li>
                <li>
                  <Link href="/kennisbank" className="transition hover:text-stone-600">
                    Kennisbank
                  </Link>
                </li>
                <li aria-hidden className="select-none">›</li>
                <li className="font-medium text-stone-600">{term.term}</li>
              </ol>
            </nav>

            <div className="mx-auto max-w-3xl">
              <article>
                <header className="mb-10">
                  <span className="inline-block rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500">
                    {themeLabels[term.theme].title}
                  </span>
                  <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-stone-900 md:text-[3rem]">
                    {term.term}
                  </h1>
                  <p className="mt-4 text-lg leading-relaxed text-stone-500">
                    {term.shortDefinition}
                  </p>
                </header>

                <section id="wat-is-het" className="mb-10">
                  <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
                    Wat is {term.term}?
                  </h2>
                  {renderParagraphs(term.content.whatIsIt)}
                </section>

                <section id="hoe-werkt-het" className="mb-10">
                  <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
                    Hoe werkt het?
                  </h2>
                  {renderParagraphs(term.content.howItWorks)}
                </section>

                <section id="waarom-het-matteert" className="mb-10">
                  <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
                    Waarom het matteert voor jouw keuze
                  </h2>
                  {renderParagraphs(term.content.whyItMatters)}
                </section>

                {term.relatedComparisons.length > 0 && (
                  <section className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
                      Gerelateerde vergelijkingen
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {term.relatedComparisons.map((href) => (
                        <Link
                          key={href}
                          href={href}
                          className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm font-medium text-stone-800 transition hover:border-stone-300 hover:shadow-sm"
                        >
                          <span>{comparisonLabels[href] ?? href}</span>
                          <span
                            className="text-stone-400 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          >
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {relatedTerms.length > 0 && (
                  <section className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold tracking-tight text-stone-900">
                      Gerelateerde begrippen
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {relatedTerms.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/kennisbank/${related.slug}`}
                          className="group flex flex-col rounded-xl border border-stone-200 bg-white px-5 py-4 transition hover:border-stone-300 hover:shadow-sm"
                        >
                          <span className="text-sm font-medium text-stone-900">{related.term}</span>
                          <span className="mt-1 text-xs text-stone-500">
                            {related.shortDefinition}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* CTA */}
                <section className="rounded-2xl bg-stone-50 px-6 py-8 text-center">
                  <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                    Wil je weten wat bij jou past?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk resultaat.
                  </p>
                  <Link
                    href="/intake"
                    className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                  >
                    Doe de Leefstijlcheck →
                  </Link>
                </section>

                <footer className="mt-10 border-t border-stone-100 pt-6">
                  <p className="text-xs leading-relaxed text-stone-400">
                    Disclaimer: Deze informatie is informatief bedoeld en vervangt geen medisch
                    advies. Raadpleeg een arts bij gezondheidsklachten.
                  </p>
                </footer>
              </article>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}

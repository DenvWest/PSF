import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Container from '@/components/layout/Container'
import {
  kennisbankTerms,
  getTermBySlug,
  themeLabels,
  getAllThemes,
} from '@/data/kennisbank'
import type { KennisbankTheme } from '@/data/kennisbank'
import ArticleReferentiesFooter from '@/components/content/ArticleReferentiesFooter'
import ArticleBodyReadingChrome from '@/components/content/ArticleBodyReadingChrome'
import ReadingLayoutDesktopGutters from '@/components/content/ReadingLayoutDesktopGutters'
import { renderInlineMarkdownLinks } from '@/components/blog/inlineMarkdownLinks'
import { buildKennisbankTocItems } from '@/lib/article-toc'
import { buildDefinedTermSchema } from '@/lib/seo/structuredData'
import { READING_ROW_GAP_CLASS } from '@/lib/article-reading-columns'
import {
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
} from '@/lib/redactie-standaarden'
import KennisbankThemaPageContent from '@/components/kennisbank/KennisbankThemaPageContent'
import { KB_HUB_LABEL } from '@/components/kennisbank/kennisbank-layout'

interface Props {
  params: Promise<{ slug: string }>
}

const comparisonLabels: Record<string, string> = {
  '/beste/magnesium': 'Beste magnesium supplement',
  '/beste/omega-3-supplement': 'Beste omega-3 supplement',
  '/beste/ashwagandha': 'Beste ashwagandha supplement',
  '/beste/vitamine-d': 'Beste vitamine D supplement',
  '/beste/creatine': 'Beste creatine supplement',
  '/beste/zink': 'Beste zink supplement',
}

function isValidTheme(value: string): value is KennisbankTheme {
  return Object.keys(themeLabels).includes(value)
}

const KB_H2_CLASS =
  'scroll-mt-[var(--reading-scroll-margin)] font-display text-[clamp(1.2rem,2.2vw,1.42rem)] font-semibold leading-snug tracking-tight text-stone-900 md:text-[1.5rem]'

const KB_SECTION_CLASS = 'border-b border-stone-200/55 py-14 md:py-[4rem]'

const KB_LINK_CLASS =
  'font-medium text-emerald-800 underline decoration-emerald-700/35 underline-offset-[3px] transition hover:decoration-emerald-800'

function renderParagraphs(text: string) {
  const blocks = text
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return (
    <div className="max-w-[72ch] space-y-5 md:space-y-6">
      {blocks.map((paragraph, i) => (
        <p key={i} className="text-[1.0625rem] leading-[1.82] tracking-[0.003em] text-stone-600">
          {renderInlineMarkdownLinks(paragraph, { linkClassName: KB_LINK_CLASS })}
        </p>
      ))}
    </div>
  )
}

export function generateStaticParams() {
  const themeParams = getAllThemes().map((theme) => ({ slug: theme }))
  const termParams = kennisbankTerms.map((term) => ({ slug: term.slug }))
  return [...themeParams, ...termParams]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (isValidTheme(slug)) {
    const config = themeLabels[slug]
    return {
      title: `${config.title} — Kennisbank | PerfectSupplement`,
      description: config.description,
      alternates: {
        canonical: `https://perfectsupplement.nl/kennisbank/${slug}`,
      },
    }
  }

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

export default async function KennisbankSlugPage({ params }: Props) {
  const { slug } = await params

  if (isValidTheme(slug)) {
    return <ThemaPage theme={slug} />
  }

  const term = getTermBySlug(slug)
  if (!term) notFound()

  return <TermPage slug={slug} />
}

// ── THEMA-DETAILPAGINA ──────────────────────────────────────────────────────

function ThemaPage({ theme }: { theme: KennisbankTheme }) {
  const config = themeLabels[theme]
  const themeUrl = `https://perfectsupplement.nl/kennisbank/${theme}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://perfectsupplement.nl' },
                  { '@type': 'ListItem', position: 2, name: KB_HUB_LABEL, item: 'https://perfectsupplement.nl/kennisbank' },
                  { '@type': 'ListItem', position: 3, name: config.title, item: themeUrl },
                ],
              },
              {
                '@type': 'CollectionPage',
                name: `${config.title} — ${KB_HUB_LABEL}`,
                description: config.description,
                url: themeUrl,
                isPartOf: {
                  '@type': 'WebSite',
                  name: 'PerfectSupplement',
                  url: 'https://perfectsupplement.nl',
                },
              },
            ],
          }),
        }}
      />
      <KennisbankThemaPageContent theme={theme} />
    </>
  )
}

// ── TERM-DETAILPAGINA ───────────────────────────────────────────────────────

function TermPage({ slug }: { slug: string }) {
  const term = getTermBySlug(slug)
  if (!term) notFound()

  const relatedTerms = term.relatedSlugs
    .map((s) => getTermBySlug(s))
    .filter((t): t is NonNullable<typeof t> => t !== undefined)

  const tocItems = buildKennisbankTocItems(term)
  const laatstDatum = term.laatstBijgewerktOp ?? STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM
  const verantwoordelijke = term.inhoudelijkeVerantwoordelijke ?? REDACTIE_VERANTWOORDELIJKE_STANDARD

  const definedTermSchema = buildDefinedTermSchema({
    term: term.term,
    description: term.shortDefinition,
    slug: term.slug,
  })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://perfectsupplement.nl' },
      { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://perfectsupplement.nl/kennisbank' },
      { '@type': 'ListItem', position: 3, name: themeLabels[term.theme].title, item: `https://perfectsupplement.nl/kennisbank/${term.theme}` },
      { '@type': 'ListItem', position: 4, name: term.term, item: `https://perfectsupplement.nl/kennisbank/${term.slug}` },
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
            <article>
              <div
                className={`mb-12 flex min-w-0 flex-col md:mb-[4rem] lg:flex-row lg:items-start ${READING_ROW_GAP_CLASS}`}
              >
              <ReadingLayoutDesktopGutters />
              <div className="w-full min-w-0 max-w-[72ch] mx-auto lg:mx-0">
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
                    <li>
                      <Link href={`/kennisbank/${term.theme}`} className="transition hover:text-stone-600">
                        {themeLabels[term.theme].title}
                      </Link>
                    </li>
                    <li aria-hidden className="select-none">›</li>
                    <li className="font-medium text-stone-600">{term.term}</li>
                  </ol>
                </nav>

                <header>
                  <span className="inline-flex rounded-full border border-stone-200/95 bg-white/95 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.05em] text-stone-500">
                    {themeLabels[term.theme].title}
                  </span>
                  <h1 className="mt-6 font-display text-[clamp(2rem,4vw,2.85rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-stone-900">
                    {term.term} — wat je moet weten
                  </h1>
                  <p className="mt-6 text-[1.0625rem] leading-[1.82] text-stone-600 md:text-[1.125rem]">
                    {term.shortDefinition}
                  </p>
                </header>
              </div>
            </div>

            <ArticleBodyReadingChrome tocItems={tocItems} hideTocBelowItemCount={2}>
                <section className={KB_SECTION_CLASS} aria-labelledby="wat-is-het">
                  <h2 id="wat-is-het" className={`${KB_H2_CLASS} mb-6 md:mb-7`} tabIndex={-1}>
                    Wat is {term.term}?
                  </h2>
                  {renderParagraphs(term.content.whatIsIt)}
                </section>

                <section className={KB_SECTION_CLASS} aria-labelledby="hoe-werkt-het">
                  <h2 id="hoe-werkt-het" className={`${KB_H2_CLASS} mb-6 md:mb-7`} tabIndex={-1}>
                    Hoe werkt het?
                  </h2>
                  {renderParagraphs(term.content.howItWorks)}
                </section>

                <section className={KB_SECTION_CLASS} aria-labelledby="waarom-dit-ertoe-doet">
                  <h2 id="waarom-dit-ertoe-doet" className={`${KB_H2_CLASS} mb-6 md:mb-7`} tabIndex={-1}>
                    Waarom dit ertoe doet voor jouw keuze
                  </h2>
                  {renderParagraphs(term.content.whyItMatters)}
                </section>

                {term.domeinMetBeperktCausaalBewijs ? (
                  <aside
                    className="mb-6 max-w-[72ch] rounded-lg border border-stone-200/90 bg-stone-50/80 px-4 py-3.5 text-[0.875rem] leading-relaxed text-stone-600 md:mb-8"
                    role="note"
                  >
                    <strong className="font-semibold text-stone-800">Let op bij interpretatie:</strong> voor dit onderwerp
                    is het causale interventiebewijs vaak beperkt, heterogeen of nog in ontwikkeling. De tekst beschrijft
                    mechanismen en associaties uit de literatuur; dat is niet hetzelfde als een persoonlijke aanbeveling
                    of een zorgpad.
                  </aside>
                ) : null}

                <div className="mt-4 md:mt-6">
                  <ArticleReferentiesFooter
                    referenties={term.referenties}
                    laatstBijgewerktOp={laatstDatum}
                    wetenschappelijkGecontroleerdOp={laatstDatum}
                    verantwoordelijke={verantwoordelijke}
                  />
                </div>
              </ArticleBodyReadingChrome>

              {term.relatedComparisons.length > 0 ? (
                <section aria-labelledby="kb-vergelijkingen" className="mx-auto mt-20 max-w-[min(var(--reading-layout-max-width),100%)] md:mt-[5.25rem]">
                  <h2 id="kb-vergelijkingen" className="font-display text-[1.0625rem] font-semibold text-stone-900 md:text-lg">
                    Gerelateerde vergelijkingen
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-[72ch]">
                    {term.relatedComparisons.map((href) => (
                      <Link
                        key={href}
                        href={href}
                        className="group flex items-center justify-between rounded-lg border border-stone-200/95 bg-white px-5 py-4 text-[0.875rem] font-medium text-stone-800 transition-colors hover:border-stone-300 hover:bg-stone-50/75"
                      >
                        <span>{comparisonLabels[href] ?? href}</span>
                        <span className="text-stone-400 transition-colors group-hover:text-stone-500" aria-hidden>
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {relatedTerms.length > 0 ? (
                <section aria-labelledby="kb-begrippen" className="mx-auto mt-16 max-w-[min(var(--reading-layout-max-width),100%)] md:mt-20">
                  <h2 id="kb-begrippen" className="font-display text-[1.0625rem] font-semibold text-stone-900 md:text-lg">
                    Gerelateerde begrippen
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-[72ch]">
                    {relatedTerms.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/kennisbank/${related.slug}`}
                        className="group flex flex-col rounded-lg border border-stone-200/95 bg-white px-5 py-4 transition-colors hover:border-stone-300 hover:bg-stone-50/80"
                      >
                        <span className="text-[0.875rem] font-medium text-stone-900">{related.term}</span>
                        <span className="mt-1.5 text-[0.8125rem] leading-snug text-stone-500">{related.shortDefinition}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              <section
                className="mx-auto mt-20 max-w-[min(38rem,100%)] border border-stone-200/90 bg-white px-7 py-10 text-center md:mt-24 md:px-10 md:py-12"
                aria-label="Leefstijlcheck"
              >
                <h2 className="font-display text-[1.375rem] font-semibold leading-snug text-stone-900 md:text-2xl">
                  Leefstijl en supplementen structureren
                </h2>
                <p className="mx-auto mt-4 max-w-[36ch] text-[0.9375rem] leading-[1.75] text-stone-600">
                  De Leefstijlcheck is een korte vragenlijst. Het overzicht helpt bij het ordenen van aandachtspunten —
                  géén medische test en geen vervanging voor zorg.
                </p>
                <Link
                  href="/intake"
                  className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-stone-800/90 bg-stone-900 px-7 text-[0.875rem] font-medium text-white transition hover:bg-stone-800"
                >
                  Start de Leefstijlcheck
                </Link>
              </section>
            </article>
          </div>
        </Container>
      </main>
    </>
  )
}

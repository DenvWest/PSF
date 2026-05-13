import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Container from '@/components/layout/Container'
import {
  kennisbankTerms,
  getTermBySlug,
  themeLabels,
  getTermsByTheme,
  getAllThemes,
} from '@/data/kennisbank'
import type { KennisbankTheme } from '@/data/kennisbank'
import ArticleReferentiesFooter from '@/components/content/ArticleReferentiesFooter'
import ArticleBodyReadingChrome from '@/components/content/ArticleBodyReadingChrome'
import ReadingLayoutDesktopGutters from '@/components/content/ReadingLayoutDesktopGutters'
import { buildKennisbankTocItems } from '@/lib/article-toc'
import { READING_ROW_GAP_CLASS } from '@/lib/article-reading-columns'
import {
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
} from '@/lib/redactie-standaarden'

interface Props {
  params: Promise<{ slug: string }>
}

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const THEME_BADGE_STYLES: Record<KennisbankTheme, string> = {
  'lichaam-veroudering': 'bg-rose-50 text-rose-700 ring-rose-200/50',
  'leefstijl-herstel': 'bg-emerald-50 text-emerald-700 ring-emerald-200/50',
  supplementwetenschap: 'bg-sky-50 text-sky-700 ring-sky-200/50',
  longevity: 'bg-amber-50 text-amber-700 ring-amber-200/50',
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

function renderParagraphs(text: string) {
  const blocks = text
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return (
    <div className="max-w-[72ch] space-y-5 md:space-y-6">
      {blocks.map((paragraph, i) => (
        <p key={i} className="text-[1.0625rem] leading-[1.82] tracking-[0.003em] text-stone-600">
          {paragraph}
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
  const terms = getTermsByTheme(theme)
  const badgeStyle = THEME_BADGE_STYLES[theme]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://perfectsupplement.nl' },
              { '@type': 'ListItem', position: 2, name: 'Kennisbank', item: 'https://perfectsupplement.nl/kennisbank' },
              { '@type': 'ListItem', position: 3, name: config.title },
            ],
          }),
        }}
      />

      {/* ── DONKERE HERO ───────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br pb-12 pt-12 md:pt-20 ${config.colorClasses.bg}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden
          style={{ backgroundImage: NOISE_SVG }}
        />
        <Container>
          <nav aria-label="Breadcrumb" className="relative mb-10 md:mb-14">
            <ol className="flex items-center gap-2 text-[0.8125rem] text-white/50">
              <li>
                <Link href="/" className="transition hover:text-white/80">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">›</li>
              <li>
                <Link href="/kennisbank" className="transition hover:text-white/80">
                  Kennisbank
                </Link>
              </li>
              <li aria-hidden className="select-none">›</li>
              <li className="font-medium text-white/90">{config.title}</li>
            </ol>
          </nav>
          <div className="relative max-w-2xl">
            <span className="text-2xl" aria-hidden>
              {config.icon}
            </span>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white md:text-[3rem]">
              {config.title}
            </h1>
            <p className={`mt-4 text-[1.0625rem] leading-[1.75] ${config.colorClasses.tekst}`}>
              {config.description}
            </p>
          </div>
        </Container>
      </section>

      {/* ── THEMA-TABS ─────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white">
        <Container>
          <div className="flex flex-wrap gap-1 py-4" role="tablist" aria-label="Thema's">
            {getAllThemes().map((t) => {
              const tConfig = themeLabels[t]
              const tTerms = getTermsByTheme(t)
              const isActive = t === theme
              return (
                <Link
                  key={t}
                  href={`/kennisbank/${t}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                  }`}
                >
                  <span aria-hidden>{tConfig.icon}</span>
                  <span>{tConfig.title}</span>
                  <span className={`text-xs ${isActive ? 'text-white/60' : 'text-stone-400'}`}>
                    {tTerms.length}
                  </span>
                </Link>
              )
            })}
          </div>
        </Container>
      </div>

      {/* ── TERM-KAARTEN ───────────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <Container>
          {terms.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {terms.map((term) => (
                <Link
                  key={term.slug}
                  href={`/kennisbank/${term.slug}`}
                  className="group flex min-h-0 flex-col rounded-2xl border border-stone-200/60 bg-white p-7 transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                >
                  <span
                    className={`inline-flex self-start items-center rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider ring-1 ring-inset ${badgeStyle}`}
                  >
                    {config.title}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-stone-900 md:text-xl">
                    {term.term}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
                    {term.shortDefinition}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.15em] text-stone-800">
                    <span>Lees meer</span>
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              Nog geen begrippen in dit thema. Binnenkort beschikbaar.
            </p>
          )}
        </Container>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <Container>
        <section className="mb-16 mt-4 rounded-2xl bg-stone-50 px-6 py-10 text-center">
          <p className="text-xl font-semibold text-stone-900">Wil je weten waar jij staat?</p>
          <p className="mt-2 text-sm text-stone-500">
            12 vragen, 3 minuten — direct een persoonlijk herstelplan.
          </p>
          <Link
            href="/intake"
            className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            Start de Leefstijlcheck →
          </Link>
        </section>
      </Container>
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

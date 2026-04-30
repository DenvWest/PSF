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
  '/beste-magnesium': 'Beste magnesium supplement',
  '/beste-omega-3-supplement': 'Beste omega-3 supplement',
  '/beste-ashwagandha': 'Beste ashwagandha supplement',
  '/beste-vitamine-d': 'Beste vitamine D supplement',
  '/beste-creatine': 'Beste creatine supplement',
  '/beste-zink': 'Beste zink supplement',
}

function isValidTheme(value: string): value is KennisbankTheme {
  return Object.keys(themeLabels).includes(value)
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

            <div className="max-w-[680px]">
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

                <section className="rounded-2xl bg-stone-50 px-6 py-8">
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

import Link from 'next/link'
import type { Metadata } from 'next'
import Container from '@/components/layout/Container'
import {
  themeLabels,
  getAllThemes,
  getTermsByTheme,
} from '@/data/kennisbank'

export const metadata: Metadata = {
  title: 'Kennisbank — Begrippen en Concepten | PerfectSupplement',
  description:
    'Van biobeschikbaarheid tot healthspan. De belangrijkste begrippen over supplementen, leefstijl en gezond ouder worden — helder uitgelegd.',
  alternates: {
    canonical: 'https://perfectsupplement.nl/kennisbank',
  },
}

export default function KennisbankPage() {
  const themes = getAllThemes()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
            ],
          }),
        }}
      />

      <main>
        {/* Hero */}
        <section className="pb-10 pt-12 md:pt-20">
          <Container>
            <nav aria-label="Breadcrumb" className="mb-10 md:mb-14">
              <ol className="flex items-center gap-2 text-[0.8125rem] text-stone-400">
                <li>
                  <Link href="/" className="transition hover:text-stone-600">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="select-none">
                  ›
                </li>
                <li className="font-medium text-stone-600">Kennisbank</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-6 bg-stone-300" aria-hidden />
                <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-400">
                  Kennisbank
                </p>
              </div>
              <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-stone-900 md:text-[3.5rem]">
                Kennisbank
              </h1>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.75] text-stone-500">
                Supplementen beoordelen begint met de juiste begrippen kennen. Van hoe je lichaam
                verandert na 40 tot hoe je een etiket leest — hier vind je de uitleg die ertoe doet.
              </p>
            </div>
          </Container>
        </section>

        {/* Thema-secties */}
        {themes.map((theme) => {
          const terms = getTermsByTheme(theme)
          if (terms.length === 0) return null
          const { title, description } = themeLabels[theme]

          return (
            <section key={theme} className="pb-16 md:pb-20">
              <Container>
                <div className="mb-8 border-b border-stone-100 pb-6">
                  <h2 className="text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">{description}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {terms.map((term) => (
                    <article
                      key={term.slug}
                      className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-stone-300 hover:shadow-sm"
                    >
                      <h3 className="text-base font-semibold text-stone-900">
                        <Link
                          href={`/kennisbank/${term.slug}`}
                          className="transition hover:text-stone-600"
                        >
                          {term.term}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500">
                        {term.shortDefinition}
                      </p>
                      <Link
                        href={`/kennisbank/${term.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stone-700 transition hover:text-stone-900"
                      >
                        Lees meer
                        <span
                          className="transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        >
                          →
                        </span>
                      </Link>
                    </article>
                  ))}
                </div>
              </Container>
            </section>
          )
        })}

        {/* CTA */}
        <section className="border-t border-stone-100 py-16 md:py-20">
          <Container>
            <div className="rounded-2xl bg-stone-50 px-6 py-10 text-center">
              <h2 className="text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                Wil je weten waar jij staat?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk resultaat.
              </p>
              <Link
                href="/intake"
                className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Start de Leefstijlcheck →
              </Link>
              <p className="mt-3 text-xs text-stone-400">
                Geen account nodig · Je gegevens worden anoniem verwerkt
              </p>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}

export const dynamic = 'force-static'

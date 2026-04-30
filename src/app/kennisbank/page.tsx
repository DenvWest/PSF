import Link from 'next/link'
import type { Metadata } from 'next'
import Container from '@/components/layout/Container'
import { themeLabels, getTermsByTheme, getAllThemes } from '@/data/kennisbank'

export const metadata: Metadata = {
  title: 'Kennisbank — Begrippen & Concepten | PerfectSupplement',
  description:
    'Van biobeschikbaarheid tot healthspan. De belangrijkste begrippen over supplementen, leefstijl en gezond ouder worden — helder uitgelegd.',
  alternates: {
    canonical: 'https://perfectsupplement.nl/kennisbank',
  },
}

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function KennisbankPage() {
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
              { '@type': 'ListItem', position: 2, name: 'Kennisbank' },
            ],
          }),
        }}
      />

      {/* ── HERO ───────────────────────────────────────────────────── */}
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
              Begrippen & Concepten
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.75] text-stone-500">
              Supplementen beoordelen begint met de juiste begrippen kennen. Van
              hoe je lichaam verandert na 40 tot hoe je een etiket leest — hier
              vind je de uitleg die ertoe doet.
            </p>
          </div>
        </Container>
      </section>

      {/* ── THEMA GRID ─────────────────────────────────────────────── */}
      <section className="pb-20 md:pb-28" aria-label="Thema's">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2">
            {getAllThemes().map((theme) => {
              const config = themeLabels[theme]
              const aantal = getTermsByTheme(theme).length
              return (
                <Link
                  key={theme}
                  href={`/kennisbank/${theme}`}
                  className={`group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-7 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:min-h-[220px] md:p-9 ${config.colorClasses.bg}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    aria-hidden
                    style={{ backgroundImage: NOISE_SVG }}
                  />
                  <div className="relative flex flex-1 flex-col">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ring-1 ${config.colorClasses.accent}`}
                      aria-hidden
                    >
                      {config.icon}
                    </span>
                    <div className="mt-auto">
                      <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                        {config.title}
                      </h2>
                      <p className={`mt-2 text-sm leading-relaxed ${config.colorClasses.tekst}`}>
                        {config.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-medium text-white/50">
                          {aantal} {aantal === 1 ? 'begrip' : 'begrippen'}
                        </span>
                        <span className="text-sm font-medium text-white/80 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" aria-label="Leefstijlcheck">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
              Wil je weten waar jij staat?
            </p>
            <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-stone-500">
              Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk
              resultaat.
            </p>
            <div className="mt-8">
              <Link
                href="/intake"
                className="inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
              >
                Start de Leefstijlcheck →
              </Link>
            </div>
            <p className="mt-4 text-xs text-stone-400">
              Geen account nodig · Je gegevens worden anoniem verwerkt
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}

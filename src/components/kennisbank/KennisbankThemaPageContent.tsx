import Link from "next/link";
import type { KennisbankTheme } from "@/data/kennisbank";
import { themeLabels, getTermsByTheme } from "@/data/kennisbank";
import Container from "@/components/layout/Container";
import KennisbankThemaIcon from "@/components/kennisbank/KennisbankThemaIcon";
import KennisbankThemaTabs from "@/components/kennisbank/KennisbankThemaTabs";
import KennisbankTermKaart from "@/components/kennisbank/KennisbankTermKaart";
import KennisbankIntakeCTA from "@/components/kennisbank/KennisbankIntakeCTA";
import {
  KB_BG_CLASS,
  KB_CARD_SHELL,
  KB_CONVERSION_PY,
  KB_HERO_PT,
  KB_HUB_LABEL,
  KB_ICON_BOX,
  KB_NOISE_SVG,
} from "@/components/kennisbank/kennisbank-layout";

interface KennisbankThemaPageContentProps {
  theme: KennisbankTheme;
}

export default function KennisbankThemaPageContent({ theme }: KennisbankThemaPageContentProps) {
  const config = themeLabels[theme];
  const terms = getTermsByTheme(theme);

  return (
    <>
      <section
        className={`relative overflow-hidden bg-gradient-to-br pb-14 md:pb-16 ${KB_HERO_PT} ${config.colorClasses.bg}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          aria-hidden
          style={{ backgroundImage: KB_NOISE_SVG }}
        />
        <Container>
          <nav aria-label="Breadcrumb" className="relative mb-8 md:mb-10">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-white/50">
              <li>
                <Link href="/" className="transition hover:text-white/85">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li>
                <Link href="/kennisbank" className="transition hover:text-white/85">
                  {KB_HUB_LABEL}
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-white/92">{config.title}</li>
            </ol>
          </nav>

          <div className="relative max-w-2xl">
            <div className={`${KB_ICON_BOX} ${config.colorClasses.accent}`}>
              <KennisbankThemaIcon theme={theme} />
            </div>
            <h1 className="mt-5 scroll-mt-24 font-display text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white md:mt-6 md:text-[3.125rem]">
              {config.title}
            </h1>
            <p className={`mt-4 max-w-lg text-[1.0625rem] leading-[1.75] ${config.colorClasses.tekst}`}>
              {config.description}
            </p>
          </div>
        </Container>
      </section>

      <section className={`${KB_BG_CLASS} pb-1`} aria-label="Thema-navigatie">
        <Container className="pt-5 md:pt-6">
          <div className={KB_CARD_SHELL}>
            <KennisbankThemaTabs activeTheme={theme} />
          </div>
        </Container>
      </section>

      <section className={`${KB_BG_CLASS} py-12 md:py-16`} aria-label="Begrippen">
        <Container>
          <p className="ps-eyebrow mb-7 md:mb-9">Begrippen in dit thema</p>
          {terms.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {terms.map((term) => (
                <KennisbankTermKaart key={term.slug} term={term} />
              ))}
            </div>
          ) : (
            <p className="text-base text-stone-500">
              Nog geen begrippen in dit thema. Binnenkort beschikbaar.
            </p>
          )}
        </Container>
      </section>

      <section className={`${KB_BG_CLASS} ${KB_CONVERSION_PY}`}>
        <Container>
          <KennisbankIntakeCTA className="mx-auto max-w-2xl" />
        </Container>
      </section>
    </>
  );
}

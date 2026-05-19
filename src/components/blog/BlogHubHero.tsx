import Link from "next/link";
import Container from "@/components/layout/Container";
import {
  BLOG_BG_CLASS,
  BLOG_HERO_H1,
  BLOG_HERO_INTRO,
  BLOG_HERO_PB,
  BLOG_HERO_PT,
  BLOG_HUB_LABEL,
} from "@/components/blog/blog-layout";
import { HOMEPAGE_LIFESTYLE, INTAKE_PROMO } from "@/data/homepage";

interface BlogHubHeroProps {
  compact?: boolean;
}

export default function BlogHubHero({ compact = false }: BlogHubHeroProps) {
  return (
    <section
      className={
        compact
          ? `${BLOG_BG_CLASS} pb-12 pt-[5.75rem] md:pb-14 md:pt-20`
          : `${BLOG_BG_CLASS} ${BLOG_HERO_PB} ${BLOG_HERO_PT}`
      }
    >
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
            <li className="font-medium text-stone-600">{BLOG_HUB_LABEL}</li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-stone-300" aria-hidden />
            <p className="ps-eyebrow">{BLOG_HUB_LABEL}</p>
          </div>
          <h1 className={BLOG_HERO_H1}>
            Begrijp waarom je lichaam niet meer herstelt zoals vroeger
          </h1>
          <p className={BLOG_HERO_INTRO}>
            Rustige, onderbouwde artikelen over slaap, stress, energie en
            supplementen — geschreven om je te helpen begrijpen wat je lichaam
            probeert te vertellen.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/intake"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover"
            >
              {INTAKE_PROMO.heroCta}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/#${HOMEPAGE_LIFESTYLE.sectionId}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
            >
              Bekijk hoe het werkt
            </Link>
          </div>
          <p className="mt-3 text-xs text-stone-500">{INTAKE_PROMO.subline}</p>
        </div>
      </Container>
    </section>
  );
}

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
        <nav aria-label="Breadcrumb" className="mb-12 md:mb-16">
          <ol className="flex items-center gap-2 text-[0.8125rem] tracking-wide text-stone-400">
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
          <div className="mb-6 flex items-center gap-3 md:mb-8">
            <div className="h-px w-8 bg-stone-300/90" aria-hidden />
            <p className="ps-eyebrow tracking-[0.14em]">{BLOG_HUB_LABEL}</p>
          </div>
          <h1 className={`${BLOG_HERO_H1} md:leading-[1.05]`}>
            Begrijp waarom je lichaam niet meer herstelt zoals vroeger
          </h1>
          <p className={`${BLOG_HERO_INTRO} mt-8 md:mt-10`}>
            Rustige, onderbouwde artikelen over slaap, stress, energie en
            supplementen — geschreven om je te helpen begrijpen wat je lichaam
            probeert te vertellen.
          </p>
        </div>
      </Container>
    </section>
  );
}

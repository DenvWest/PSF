import Link from "next/link";
import type { BlogArtikel, BlogCategorie } from "@/types/blog";
import type { CategorieConfig } from "@/data/blog/categorieen";
import Container from "@/components/layout/Container";
import BlogArtikelKaart from "./BlogArtikelKaart";
import BlogCategorieIcon from "./BlogCategorieIcon";
import BlogCategorieSubnav from "./BlogCategorieSubnav";
import BlogThemaLinks from "./BlogThemaLinks";
import BlogIntakeCTA from "./BlogIntakeCTA";
import {
  BLOG_BG_CLASS,
  BLOG_CATEGORY_ICON_BOX,
  BLOG_CONVERSION_SECTION_PY,
  BLOG_HERO_PT,
  BLOG_HUB_LABEL,
  BLOG_NOISE_SVG,
} from "@/components/blog/blog-layout";

interface Props {
  config: CategorieConfig;
  artikelen: BlogArtikel[];
  aantalPerCategorie: Record<BlogCategorie, number>;
}

export default function BlogCategoriePageContent({
  config,
  artikelen,
  aantalPerCategorie,
}: Props) {
  return (
    <>
      <section
        className={`relative overflow-hidden bg-gradient-to-br pb-14 md:pb-16 ${BLOG_HERO_PT} ${config.kleur.bg}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden
          style={{ backgroundImage: BLOG_NOISE_SVG }}
        />
        <Container>
          <nav aria-label="Breadcrumb" className="relative mb-8 md:mb-10">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-white/50">
              <li>
                <Link href="/" className="transition hover:text-white/80">
                  Home
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li>
                <Link href="/blog" className="transition hover:text-white/80">
                  {BLOG_HUB_LABEL}
                </Link>
              </li>
              <li aria-hidden className="select-none">
                ›
              </li>
              <li className="font-medium text-white/90">{config.naam}</li>
            </ol>
          </nav>

          <div className="relative max-w-2xl">
            <div className={`${BLOG_CATEGORY_ICON_BOX} ${config.kleur.accent}`}>
              <BlogCategorieIcon categorie={config.id} className="h-[1.375rem] w-[1.375rem]" />
            </div>
            <h1 className="mt-5 scroll-mt-24 font-display text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:mt-6 md:text-[3rem]">
              {config.naam}
            </h1>
            <p className={`mt-4 max-w-lg text-[1.0625rem] leading-[1.75] ${config.kleur.tekst}`}>
              {config.beschrijving}
            </p>
            <p className="mt-6">
              <Link
                href={config.themaHref}
                className="inline-flex min-h-11 items-center text-sm text-white/75 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/50"
              >
                Naar de themagids →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <BlogCategorieSubnav
        activeId={config.id}
        aantalPerCategorie={aantalPerCategorie}
        intentArticleLinks={config.intentArticleLinks}
        intentTopics={config.intentTopics}
      />

      <section
        className={`${BLOG_BG_CLASS} py-12 md:py-16`}
        aria-label={`${config.naam} artikelen`}
      >
        <Container>
          <p className="ps-eyebrow mb-6 md:mb-8">Artikelen</p>
          {artikelen.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {artikelen.map((artikel) => (
                <BlogArtikelKaart key={artikel.slug} artikel={artikel} />
              ))}
            </div>
          ) : (
            <p className="text-base text-stone-500">
              Nog geen artikelen in deze categorie.
            </p>
          )}
        </Container>
      </section>

      <section className={`${BLOG_BG_CLASS} ${BLOG_CONVERSION_SECTION_PY}`}>
        <Container>
          <BlogIntakeCTA className="mx-auto max-w-2xl" />

          <div className="mx-auto mt-24 max-w-2xl md:mt-28">
            <BlogThemaLinks
              heading="Andere klachten verkennen?"
              subtext="Onze themagidsen helpen je vanuit je symptoom verder."
            />
          </div>
        </Container>
      </section>
    </>
  );
}

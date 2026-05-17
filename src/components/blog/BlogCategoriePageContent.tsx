import Link from "next/link";
import type { BlogArtikel, BlogCategorie } from "@/types/blog";
import type { CategorieConfig } from "@/data/blog/categorieen";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import Container from "@/components/layout/Container";
import BlogArtikelKaart from "./BlogArtikelKaart";
import BlogCategorieIcon from "./BlogCategorieIcon";
import BlogSymptomNav from "./BlogSymptomNav";
import BlogThemaLinks from "./BlogThemaLinks";
import BlogIntakeCTA from "./BlogIntakeCTA";
import {
  BLOG_BG_CLASS,
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
        className={`relative overflow-hidden bg-gradient-to-br pb-16 md:pb-20 ${BLOG_HERO_PT} ${config.kleur.bg}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden
          style={{ backgroundImage: BLOG_NOISE_SVG }}
        />
        <Container>
          <nav aria-label="Breadcrumb" className="relative mb-10 md:mb-14">
            <ol className="flex items-center gap-2 text-[0.8125rem] text-white/50">
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
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white/90 ring-1 ${config.kleur.accent}`}
              aria-hidden
            >
              <BlogCategorieIcon categorie={config.id} className="h-5 w-5" />
            </span>
            <h1 className="mt-4 scroll-mt-24 font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[3rem]">
              {config.naam}
            </h1>
            <p className={`mt-4 text-[1.0625rem] leading-[1.75] ${config.kleur.tekst}`}>
              {config.beschrijving}
            </p>
            <p className="mt-6">
              <Link
                href={config.themaHref}
                className="text-sm text-white/70 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              >
                Naar de themagids →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <BlogSymptomNav
        links={config.intentArticleLinks}
        topics={config.intentTopics}
      />

      <div className="border-b border-stone-200 bg-white">
        <Container>
          <div
            className="-mb-px flex flex-wrap gap-6"
            role="tablist"
            aria-label="Categorieën"
          >
            {ALLE_CATEGORIEEN.map((cat) => {
              const isActive = cat.id === config.id;
              const aantal = aantalPerCategorie[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/blog/${cat.id}`}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition ${
                    isActive
                      ? "border-stone-900 text-stone-900"
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-800"
                  }`}
                >
                  <BlogCategorieIcon categorie={cat.id} className="h-4 w-4" />
                  <span>{cat.naam}</span>
                  <span className={`text-xs ${isActive ? "text-stone-400" : "text-stone-400"}`}>
                    {aantal}
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </div>

      <section
        className={`${BLOG_BG_CLASS} py-14 md:py-20`}
        aria-label={`${config.naam} artikelen`}
      >
        <Container>
          {artikelen.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {artikelen.map((artikel) => (
                <BlogArtikelKaart key={artikel.slug} artikel={artikel} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">
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

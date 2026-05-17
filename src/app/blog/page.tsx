import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { alleArtikelen } from "@/data/blog";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import type { BlogCategorie } from "@/types/blog";
import BlogHubHero from "@/components/blog/BlogHubHero";
import BlogUitgelicht from "@/components/blog/BlogUitgelicht";
import BlogThemaLinks from "@/components/blog/BlogThemaLinks";
import BlogIntakeCTA from "@/components/blog/BlogIntakeCTA";
import BlogVergelijkingLinks from "@/components/blog/BlogVergelijkingLinks";
import BlogCategorieIcon from "@/components/blog/BlogCategorieIcon";
import {
  BLOG_BG_CLASS,
  BLOG_CATEGORY_ARROW,
  BLOG_CATEGORY_CARD,
  BLOG_CONVERSION_SECTION_PY,
  BLOG_HUB_LABEL,
  BLOG_NOISE_SVG,
} from "@/components/blog/blog-layout";

export const metadata: Metadata = {
  title: "Herstelbibliotheek — Slaap, Stress & Herstel na 40 | PerfectSupplement",
  description:
    "Moe wakker worden, altijd aan staan of trager herstel na 40? Rustige, onderbouwde artikelen over slaap, stress, energie en wat je lichaam signaleert.",
  alternates: {
    canonical: "https://perfectsupplement.nl/blog",
  },
};

function telArtikelen(categorie: BlogCategorie): number {
  return alleArtikelen.filter((a) => a.categorie === categorie).length;
}

const uitgelichteArtikelen = alleArtikelen
  .filter((a) => !a.pad)
  .slice(0, 2);

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://perfectsupplement.nl",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: BLOG_HUB_LABEL,
                    item: "https://perfectsupplement.nl/blog",
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                name: BLOG_HUB_LABEL,
                description:
                  "Rustige, onderbouwde artikelen over slaap, stress, energie en herstel voor mannen boven de 40.",
                url: "https://perfectsupplement.nl/blog",
                isPartOf: {
                  "@type": "WebSite",
                  name: "PerfectSupplement",
                  url: "https://perfectsupplement.nl",
                },
              },
            ],
          }),
        }}
      />

      <BlogHubHero />

      <section className={`${BLOG_BG_CLASS} pb-16 md:pb-20`} aria-label="Categorieën">
        <Container>
          <div className="rounded-3xl bg-[var(--ps-surface)] p-8 shadow-sm shadow-stone-900/[0.03] md:p-12">
            <div className="grid gap-4 sm:grid-cols-2">
              {ALLE_CATEGORIEEN.map((cat) => {
                const aantal = telArtikelen(cat.id);
                return (
                  <Link
                    key={cat.id}
                    href={`/blog/${cat.id}`}
                    className={`${BLOG_CATEGORY_CARD} ${cat.kleur.bg}`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.035]"
                      aria-hidden
                      style={{ backgroundImage: BLOG_NOISE_SVG }}
                    />

                    <div className="relative flex flex-1 flex-col">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-white/90 ring-1 ${cat.kleur.accent}`}
                        aria-hidden
                      >
                        <BlogCategorieIcon categorie={cat.id} className="h-5 w-5" />
                      </span>

                      <div className="mt-auto">
                        <h2 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
                          {cat.naam}
                        </h2>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${cat.kleur.tekst}`}
                        >
                          {cat.beschrijving}
                        </p>

                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-xs font-medium text-white/50">
                            {aantal} {aantal === 1 ? "artikel" : "artikelen"}
                          </span>
                          <span className={BLOG_CATEGORY_ARROW} aria-hidden>
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <BlogUitgelicht artikelen={uitgelichteArtikelen} />

      <section
        className={`${BLOG_BG_CLASS} ${BLOG_CONVERSION_SECTION_PY}`}
        aria-label="Themagidsen en intake"
      >
        <Container>
          <div className="mx-auto max-w-2xl px-1">
            <BlogThemaLinks />
          </div>

          <BlogIntakeCTA className="mx-auto mt-24 max-w-2xl md:mt-28" />
        </Container>
      </section>

      <section
        className="border-t border-stone-200/60 bg-[var(--ps-surface)] py-12 md:py-16"
        aria-label="Vergelijkingspagina's"
      >
        <Container>
          <BlogVergelijkingLinks />
        </Container>
      </section>
    </>
  );
}

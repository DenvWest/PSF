import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { alleArtikelen } from "@/data/blog";
import { ALLE_CATEGORIEEN } from "@/data/blog/categorieen";
import type { BlogCategorie } from "@/types/blog";
import BlogHubHero from "@/components/blog/BlogHubHero";
import BlogUitgelicht from "@/components/blog/BlogUitgelicht";
import BlogThemaLinks from "@/components/blog/BlogThemaLinks";
import BlogCategorieKaart from "@/components/blog/BlogCategorieKaart";
import {
  BLOG_BG_CLASS,
  BLOG_CONVERSION_SECTION_PY,
  BLOG_HUB_LABEL,
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

      <section
        className={`${BLOG_BG_CLASS} pt-2 pb-14 md:pt-3 md:pb-16`}
        aria-label="Categorieën"
      >
        <Container>
          <div className="rounded-3xl bg-white p-5 shadow-sm shadow-stone-900/[0.04] md:p-8 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {ALLE_CATEGORIEEN.map((cat) => (
                <BlogCategorieKaart
                  key={cat.id}
                  config={cat}
                  artikelCount={telArtikelen(cat.id)}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <BlogUitgelicht artikelen={uitgelichteArtikelen} />

      <section
        className={`${BLOG_BG_CLASS} ${BLOG_CONVERSION_SECTION_PY}`}
        aria-label="Themagidsen"
      >
        <Container>
          <div className="mx-auto max-w-2xl px-1">
            <BlogThemaLinks />
          </div>
        </Container>
      </section>
    </>
  );
}

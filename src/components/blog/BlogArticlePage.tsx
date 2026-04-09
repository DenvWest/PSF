import type { BlogArtikel } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/symptomen/Breadcrumbs";
import BlogCategorieBadge from "./BlogCategorieBadge";
import BlogMeta from "./BlogMeta";
import BlogSectie from "./BlogSectie";
import BlogSamenvatting from "./BlogSamenvatting";
import BlogSupplementCTA from "./BlogSupplementCTA";
import BlogCornerstoneLink from "./BlogCornerstoneLink";
import BlogGerelateerd from "./BlogGerelateerd";

interface BlogArticlePageProps {
  artikel: BlogArtikel;
  gerelateerde: BlogArtikel[];
}

export default function BlogArticlePage({
  artikel,
  gerelateerde,
}: BlogArticlePageProps) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.titel,
    datePublished: artikel.gepubliceerdOp,
    author: {
      "@type": "Organization",
      name: "Redactie PerfectSupplement",
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: "https://perfectsupplement.nl",
    },
    description: artikel.metaDescription ?? artikel.heroIntro,
    mainEntityOfPage: `https://perfectsupplement.nl${blogArtikelPad(artikel)}`,
  };

  return (
    <div className="bg-stone-50/40 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200/80 bg-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: artikel.titel },
            ]}
          />

          <div className="mt-5 max-w-[680px]">
            <BlogCategorieBadge categorie={artikel.categorie} />

            <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.18] tracking-tight text-stone-900 md:text-4xl">
              {artikel.titel}
            </h1>

            <div className="mt-3">
              <BlogMeta
                leestijd={artikel.leestijd}
                gepubliceerdOp={artikel.gepubliceerdOp}
              />
            </div>

            <p className="mt-5 text-[1.0625rem] leading-[1.75] text-stone-600">
              {artikel.heroIntro}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        {/* ── Artikel-content ──────────────────────────────────────────── */}
        <div className="max-w-[680px] space-y-14">
          {artikel.secties.map((sectie, index) => (
            <BlogSectie key={index} sectie={sectie} />
          ))}
        </div>

        {/* ── Samenvatting ─────────────────────────────────────────────── */}
        <div className="mt-14 max-w-[680px]">
          <BlogSamenvatting tekst={artikel.samenvatting} />
        </div>

        {/* ── Supplement CTA (optioneel) ────────────────────────────────── */}
        {artikel.supplementCTA && (
          <div className="mt-8 max-w-[680px]">
            <BlogSupplementCTA cta={artikel.supplementCTA} />
          </div>
        )}

        {/* ── Cornerstone terug-link ────────────────────────────────────── */}
        <div className="mt-14 max-w-[680px]">
          <BlogCornerstoneLink link={artikel.cornerstoneLink} />
        </div>

        {/* ── Gerelateerde artikelen ────────────────────────────────────── */}
        {gerelateerde.length > 0 && (
          <div className="mt-16">
            <BlogGerelateerd artikelen={gerelateerde} />
          </div>
        )}
      </Container>
    </div>
  );
}

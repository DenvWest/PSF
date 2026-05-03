import type { BlogArtikel, BlogSectie as BlogSectieData } from "@/types/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BlogCategorieBadge from "./BlogCategorieBadge";
import BlogMeta from "./BlogMeta";
import BlogSectie from "./BlogSectie";
import BlogSamenvatting from "./BlogSamenvatting";
import BlogSupplementCTA from "./BlogSupplementCTA";
import BlogCornerstoneLink from "./BlogCornerstoneLink";
import Link from "next/link";
import BlogGerelateerd from "./BlogGerelateerd";
import { renderInlineMarkdownLinks } from "./inlineMarkdownLinks";

interface BlogArticlePageProps {
  artikel: BlogArtikel;
  gerelateerde: BlogArtikel[];
}

export default function BlogArticlePage({
  artikel,
  gerelateerde,
}: BlogArticlePageProps) {
  const lastIdx = artikel.secties.length - 1;
  const heeftDisclaimerAlsLaatste =
    lastIdx >= 0 && artikel.secties[lastIdx]!.titel === "Disclaimer";
  const hoofdSecties: BlogSectieData[] = heeftDisclaimerAlsLaatste
    ? artikel.secties.slice(0, -1)
    : artikel.secties;
  const disclaimerSecties: BlogSectieData[] = heeftDisclaimerAlsLaatste
    ? [artikel.secties[lastIdx]!]
    : [];

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
              {renderInlineMarkdownLinks(artikel.heroIntro)}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        {/* ── Artikel-content ──────────────────────────────────────────── */}
        <div className="max-w-[680px] space-y-14">
          {hoofdSecties.map((sectie, index) => (
            <BlogSectie key={index} sectie={sectie} />
          ))}
        </div>

        {/* Intake CTA */}
        <div className="mt-16 max-w-[680px]">
          <section className="rounded-2xl bg-[#F7F5F0] px-6 py-10 text-center sm:px-10">
            <h2 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
              Wil je weten wat bij jou past?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600">
              Doe de gratis Leefstijlcheck en ontdek in 3 minuten welk profiel bij jou past —
              en welke supplementen écht verschil maken.
            </p>
            <Link
              href="/intake"
              className="mt-6 inline-block rounded-lg bg-[#3C7A56] px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#4A7F5A]"
            >
              Start de Leefstijlcheck →
            </Link>
          </section>
        </div>

        {disclaimerSecties.length > 0 && (
          <div className="mt-14 max-w-[680px] space-y-14">
            {disclaimerSecties.map((sectie, index) => (
              <BlogSectie key={`disclaimer-${index}`} sectie={sectie} />
            ))}
          </div>
        )}

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
        <div className="mt-14 max-w-[680px] space-y-4">
          <BlogCornerstoneLink link={artikel.cornerstoneLink} />
          {artikel.vergelijkingExtraLink && (
            <Link
              href={artikel.vergelijkingExtraLink.href}
              className="group inline-flex w-full items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:text-stone-900 sm:w-auto"
            >
              <span>{artikel.vergelijkingExtraLink.label}</span>
              <span aria-hidden className="text-stone-400 transition group-hover:text-stone-600">
                →
              </span>
            </Link>
          )}
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

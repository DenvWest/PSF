import type { BlogArtikel, BlogSectie as BlogSectieData } from "@/types/blog";
import { blogSectionDomId } from "@/lib/article-heading-id";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { buildBlogTocItems } from "@/lib/article-toc";
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
import ArticleReferentiesFooter from "@/components/content/ArticleReferentiesFooter";
import ArticleBodyReadingChrome, {
  ARTICLE_HIDE_TOC_BELOW_ITEMS,
} from "@/components/content/ArticleBodyReadingChrome";
import { renderInlineMarkdownLinks } from "./inlineMarkdownLinks";
import {
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
} from "@/lib/redactie-standaarden";

interface BlogArticlePageProps {
  artikel: BlogArtikel;
  gerelateerde: BlogArtikel[];
}

const DEFAULT_HERO_NUANCE =
  "Dit artikel is evidence‑informed: we baseren ons op gepubliceerde literatuur en officiële kaders, maar individuele uitkomsten kunnen afwijken. Associaties in onderzoek zijn niet hetzelfde als bewezen causaliteit op persoonsniveau — bij gezondheidszorg altijd uw zorgprofessional raadplegen.";

const HERO_PROSE =
  "mt-6 max-w-[72ch] text-[1.0625rem] leading-[1.82] tracking-[0.004em] text-stone-600 md:text-[1.09375rem]";

export default function BlogArticlePage({
  artikel,
  gerelateerde,
}: BlogArticlePageProps) {
  const disclaimerSectie = artikel.secties.find((s) => s.titel === "Disclaimer");
  const hoofdSecties: BlogSectieData[] = artikel.secties.filter(
    (s) => s.titel !== "Disclaimer",
  );

  const aanvullendeDisclaimerNodes =
    disclaimerSectie?.tekst !== undefined
      ? [renderInlineMarkdownLinks(disclaimerSectie.tekst)]
      : undefined;

  const laatst = artikel.laatstBijgewerktOp ?? STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM;
  const redacteur = artikel.inhoudelijkeVerantwoordelijke ?? REDACTIE_VERANTWOORDELIJKE_STANDARD;

  const tocItems = buildBlogTocItems(artikel.slug, artikel.secties);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.titel,
    datePublished: artikel.gepubliceerdOp,
    dateModified: laatst,
    author: {
      "@type": "Organization",
      name: redacteur,
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
    <div className="min-h-0 bg-stone-50/80 pb-28 md:bg-stone-50/85 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <header className="border-b border-stone-200/75 bg-white">
        <Container className="py-11 md:py-[3.25rem]">
          <div className="max-w-[min(72ch,calc(100%-0.75rem))]">
            <Breadcrumbs
              items={[
                { label: "Blog", href: "/blog" },
                { label: artikel.titel },
              ]}
            />

            <div className="mt-8">
              <BlogCategorieBadge categorie={artikel.categorie} />

              <h1 className="mt-6 font-display text-[clamp(2rem,4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-stone-900">
                {artikel.titel}
              </h1>

              <div className="mt-5">
                <BlogMeta leestijd={artikel.leestijd} gepubliceerdOp={artikel.gepubliceerdOp} />
              </div>

              <p className={HERO_PROSE}>{renderInlineMarkdownLinks(artikel.heroIntro)}</p>

              <div
                role="note"
                className="mt-7 max-w-[72ch] rounded-lg border border-stone-200/95 bg-[color-mix(in_srgb,var(--ps-bg)_92%,transparent)] px-4 py-3.5 text-[0.875rem] leading-[1.7] text-stone-600"
              >
                {artikel.leesNuanceOnderHero ?? DEFAULT_HERO_NUANCE}
              </div>
            </div>
          </div>
        </Container>
      </header>

      <Container className="pt-14 md:pt-[4.25rem]">
        <ArticleBodyReadingChrome
          tocItems={tocItems}
          hideTocBelowItemCount={ARTICLE_HIDE_TOC_BELOW_ITEMS}
        >
          {hoofdSecties.map((sectie, index) => (
            <BlogSectie
              key={`${sectie.titel}-${String(index)}`}
              sectie={sectie}
              anchorId={blogSectionDomId(artikel.slug, index, sectie.titel)}
            />
          ))}

          {artikel.stressPillarTurbo ? (
            <aside className="mt-6 rounded-xl border border-stone-200/90 bg-[color-mix(in_srgb,var(--ps-bg)_96%,transparent)] px-6 py-6 md:px-7 md:py-8">
              <p className="font-display text-lg font-medium text-stone-900 md:text-xl">Meer diepgang bij stress?</p>
              <p className="mt-3 max-w-[70ch] text-[0.9375rem] leading-[1.75] text-stone-600">{artikel.stressPillarTurbo}</p>
              <Link
                href="/stress-verminderen-man"
                className="mt-4 inline-flex text-[0.875rem] font-medium text-stone-800 underline decoration-stone-300 decoration-1 underline-offset-[3px] transition hover:text-stone-950 hover:decoration-stone-500"
              >
                Lees de hoofdstuk‑gids: stress verminderen na 40
              </Link>
            </aside>
          ) : null}

          <div className="mt-14">
            <BlogSamenvatting tekst={artikel.samenvatting} />
          </div>

          {artikel.supplementCTA ? (
            <div className="mt-14">
              <BlogSupplementCTA cta={artikel.supplementCTA} />
            </div>
          ) : null}

          <div className="mt-16 flex max-w-[72ch] flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <BlogCornerstoneLink link={artikel.cornerstoneLink} />
            {artikel.vergelijkingExtraLink ? (
              <Link
                href={artikel.vergelijkingExtraLink.href}
                className="group inline-flex w-full flex-1 items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3.5 text-[0.875rem] font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50/75 hover:text-stone-900 sm:min-h-0 sm:max-w-fit"
              >
                <span>{artikel.vergelijkingExtraLink.label}</span>
                <span className="text-stone-400 transition group-hover:text-stone-500" aria-hidden>
                  →
                </span>
              </Link>
            ) : null}
          </div>

          <div className="mt-20">
            <ArticleReferentiesFooter
              referenties={artikel.referenties}
              laatstBijgewerktOp={laatst}
              wetenschappelijkGecontroleerdOp={laatst}
              verantwoordelijke={redacteur}
              aanvullendeDisclaimers={aanvullendeDisclaimerNodes}
            />
          </div>
        </ArticleBodyReadingChrome>

        {gerelateerde.length > 0 ? (
          <div className="mx-auto mt-20 max-w-[min(var(--reading-layout-max-width),100%)] md:mt-24">
            <BlogGerelateerd artikelen={gerelateerde} />
          </div>
        ) : null}

        <section
          className="mx-auto mt-20 max-w-[min(38rem,100%)] border border-stone-200/90 bg-white px-7 py-10 text-center md:mt-24 md:px-10 md:py-12"
          aria-label="Leefstijlcheck"
        >
          <h2 className="font-display text-[1.375rem] font-semibold leading-snug text-stone-900 md:text-2xl">
            Leefstijl en supplementen structureren
          </h2>
          <p className="mx-auto mt-4 max-w-[34ch] text-[0.9375rem] leading-[1.75] text-stone-600">
            De Leefstijlcheck is een korte vragenlijst. Het overzicht kan helpen prioriteiten te kiezen — geen medische
            test en geen vervanging van zorg.
          </p>
          <Link
            href="/intake"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-stone-800/90 bg-stone-900 px-7 text-[0.875rem] font-medium text-white transition hover:bg-stone-800"
          >
            Start de Leefstijlcheck
          </Link>
        </section>
      </Container>
    </div>
  );
}

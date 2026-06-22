import type { BlogArtikel, BlogSectie as BlogSectieData } from "@/types/blog";
import { blogSectionDomId } from "@/lib/article-heading-id";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { buildBlogTocItems } from "@/lib/article-toc";
import { isLongBlogArticle } from "@/lib/blog-article-length";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BlogCategorieBadge from "./BlogCategorieBadge";
import BlogMeta from "./BlogMeta";
import BlogSectie from "./BlogSectie";
import BlogSamenvatting from "./BlogSamenvatting";
import BlogKernpunten from "./BlogKernpunten";
import BlogSupplementCTA from "./BlogSupplementCTA";
import BlogCornerstoneLink from "./BlogCornerstoneLink";
import Link from "next/link";
import BlogGerelateerd from "./BlogGerelateerd";
import BlogIntakeCTA from "./BlogIntakeCTA";
import ArticleReferentiesFooter from "@/components/content/ArticleReferentiesFooter";
import ArticleBodyReadingChrome, {
  ARTICLE_HIDE_TOC_BELOW_ITEMS,
} from "@/components/content/ArticleBodyReadingChrome";
import ArticleTableOfContents from "@/components/content/ArticleTableOfContents";
import ReadingLayoutDesktopGutters from "@/components/content/ReadingLayoutDesktopGutters";
import {
  READING_ROW_GAP_CLASS,
  READING_TOC_COL_CLASS,
  READING_RAIL_COL_CLASS,
} from "@/lib/article-reading-columns";
import { alleArtikelen } from "@/data/blog";
import { CATEGORIE_CONFIG } from "@/data/blog/categorieen";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import { renderInlineMarkdownLinks } from "./inlineMarkdownLinks";
import {
  REDACTIE_VERANTWOORDELIJKE_STANDARD,
  STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM,
} from "@/lib/redactie-standaarden";
import { BLOG_HUB_LABEL } from "@/components/blog/blog-layout";
import FloatingLeefstijlcheckCta from "@/components/ui/FloatingLeefstijlcheckCta";

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
  const showReadingGutters = tocItems.length >= ARTICLE_HIDE_TOC_BELOW_ITEMS;

  const clusterTitle = CATEGORIE_CONFIG[artikel.categorie].naam;
  const clusterArticles = alleArtikelen
    .filter((a) => a.categorie === artikel.categorie && a.slug !== artikel.slug)
    .slice(0, 8)
    .map((a) => ({ href: blogArtikelPad(a), title: a.titel }));

  const showMidArticleCta = isLongBlogArticle(artikel);
  const midIndex = Math.ceil(hoofdSecties.length / 2);
  const sectiesVoorMid = showMidArticleCta
    ? hoofdSecties.slice(0, midIndex)
    : hoofdSecties;
  const sectiesNaMid = showMidArticleCta ? hoofdSecties.slice(midIndex) : [];

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
    <>
    <div className="min-h-0 bg-stone-50/80 pb-28 md:bg-stone-50/85 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <header className="border-b border-stone-200/75 bg-white">
        <Container className="py-11 md:py-[3.25rem]">
          <div className={`flex min-w-0 flex-col lg:flex-row lg:items-start ${READING_ROW_GAP_CLASS}`}>
            <ReadingLayoutDesktopGutters />
            <div className="min-w-0 w-full max-w-[min(72ch,calc(100%-0.75rem))] mx-auto lg:mx-0">
              <Breadcrumbs
                items={[
                  { label: BLOG_HUB_LABEL, href: "/blog" },
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
          </div>
        </Container>
      </header>

      <Container className="pt-14 md:pt-[4.25rem]">
        <div className={`flex w-full min-w-0 flex-col lg:flex-row lg:items-start ${READING_ROW_GAP_CLASS}`}>
          <aside className={`${READING_TOC_COL_CLASS} hidden min-h-0 lg:block`}>
            <div className="sticky top-[var(--sticky-toc-offset)] max-h-[calc(100vh-var(--sticky-toc-offset)-2rem)] overflow-y-auto pb-14 pt-0.5 xl:pb-16">
              <ArticleSidebar
                headings={tocItems.map((t) => ({ id: t.id, text: t.label }))}
                clusterTitle={clusterTitle}
                clusterArticles={clusterArticles}
                currentSlug={artikel.slug}
              />
            </div>
          </aside>
          <div className={`${READING_RAIL_COL_CLASS} hidden lg:flex`} aria-hidden="true">
            <div className="relative min-h-24 w-[2px] flex-1 overflow-hidden rounded-full bg-stone-200/92" />
          </div>
          <div className="min-w-0 flex-1">
            <ArticleBodyReadingChrome tocItems={[]} hideTocBelowItemCount={999}>
              {showReadingGutters ? (
                <div className="mb-9 lg:hidden">
                  <ArticleTableOfContents items={tocItems} activeId={null} />
                </div>
              ) : null}

              {sectiesVoorMid.map((sectie, index) => (
                <BlogSectie
                  key={`${sectie.titel}-${String(index)}`}
                  sectie={sectie}
                  anchorId={blogSectionDomId(artikel.slug, index, sectie.titel)}
                />
              ))}

              {showMidArticleCta ? (
                <BlogIntakeCTA className="mx-auto mt-14 max-w-[min(38rem,100%)]" />
              ) : null}

              {sectiesNaMid.map((sectie, index) => {
                const sectieIndex = midIndex + index;
                return (
                  <BlogSectie
                    key={`${sectie.titel}-${String(sectieIndex)}`}
                    sectie={sectie}
                    anchorId={blogSectionDomId(artikel.slug, sectieIndex, sectie.titel)}
                  />
                );
              })}

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

              {artikel.kernpunten && artikel.kernpunten.length > 0 ? (
                <div className="mt-14">
                  <BlogKernpunten punten={artikel.kernpunten} />
                </div>
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
          </div>
        </div>

        {gerelateerde.length > 0 ? (
          <div className="mx-auto mt-20 max-w-[min(var(--reading-layout-max-width),100%)] md:mt-24">
            <BlogGerelateerd artikelen={gerelateerde} />
          </div>
        ) : null}

        <BlogIntakeCTA className="mx-auto mt-20 max-w-[min(38rem,100%)] md:mt-24" />
      </Container>
    </div>
    <FloatingLeefstijlcheckCta revealOnTimer={false} />
    </>
  );
}

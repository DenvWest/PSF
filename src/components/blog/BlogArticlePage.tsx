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
import ArticleReferentiesFooter from "@/components/content/ArticleReferentiesFooter";
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
  "Dit artikel is evidence‑informed: we baseren ons op gepubliceerde literatuur en officiële kaders, maar individuele uitkomsten kunnen afwijken. Associaties in onderzoek zijn niet hetzelfde als bewezen causaliteit op persoonsniveau — twijfel bij klachten altijd met uw zorgprofessional.";

export default function BlogArticlePage({
  artikel,
  gerelateerde,
}: BlogArticlePageProps) {
  const disclaimerSectie = artikel.secties.find((s) => s.titel === "Disclaimer");
  const hoofdSecties: BlogSectieData[] = artikel.secties.filter(
    (s) => s.titel !== "Disclaimer",
  );

  const aanvullendeDisclaimerNodes =
    disclaimerSectie?.tekst !== undefined ? [renderInlineMarkdownLinks(disclaimerSectie.tekst)] : undefined;

  const laatst = artikel.laatstBijgewerktOp ?? STANDAARD_INHOUD_HIUDIGE_REVIEW_DATUM;
  const redacteur = artikel.inhoudelijkeVerantwoordelijke ?? REDACTIE_VERANTWOORDELIJKE_STANDARD;

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
    <div className="bg-stone-50/40 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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

            <p className="mt-4 rounded-lg border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm leading-relaxed text-stone-600">
              {artikel.leesNuanceOnderHero ?? DEFAULT_HERO_NUANCE}
            </p>
          </div>
        </Container>
      </div>

      <Container className="pt-10 md:pt-14">
        <div className="max-w-[680px] space-y-14">
          {hoofdSecties.map((sectie, index) => (
            <BlogSectie key={index} sectie={sectie} />
          ))}
        </div>

        {artikel.stressPillarTurbo && (
          <aside className="mt-10 max-w-[680px] rounded-xl bg-[#F7F5F0] p-6">
            <p className="font-display text-lg text-stone-900">Meer over stress na 40?</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{artikel.stressPillarTurbo}</p>
            <Link
              href="/stress-verminderen-man"
              className="mt-3 inline-block text-sm font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
            >
              Lees de complete gids: Stress Verminderen na 40 →
            </Link>
          </aside>
        )}

        <div className="mt-16 max-w-[680px]">
          <section className="rounded-2xl bg-[#F7F5F0] px-6 py-10 text-center sm:px-10">
            <h2 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
              Persoonlijk inzicht in leefstijl en supplementen?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600">
              De Leefstijlcheck is een korte vragenlijst; het resultaat kan helpen prioriteiten te zetten — het is geen
              medische test en vervangt geen artsbezoek.
            </p>
            <Link
              href="/intake"
              className="mt-6 inline-block rounded-lg bg-[#3C7A56] px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#4A7F5A]"
            >
              Start de Leefstijlcheck →
            </Link>
          </section>
        </div>

        <div className="mt-14 max-w-[680px]">
          <BlogSamenvatting tekst={artikel.samenvatting} />
        </div>

        {artikel.supplementCTA && (
          <div className="mt-8 max-w-[680px]">
            <BlogSupplementCTA cta={artikel.supplementCTA} />
          </div>
        )}

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

        {gerelateerde.length > 0 && (
          <div className="mt-16">
            <BlogGerelateerd artikelen={gerelateerde} />
          </div>
        )}

        <div className="mt-16 max-w-[680px]">
          <ArticleReferentiesFooter
            referenties={artikel.referenties}
            laatstBijgewerktOp={laatst}
            verantwoordelijke={redacteur}
            aanvullendeDisclaimers={aanvullendeDisclaimerNodes}
          />
        </div>
      </Container>
    </div>
  );
}

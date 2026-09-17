import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import NutrientSourcesTable from "@/components/content/NutrientSourcesTable";
import NextStepBlock from "@/components/content/NextStepBlock";
import { nextStepForMetadata } from "@/lib/content-graph/next-step";
import { nutrientContent } from "@/data/content-graph/nutrient-content";
import {
  NUTRIENT_PAGES,
  NUTRIENT_PAGE_SLUGS,
  nutrientPageBySlug,
} from "@/data/nutrition/nutrient-pages";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import { nutrientBronnen } from "@/lib/nutrition-nutrient-index";
import { getUsableClaims } from "@/data/approved-claims";
import { absoluteUrl } from "@/lib/public-site-url";
import {
  buildArticleSchema,
  buildFaqSchema,
  buildNamedItemListSchema,
} from "@/lib/seo/structuredData";

/**
 * De voedingsstofpagina — het ontbrekende scharnier.
 *
 * Dit is de enige pagina-soort die artikel, voeding, check én supplement
 * tegelijk raakt. Tot nu toe sprong een lezer van een magnesium-artikel
 * rechtstreeks naar een vergelijking; de stof zelf had nergens een thuis.
 *
 * Alle data komt uit bestaande bronnen: de drempel uit `nutrient-routes.ts`,
 * de bronnen uit `food-sources.ts` via de omgekeerde index, de claims uit
 * `approved-claims.ts`, de artikelen uit `CONTENT_METADATA.nutrients`. Er staat
 * hier geen enkel getal dat niet ergens anders al beheerd wordt.
 *
 * Statisch gegenereerd: geen cookies, geen sessie. De personalisatie loopt via
 * de check, niet via deze pagina.
 */

const MAX_BRONNEN = 12;

const H2 =
  "scroll-mt-24 font-serif text-[1.5rem] leading-snug text-stone-900 md:text-[1.75rem]";
const PROSE = "mt-4 max-w-[68ch] text-[1.0625rem] leading-[1.75] text-stone-600";
const LINK =
  "font-medium text-emerald-800 underline decoration-emerald-700/35 underline-offset-[3px] transition hover:decoration-emerald-800";

type Props = { params: Promise<{ nutrient: string }> };

export function generateStaticParams() {
  return NUTRIENT_PAGE_SLUGS.map((nutrient) => ({ nutrient }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nutrient } = await params;
  const copy = nutrientPageBySlug(nutrient);
  if (!copy) return {};
  const url = absoluteUrl(`/voedingsstoffen/${copy.slug}`);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: "article",
      url,
    },
  };
}

export default async function NutrientPage({ params }: Props) {
  const { nutrient: slug } = await params;
  const copy = nutrientPageBySlug(slug);
  if (!copy) notFound();

  const content = nutrientContent(copy.nutrient);
  const reference = nutrientReferences[copy.nutrient];
  const route = nutrientRoute(copy.nutrient);
  const bronnen = nutrientBronnen(copy.nutrient, { limiet: MAX_BRONNEN });
  const claims = getUsableClaims(reference.claimKey);
  const pad = `/voedingsstoffen/${copy.slug}`;

  // De vervolgstap is dezelfde resolver als onder artikelen: de stof wint van
  // het thema, dus dit komt altijd op de voedingscheck uit.
  const vervolgstap = nextStepForMetadata({
    theme: "nutrition",
    nutrients: [copy.nutrient],
  });

  // De Breadcrumbs-component zendt zijn eigen BreadcrumbList uit; hem hier
  // herhalen zou twee keer hetzelfde schema op de pagina zetten.
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Voedingsstoffen", href: "/voedingsstoffen" },
    { label: content.label },
  ];

  const jsonLd = [
    buildArticleSchema({
      headline: copy.h1,
      description: copy.metaDescription,
      path: pad,
      datePublished: "2026-09-17",
    }),
    buildFaqSchema(
      copy.faq.map((item) => ({ question: item.vraag, answer: item.antwoord })),
    ),
    buildNamedItemListSchema(
      `Voedingsbronnen van ${content.label.toLowerCase()}`,
      bronnen.regels.map((regel) => ({ name: regel.labelNl, url: pad })),
    ),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-10 md:py-14">
        <Container>
          <Breadcrumbs items={breadcrumbs} />

          <article className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {content.groep === "macro" ? "Macronutriënt" : "Micronutriënt"}
            </p>
            <h1 className="mt-3 max-w-[22ch] text-balance font-serif text-[2rem] leading-[1.15] text-stone-900 md:text-[2.5rem]">
              {copy.h1}
            </h1>
            <p className={PROSE}>{copy.intro}</p>

            {/* Antwoord-eerst: de kern zonder scrollen, ook voor AI-zoeksystemen. */}
            <ul className="mt-8 max-w-[68ch] space-y-2.5 rounded-2xl border border-stone-200/90 bg-stone-50/70 px-6 py-5">
              {copy.kernpunten.map((punt) => (
                <li key={punt} className="flex gap-3 text-[0.9375rem] leading-relaxed text-stone-700">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ps-green" />
                  <span>{punt}</span>
                </li>
              ))}
            </ul>

            <section className="mt-14" aria-labelledby="wat-doet-het">
              <h2 id="wat-doet-het" className={H2}>
                Wat {content.label.toLowerCase()} doet
              </h2>
              {claims.length > 0 ? (
                <>
                  <p className={PROSE}>
                    Dit zijn de gezondheidsclaims die in de EU zijn goedgekeurd
                    voor {content.label.toLowerCase()}. Ze gelden bij voldoende
                    inname — meer dan voldoende maakt ze niet sterker.
                  </p>
                  <ul className="mt-5 max-w-[68ch] space-y-3">
                    {claims.map((claim) => (
                      <li
                        key={claim.id}
                        className="rounded-xl border border-stone-200/90 bg-white px-5 py-4 text-[0.9375rem] leading-relaxed text-stone-700"
                      >
                        {claim.text}
                        {claim.condition ? (
                          <span className="mt-1 block text-[13px] text-stone-500">
                            {claim.condition}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className={PROSE}>
                  Voor {content.label.toLowerCase()} bestaat er geen Europees
                  goedgekeurde gezondheidsclaim. Dat betekent niet dat de stof
                  niets doet, wel dat wij er geen effect aan mogen toeschrijven.
                </p>
              )}
            </section>

            <section className="mt-14" aria-labelledby="waar-zit-het-in">
              <h2 id="waar-zit-het-in" className={H2}>
                Waar {content.label.toLowerCase()} in zit
              </h2>
              <p className={PROSE}>{route.boardEffortNl}</p>
              <div className="mt-6">
                <NutrientSourcesTable
                  lijst={bronnen}
                  caption={`Voedingsbronnen van ${content.label.toLowerCase()}, per portie`}
                />
              </div>
            </section>

            <section className="mt-14" aria-labelledby="hoeveel">
              <h2 id="hoeveel" className={H2}>
                Hoeveel je nodig hebt
              </h2>
              <p className={PROSE}>
                <strong className="font-semibold text-stone-900">
                  {route.thresholdNl}
                </strong>
                {route.sourceNl ? (
                  <span className="text-stone-500"> — {route.sourceNl}</span>
                ) : null}
              </p>
              {/*
                De eerlijkheid over hoe hard die drempel is, staat er direct
                naast. Bij magnesium en zink meet de check de stof niet: hij
                telt porties van de bronnen. Dat verzwijgen zou een precisie
                claimen die het instrument niet heeft.
              */}
              {route.thresholdKind === "proxy" ? (
                <p className="mt-4 max-w-[68ch] rounded-xl border border-amber-200/70 bg-amber-50/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-amber-900">
                  {route.measurementCaveatNl ??
                    "Wij meten dit met de frequentie waarin je de bronnen eet, niet met milligrammen. Dat geeft een richting, geen uitslag."}
                </p>
              ) : null}
              <p className={PROSE}>{reference.confidenceWhy}</p>
            </section>

            <section className="mt-14" aria-labelledby="waarom-na-30">
              <h2 id="waarom-na-30" className={H2}>
                Waarom dit na je dertigste verandert
              </h2>
              {copy.waaromNa30.map((alinea) => (
                <p key={alinea} className={PROSE}>
                  {alinea}
                </p>
              ))}
            </section>

            <section className="mt-14" aria-labelledby="wanneer-aanvullen">
              <h2 id="wanneer-aanvullen" className={H2}>
                Wanneer voeding niet genoeg is
              </h2>
              <p className={PROSE}>{route.boardCannotCoverNl}</p>
              <p className={PROSE}>
                Of dat voor jou geldt, hangt af van wat er nu op je bord ligt.
                Dat is precies wat de voedingscheck uitleest — en pas als daar
                een gat zit, gaat de vergelijking ergens over.
              </p>

              <div className="mt-8">
                <NextStepBlock
                  step={vervolgstap}
                  node={copy.slug}
                  nodeType="nutrient"
                />
              </div>

              <p className="mt-6 max-w-[68ch] text-[0.9375rem] leading-relaxed text-stone-600">
                Wil je eerst lezen waar je op let bij een supplement?{" "}
                <Link href={content.guidePath} className={LINK}>
                  De {content.label.toLowerCase()}gids
                </Link>{" "}
                legt de vormen en het etiket uit;{" "}
                <Link href={content.comparisonPath} className={LINK}>
                  de vergelijking
                </Link>{" "}
                zet de producten naast elkaar.
              </p>
            </section>

            <section className="mt-14" aria-labelledby="vragen">
              <h2 id="vragen" className={H2}>
                Veelgestelde vragen
              </h2>
              <dl className="mt-6 max-w-[68ch] space-y-6">
                {copy.faq.map((item) => (
                  <div key={item.vraag}>
                    <dt className="font-semibold text-stone-900">{item.vraag}</dt>
                    <dd className="mt-2 leading-relaxed text-stone-600">
                      {item.antwoord}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {content.insights.length > 0 ? (
              <section className="mt-14" aria-labelledby="meer-lezen">
                <h2 id="meer-lezen" className={H2}>
                  Meer over {content.label.toLowerCase()}
                </h2>
                <ul className="mt-6 grid max-w-[68ch] gap-3">
                  {content.insights.slice(0, 6).map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={item.href}
                        className="block rounded-xl border border-stone-200/80 bg-white px-5 py-4 text-[0.9375rem] font-medium text-stone-800 transition hover:border-ps-green/45 hover:text-ps-green"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[0.9375rem] text-stone-600">
                  Of begin bij{" "}
                  <Link href={content.pillarPath} className={LINK}>
                    de volledige aanpak voor voeding na je dertigste
                  </Link>
                  .
                </p>
              </section>
            ) : null}

            <div className="mt-14">
              <MedicalDisclaimer />
            </div>
          </article>
        </Container>
      </main>
    </>
  );
}

export const NUTRIENT_PAGE_COUNT = Object.keys(NUTRIENT_PAGES).length;

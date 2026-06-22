import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import ContentCard, {
  INSIGHT_TYPE_LABELS,
} from "@/components/insights/ContentCard";
import FeaturedInsightCard from "@/components/insights/FeaturedInsightCard";
import FocusAreaCard from "@/components/insights/FocusAreaCard";
import SupplementsRouteBlock from "@/components/insights/SupplementsRouteBlock";
import {
  BLOG_BG_CLASS,
  BLOG_HERO_H1,
  BLOG_HERO_INTRO,
  BLOG_HERO_PB,
  BLOG_HERO_PT,
} from "@/components/blog/blog-layout";
import { PILLAR, PILLARS } from "@/data/dashboard";
import {
  buildInsightFilterHref,
  filterInsights,
  getRecentInsights,
  INSIGHT_TYPES_IN_DATA,
} from "@/data/insights";
import { canonicalMetadata } from "@/lib/seo/canonical";
import type { PillarId } from "@/types/dashboard";
import type { InsightType } from "@/types/insight";

export const metadata: Metadata = {
  title: "Inzichten — Artikelen & Begrippen per Domein | PerfectSupplement",
  description:
    "Artikelen, deep dives en begrippen over slaap, stress, energie en herstel — gefilterd op wat voor jou relevant is. Start met je domein of doe de Leefstijlcheck.",
  ...canonicalMetadata("/inzichten"),
};

const VALID_PIJLERS = new Set<PillarId>(
  PILLARS.map((pillar) => pillar.id),
);

const VALID_TYPES = new Set<InsightType>([
  "artikel",
  "deepdive",
  "begrip",
]);

function parsePijler(value: string | undefined): PillarId | undefined {
  if (!value || !VALID_PIJLERS.has(value as PillarId)) return undefined;
  return value as PillarId;
}

function parseType(value: string | undefined): InsightType | undefined {
  if (!value || !VALID_TYPES.has(value as InsightType)) return undefined;
  return value as InsightType;
}

function chipClass(active: boolean): string {
  return active
    ? "border-stone-900 bg-stone-900 text-white"
    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50";
}

type InzichtenPageProps = {
  searchParams: Promise<{ pijler?: string; type?: string }>;
};

export default async function InzichtenPage({ searchParams }: InzichtenPageProps) {
  const { pijler: pijlerParam, type: typeParam } = await searchParams;
  const activePijler = parsePijler(pijlerParam);
  const activeType = parseType(typeParam);
  const recent = getRecentInsights(3);

  const filtered = filterInsights({
    pijler: activePijler,
    type: activeType,
  });
  const showFeatured = !activePijler && !activeType && filtered.length > 0;
  const gridItems = showFeatured ? filtered.slice(1) : filtered;

  const hubRoute = activePijler
    ? PILLAR[activePijler].hubRoute
    : "/slaap-verbeteren-na-40";
  const hubLabel = activePijler
    ? PILLAR[activePijler].label
    : "Slaap";

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
                    name: "Inzichten",
                    item: "https://perfectsupplement.nl/inzichten",
                  },
                ],
              },
              {
                "@type": "CollectionPage",
                name: "Inzichten",
                description:
                  "Artikelen, deep dives en begrippen over slaap, stress, energie en herstel voor mannen boven de 40.",
                url: "https://perfectsupplement.nl/inzichten",
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

      <main className={BLOG_BG_CLASS}>
        <section className={`${BLOG_HERO_PT} ${BLOG_HERO_PB}`}>
          <Container>
            <nav aria-label="Breadcrumb" className="mb-12 md:mb-16">
              <ol className="flex items-center gap-2 text-[0.8125rem] tracking-wide text-stone-400">
                <li>
                  <Link href="/" className="transition hover:text-stone-600">
                    Home
                  </Link>
                </li>
                <li aria-hidden className="select-none">
                  ›
                </li>
                <li className="font-medium text-stone-600">Inzichten</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-3 md:mb-8">
                <div className="h-px w-8 bg-stone-300/90" aria-hidden />
                <p className="ps-eyebrow tracking-[0.14em]">Inzichten</p>
              </div>
              <h1 className={`${BLOG_HERO_H1} md:leading-[1.05]`}>
                Alles wat je lichaam probeert te vertellen — per domein
              </h1>
              <p className={`${BLOG_HERO_INTRO} mt-8 md:mt-10`}>
                Artikelen, deep dives en begrippen uit één feed. Filter op het
                domein dat voor jou speelt: slaap, stress, energie, voeding,
                beweging of herstel.
              </p>
            </div>
          </Container>
        </section>

        {!activePijler && !activeType && (
          <>
            <section aria-label="Verken per domein" className="pb-8 md:pb-10">
              <Container>
                <h2 className="mb-5 font-serif text-xl text-stone-900 md:text-2xl">
                  Verken per domein
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {PILLARS.map((p) => (
                    <FocusAreaCard key={p.id} pillarId={p.id} />
                  ))}
                </div>
              </Container>
            </section>

            {recent.length > 0 && (
              <section aria-label="Net verschenen" className="pb-8 md:pb-10">
                <Container>
                  <h2 className="mb-5 font-serif text-xl text-stone-900 md:text-2xl">
                    Net verschenen
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {recent.map((item) => (
                      <ContentCard
                        key={`${item.source}-${item.slug}`}
                        item={item}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            )}
          </>
        )}

        <section aria-label="Filters" className="pb-8 md:pb-10">
          <Container>
            <div className="space-y-6 rounded-2xl border border-stone-200/70 bg-white/90 p-6 ring-1 ring-stone-200/40 md:p-8">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                  Domein
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildInsightFilterHref({ type: activeType })}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${chipClass(!activePijler)}`}
                  >
                    Alles
                  </Link>
                  {PILLARS.map((pillar) => (
                    <Link
                      key={pillar.id}
                      href={buildInsightFilterHref({
                        pijler: pillar.id,
                        type: activeType,
                      })}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${chipClass(activePijler === pillar.id)}`}
                    >
                      {pillar.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                  Type
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildInsightFilterHref({ pijler: activePijler })}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${chipClass(!activeType)}`}
                  >
                    Alles
                  </Link>
                  {INSIGHT_TYPES_IN_DATA.map((type) => (
                    <Link
                      key={type}
                      href={buildInsightFilterHref({
                        pijler: activePijler,
                        type,
                      })}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${chipClass(activeType === type)}`}
                    >
                      {INSIGHT_TYPE_LABELS[type]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section aria-label="Content" className="pb-20 md:pb-28">
          <Container>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-stone-200/70 bg-white/90 p-10 text-center ring-1 ring-stone-200/40">
                <p className="text-stone-600">
                  Geen artikelen voor deze combinatie.
                </p>
                <Link
                  href="/inzichten"
                  className="mt-4 inline-block text-sm font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
                >
                  Wis filters
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-end justify-between md:mb-8">
                  <h2 className="font-serif text-xl text-stone-900 md:text-2xl">
                    {activePijler || activeType ? "Resultaten" : "Alle inzichten"}
                  </h2>
                  <span className="text-sm text-stone-500">
                    {filtered.length} {filtered.length === 1 ? "inzicht" : "inzichten"}
                  </span>
                </div>
                {showFeatured ? (
                  <FeaturedInsightCard item={filtered[0]} />
                ) : null}
                {gridItems.length > 0 ? (
                  <div
                    className={`${showFeatured ? "mt-5 lg:mt-6 " : ""}grid gap-5 sm:grid-cols-2 lg:gap-6`}
                  >
                    {gridItems.map((item) => (
                      <ContentCard
                        key={`${item.source}-${item.slug}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            )}

            <aside className="mx-auto mt-16 max-w-2xl border-t border-stone-200/80 pt-14 md:mt-20 md:pt-16">
              <p className="text-sm leading-relaxed text-stone-600">
                Wil je weten waar jij staat op{" "}
                {activePijler ? hubLabel.toLowerCase() : "slaap, stress en energie"}?
                De{" "}
                <Link
                  href="/intake"
                  className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
                >
                  Leefstijlcheck
                </Link>{" "}
                geeft je zes scores en een persoonlijk profiel — in ongeveer vijf
                minuten.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                Meer context per domein vind je in onze{" "}
                <Link
                  href={hubRoute}
                  className="font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green"
                >
                  {hubLabel}-gids
                </Link>
                . Daar lees je wat werkt vóór je aan supplementen denkt.
              </p>
            </aside>
          </Container>
        </section>
        <SupplementsRouteBlock />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import ContentCard from "@/components/insights/ContentCard";
import FeaturedInsightCard from "@/components/insights/FeaturedInsightCard";
import FocusAreaCard from "@/components/insights/FocusAreaCard";
import InzichtenFilterBar from "@/components/insights/InzichtenFilterBar";
import InzichtenHubHero from "@/components/insights/InzichtenHubHero";
import SupplementsRouteBlock from "@/components/insights/SupplementsRouteBlock";
import { BLOG_BG_CLASS, BLOG_HERO_PT } from "@/components/blog/blog-layout";
import { PILLAR, PILLARS } from "@/data/dashboard";
import {
  filterInsights,
  getInsightsByPijler,
  getRecentInsights,
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

type InzichtenPageProps = {
  searchParams: Promise<{ pijler?: string; type?: string; alles?: string }>;
};

export default async function InzichtenPage({ searchParams }: InzichtenPageProps) {
  const { pijler: pijlerParam, type: typeParam, alles } = await searchParams;
  const activePijler = parsePijler(pijlerParam);
  const activeType = parseType(typeParam);
  const allesActive = alles === "1";
  const isFeed = Boolean(activePijler || activeType || allesActive);

  const articleCounts = Object.fromEntries(
    PILLARS.map((p) => [p.id, getInsightsByPijler(p.id).length]),
  ) as Record<PillarId, number>;
  const hubFeatured = getRecentInsights(1)[0];
  const latestInsights = getRecentInsights(3);

  const filtered = filterInsights({
    pijler: activePijler,
    type: activeType,
  });
  const showFeatured = isFeed && filtered.length > 0;
  const gridItems = showFeatured ? filtered.slice(1) : filtered;

  const hubRoute = activePijler
    ? PILLAR[activePijler].hubRoute
    : "/slaap-verbeteren-na-40";
  const hubLabel = activePijler ? PILLAR[activePijler].label : "Slaap";

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
        {!isFeed ? (
          <>
            <InzichtenHubHero />

            <section aria-label="Verken per domein" className="pb-4 md:pb-6">
              <Container>
                <div className="mb-5 md:mb-6">
                  <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
                    Leefstijl — start hier
                  </p>
                  <h2 className="mt-2 font-display text-[28px] font-normal text-stone-900">
                    Zes domeinen, één systeem
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {PILLARS.map((p) => (
                    <FocusAreaCard
                      key={p.id}
                      pillarId={p.id}
                      articleCount={articleCounts[p.id]}
                    />
                  ))}
                </div>
              </Container>
            </section>

            {hubFeatured ? (
              <section aria-label="Uitgelicht" className="pb-4 md:pb-6">
                <Container>
                  <FeaturedInsightCard item={hubFeatured} />
                </Container>
              </section>
            ) : null}

            <SupplementsRouteBlock />

            {latestInsights.length > 0 ? (
              <section aria-label="Net verschenen" className="pb-16 md:pb-20">
                <Container>
                  <div className="mb-5 flex items-end justify-between">
                    <h2 className="font-display text-[28px] font-normal text-stone-900">
                      Net verschenen
                    </h2>
                    <Link
                      href="/inzichten?alles=1"
                      className="text-sm font-semibold text-stone-700 transition hover:text-stone-900"
                    >
                      Alles bekijken →
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {latestInsights.map((item) => (
                      <ContentCard
                        key={`${item.source}-${item.slug}`}
                        item={item}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <section className={`${BLOG_HERO_PT} pb-9 md:pb-10`}>
              <Container>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
                  Inzichten
                </p>
                <h1 className="mt-3 max-w-[20ch] font-display text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.1] tracking-[-0.02em] text-stone-900">
                  Alles wat we weten over beter leven
                </h1>
                <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-stone-600">
                  Blog, guides, deep dives en begrippen — geordend naar de
                  leefstijlpijler waar ze bij horen. Filter op wat jou nu
                  bezighoudt.
                </p>
              </Container>
            </section>

            <InzichtenFilterBar
              activePijler={activePijler}
              activeType={activeType}
              count={filtered.length}
            />

            <section aria-label="Content" className="pb-16 md:pb-20">
              <Container>
                {filtered.length === 0 ? (
                  <div className="mt-6 rounded-[20px] border border-dashed border-[#D6D3D1] px-5 py-[70px] text-center">
                    <p className="text-base text-stone-500">
                      Geen artikelen voor deze combinatie.
                    </p>
                    <Link
                      href="/inzichten?alles=1"
                      className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#0E1A14] px-[22px] py-2.5 text-sm font-semibold text-[#F7F5F0] transition hover:bg-[#0E1A14]/90"
                    >
                      Wis filters
                    </Link>
                  </div>
                ) : (
                  <>
                    {showFeatured ? (
                      <div className="mt-6">
                        <FeaturedInsightCard item={filtered[0]} />
                      </div>
                    ) : null}
                    {gridItems.length > 0 ? (
                      <div
                        className={`${showFeatured ? "mt-7 " : "mt-6 "}grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}
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
              </Container>
            </section>

            <section className="pb-16 md:pb-20">
              <Container>
                <aside className="mx-auto max-w-2xl border-t border-[#E7E5E4] pt-10">
                  <p className="text-sm leading-relaxed text-stone-600">
                    Wil je weten waar jij staat op{" "}
                    {activePijler
                      ? hubLabel.toLowerCase()
                      : "slaap, stress en energie"}
                    ? De{" "}
                    <Link
                      href="/intake"
                      className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]"
                    >
                      Leefstijlcheck
                    </Link>{" "}
                    geeft je zes scores en een persoonlijk profiel — in
                    ongeveer vijf minuten.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-stone-600">
                    Meer context per domein vind je in onze{" "}
                    <Link
                      href={hubRoute}
                      className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]"
                    >
                      {hubLabel}-gids
                    </Link>
                    . Daar lees je wat werkt vóór je aan supplementen denkt.
                  </p>
                </aside>
              </Container>
            </section>
          </>
        )}
      </main>
    </>
  );
}

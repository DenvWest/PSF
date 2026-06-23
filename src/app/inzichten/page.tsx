import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import ContentCard from "@/components/insights/ContentCard";
import FeaturedInsightCard from "@/components/insights/FeaturedInsightCard";
import FocusAreaCard from "@/components/insights/FocusAreaCard";
import InzichtenContextStrip from "@/components/insights/InzichtenContextStrip";
import InzichtenFilterBar from "@/components/insights/InzichtenFilterBar";
import InzichtenHubHero from "@/components/insights/InzichtenHubHero";
import InzichtenPremiumKennisbank from "@/components/insights/InzichtenPremiumKennisbank";
import InzichtenPremiumKennisbankUpsell from "@/components/insights/InzichtenPremiumKennisbankUpsell";
import SupplementsRouteBlock from "@/components/insights/SupplementsRouteBlock";
import { BLOG_BG_CLASS, BLOG_HERO_PT } from "@/components/blog/blog-layout";
import { PILLAR, PILLARS } from "@/data/dashboard";
import {
  filterInsights,
  getInsightsByPijler,
  getPremiumKennisbankInsights,
  getRecentInsights,
} from "@/data/insights";
import { getInzichtenVisitorContext } from "@/lib/inzichten-visitor-context";
import { canonicalMetadata } from "@/lib/seo/canonical";
import type { PillarId } from "@/types/dashboard";
import type { InsightItem, InsightType } from "@/types/insight";

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
  searchParams: Promise<{
    pijler?: string;
    type?: string;
    alles?: string;
    kennisbank?: string;
  }>;
};

export default async function InzichtenPage({ searchParams }: InzichtenPageProps) {
  const {
    pijler: pijlerParam,
    type: typeParam,
    alles,
    kennisbank: kennisbankParam,
  } = await searchParams;
  const activePijler = parsePijler(pijlerParam);
  const activeType = parseType(typeParam);
  const allesActive = alles === "1";
  const isPremiumFeed = kennisbankParam === "premium";
  const isFeed = Boolean(
    activePijler || activeType || allesActive || isPremiumFeed,
  );

  const visitorContext = await getInzichtenVisitorContext();
  const hasContext = Boolean(visitorContext);

  const articleCounts = Object.fromEntries(
    PILLARS.map((p) => [p.id, getInsightsByPijler(p.id).length]),
  ) as Record<PillarId, number>;

  const orderedPillarIds =
    visitorContext?.orderedPillarIds ?? PILLARS.map((p) => p.id);

  const priorityItems: InsightItem[] = visitorContext
    ? filterInsights({ pijler: visitorContext.priorityPillarId })
    : [];

  let hubFeatured: InsightItem | undefined;
  let bottomGridItems: InsightItem[] = [];
  let bottomSectionLabel = "Net verschenen";
  let bottomSectionSubcopy: string | null = null;
  let bottomSectionLink: { href: string; label: string } | null = {
    href: "/inzichten?alles=1",
    label: "Alles bekijken →",
  };

  if (hasContext && !isFeed && priorityItems.length > 0) {
    hubFeatured = priorityItems[0];
    bottomGridItems = priorityItems.slice(1, 4);
    bottomSectionLabel = "Speelt voor jou nu";
    bottomSectionSubcopy =
      "Op basis van je laatste check-in — niet je clicks";
    bottomSectionLink = {
      href: `/inzichten?pijler=${visitorContext!.priorityPillarId}`,
      label: `Alles over ${visitorContext!.priorityLabel.toLowerCase()} →`,
    };
  } else if (!isFeed) {
    hubFeatured = getRecentInsights(1)[0];
    bottomGridItems = getRecentInsights(3);
  }

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

  const premiumFeedCount =
    isPremiumFeed && hasContext
      ? getPremiumKennisbankInsights(
          activePijler ? { pijler: activePijler } : undefined,
        ).length
      : 0;

  if (isPremiumFeed && !hasContext) {
    return (
      <main className={BLOG_BG_CLASS}>
        <InzichtenPremiumKennisbankUpsell />
      </main>
    );
  }

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

            {hasContext ? (
              <InzichtenContextStrip
                priorityPillarId={visitorContext!.priorityPillarId}
                priorityLabel={visitorContext!.priorityLabel}
                profileLabel={visitorContext!.profileLabel}
              />
            ) : null}

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
                  {orderedPillarIds.map((pillarId) => (
                    <FocusAreaCard
                      key={pillarId}
                      pillarId={pillarId}
                      articleCount={articleCounts[pillarId]}
                      highlight={
                        hasContext &&
                        pillarId === visitorContext!.priorityPillarId
                      }
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

            {hasContext ? (
              <InzichtenPremiumKennisbank
                priorityPillarId={visitorContext!.priorityPillarId}
                priorityLabel={visitorContext!.priorityLabel}
              />
            ) : null}

            <SupplementsRouteBlock />

            {bottomGridItems.length > 0 ? (
              <section
                aria-label={bottomSectionLabel}
                className="pb-16 md:pb-20"
              >
                <Container>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-display text-[28px] font-normal text-stone-900">
                        {bottomSectionLabel}
                      </h2>
                      {bottomSectionSubcopy ? (
                        <p className="mt-1 text-sm text-stone-500">
                          {bottomSectionSubcopy}
                        </p>
                      ) : null}
                    </div>
                    {bottomSectionLink ? (
                      <Link
                        href={bottomSectionLink.href}
                        className="shrink-0 text-sm font-semibold text-stone-700 transition hover:text-stone-900"
                      >
                        {bottomSectionLink.label}
                      </Link>
                    ) : null}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {bottomGridItems.map((item) => (
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
        ) : isPremiumFeed ? (
          <>
            <section className={`${BLOG_HERO_PT} pb-9 md:pb-10`}>
              <Container>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5A8F6A]">
                  Verdiepende begrippen
                </p>
                <h1 className="mt-3 max-w-[24ch] font-display text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.1] tracking-[-0.02em] text-stone-900">
                  Kennisbank na je check-in
                </h1>
                <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-stone-600">
                  Verdiepende begrippen uit de kennisbank — gekoppeld aan wat je
                  in je dashboard ziet. Geen losse SEO-feed: dit is je
                  {activePijler
                    ? ` ${hubLabel.toLowerCase()}-context`
                    : " persoonlijke context"}
                  .
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {premiumFeedCount}{" "}
                  {premiumFeedCount === 1 ? "begrip" : "begrippen"}
                </p>
              </Container>
            </section>

            {hasContext ? (
              <InzichtenContextStrip
                priorityPillarId={visitorContext!.priorityPillarId}
                priorityLabel={visitorContext!.priorityLabel}
                profileLabel={visitorContext!.profileLabel}
                variant="feed"
              />
            ) : null}

            {hasContext ? (
              <InzichtenPremiumKennisbank
                priorityPillarId={visitorContext!.priorityPillarId}
                priorityLabel={visitorContext!.priorityLabel}
                mode="feed"
                feedPijler={activePijler}
              />
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

            {hasContext ? (
              <InzichtenContextStrip
                priorityPillarId={visitorContext!.priorityPillarId}
                priorityLabel={visitorContext!.priorityLabel}
                variant="feed"
              />
            ) : null}

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

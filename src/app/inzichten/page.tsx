import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
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
  INSIGHT_TYPES_IN_DATA,
} from "@/data/insights";
import { canonicalMetadata } from "@/lib/seo/canonical";
import type { PillarId } from "@/types/dashboard";
import type { InsightItem, InsightType } from "@/types/insight";

export const metadata: Metadata = {
  title: "Inzichten — Artikelen & Begrippen per Domein | PerfectSupplement",
  description:
    "Artikelen, deep dives en begrippen over slaap, stress, energie en herstel — gefilterd op wat voor jou relevant is. Start met je domein of doe de Leefstijlcheck.",
  ...canonicalMetadata("/inzichten"),
};

const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  artikel: "Artikel",
  deepdive: "Deep dive",
  begrip: "Begrip",
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

function InsightCard({ item }: { item: InsightItem }) {
  const pijlerLabel = PILLAR[item.pijler].label;
  const typeLabel = INSIGHT_TYPE_LABELS[item.type];

  return (
    <article className="flex min-h-0 flex-col rounded-2xl border border-stone-200/60 border-l-2 border-l-stone-400 bg-[var(--ps-surface)] p-7 shadow-sm shadow-stone-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
      <Link href={item.href} className="group flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-700">
            {pijlerLabel}
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-600">
            {typeLabel}
          </span>
          {item.readingTime ? (
            <span>{item.readingTime} leestijd</span>
          ) : null}
        </div>

        <h2 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-stone-900 transition group-hover:text-stone-700 md:text-xl">
          {item.title}
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
          {item.excerpt}
        </p>

        <p className="mt-auto pt-6 text-sm text-stone-500 transition group-hover:text-stone-700">
          Lees →
        </p>
      </Link>
    </article>
  );
}

export default async function InzichtenPage({ searchParams }: InzichtenPageProps) {
  const { pijler: pijlerParam, type: typeParam } = await searchParams;
  const activePijler = parsePijler(pijlerParam);
  const activeType = parseType(typeParam);

  const filtered = filterInsights({
    pijler: activePijler,
    type: activeType,
  });

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
              <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
                {filtered.map((item) => (
                  <InsightCard key={`${item.source}-${item.slug}`} item={item} />
                ))}
              </div>
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
      </main>
    </>
  );
}

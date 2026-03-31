import Link from "next/link";
import AffiliateLink from "@/components/content/AffiliateLink";
import { BlogArticleIntro } from "@/components/blog/BlogArticleIntro";
import { DisclosureTable } from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import { omega3Products } from "@/data/products/omega3";
import type { AffiliateSlug } from "@/data/affiliate-links";
import {
    comparisonCriteria,
    comparisonTableRows,
    ctaTrustLines,
    decisionGuide,
    omega3WatchPoints,
    pageTrustSignals,
    topThree,
} from "@/features/omega3/data/omega-3-vergelijken";

export function generateMetadata() {
    return buildArticlePageMetadata("omega-3-vergelijken");
}

const relatedPages = [
    {
        href: "/wat-is-omega-3",
        title: "Wat is omega 3?",
        description: "Begin bij de basis als je de verschillen eerst beter wilt begrijpen.",
    },
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega 3?",
        description: "Praktische uitleg over welke criteria echt iets zeggen.",
    },
    {
        href: "/beste-omega-3-supplement",
        title: "Beste omega 3 supplement",
        description: "Ga direct naar de selectie met topkeuze, gummies en algenolie.",
    },
    {
        href: "/methodologie",
        title: "Onze methodologie",
        description: "Lees hoe vergelijkingen en rankings worden opgebouwd.",
    },
];

function scoreByAffiliate(slug: AffiliateSlug): number {
    return omega3Products.find((p) => p.affiliateSlug === slug)?.score ?? 0;
}

function StarRow({ score }: { score: number }) {
    const filled = Math.round((score / 10) * 5 * 2) / 2;
    const full = Math.floor(filled);
    const half = filled - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
        <span
            className="inline-flex items-center gap-0.5 text-amber-500"
            aria-label={`Score ${score} van 10`}
        >
            {Array.from({ length: full }).map((_, i) => (
                <span key={`f-${i}`}>★</span>
            ))}
            {half ? <span className="text-amber-400">★</span> : null}
            {Array.from({ length: empty }).map((_, i) => (
                <span key={`e-${i}`} className="text-stone-200">
                    ★
                </span>
            ))}
        </span>
    );
}

function CtaTrustBlock() {
    return (
        <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-stone-500">
            {ctaTrustLines.map((line) => (
                <li key={line} className="flex gap-2">
                    <span className="shrink-0 text-emerald-600" aria-hidden>
                        ✔
                    </span>
                    <span>{line}</span>
                </li>
            ))}
        </ul>
    );
}

const ctaButtonClass =
    "inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900";

const secondaryCardClass =
    "group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-md";

export default function OmegaComparisonPage() {
    const post = getBlogPostBySlug("omega-3-vergelijken");
    if (!post) {
        throw new Error("Blog post omega-3-vergelijken ontbreekt");
    }

    const [first, second, third] = topThree;

    return (
        <main className="text-stone-900">
            <article>
                {/* Hero */}
                <section className="border-b border-stone-200 bg-gradient-to-b from-stone-50 to-white">
                    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
                        <BlogArticleIntro post={post} />
                        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                            Beste omega 3 supplementen van 2026
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
                            Onafhankelijke vergelijking op EPA/DHA, vorm en prijs per dag — zodat je snel de juiste keuze
                            maakt.
                        </p>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-500">
                            Geen marketingruis: alleen criteria die het verschil maken voor jouw portemonnee en je
                            gezondheidsdoelen.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-2 text-sm text-stone-600">
                            {pageTrustSignals.map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"
                                >
                                    <span className="text-emerald-600" aria-hidden>
                                        ✔
                                    </span>
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <a
                                href="#top-3"
                                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                            >
                                Bekijk top 3
                            </a>
                            <a
                                href="#vergelijking"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-300"
                            >
                                Naar vergelijkingstabel
                            </a>
                        </div>

                        <p className="mt-8 max-w-2xl rounded-xl border border-stone-200 bg-white/90 px-4 py-3 text-sm leading-relaxed text-stone-500">
                            <span className="font-medium text-stone-700">Transparantie:</span> deze pagina bevat
                            affiliatelinks. Bij een aankoop via een link kan de aanbieder korting geven en wij een
                            vergoeding ontvangen — zonder extra kosten voor jou.
                        </p>
                    </div>
                </section>

                {/* Top 3 */}
                <section id="top-3" className="scroll-mt-24 border-b border-stone-100 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                Top 3 omega-3 supplementen
                            </h2>
                            <p className="mt-2 text-stone-600">
                                Onze keuze voor beste totaalpakket, het beste alternatief, en een budgetvriendelijke
                                instap — met duidelijke verschillen per kaart.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
                            {/* #1 — dominant */}
                            <div className="lg:col-span-7">
                                <article
                                    className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50/90 via-white to-stone-50 p-8 shadow-lg shadow-amber-900/5 transition hover:border-amber-400/70 hover:shadow-xl md:p-10"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                            {first.badge}
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                                            {first.rankLabel}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                        {omega3Products.find((p) => p.affiliateSlug === first.affiliateSlug)?.name}
                                    </h3>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <StarRow score={scoreByAffiliate(first.affiliateSlug)} />
                                        <span className="text-sm font-semibold text-stone-800">
                                            {scoreByAffiliate(first.affiliateSlug).toFixed(1)}/10
                                        </span>
                                    </div>
                                    <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-stone-700">
                                        {first.usps.map((u) => (
                                            <li key={u} className="flex gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                {u}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-5 text-sm leading-relaxed text-stone-600">{first.shortDescription}</p>
                                    <div className="mt-auto pt-8">
                                        <AffiliateLink
                                            affiliateSlug={first.affiliateSlug}
                                            pageType="omega-3-vergelijken"
                                            position={`top3_best_${first.affiliateSlug}`}
                                            className={ctaButtonClass}
                                        >
                                            Bekijk actuele prijs →
                                        </AffiliateLink>
                                        <CtaTrustBlock />
                                    </div>
                                </article>
                            </div>

                            {/* #2 & #3 */}
                            <div className="flex flex-col gap-6 lg:col-span-5">
                                {[second, third].map((slot) => {
                                    const name = omega3Products.find(
                                        (p) => p.affiliateSlug === slot.affiliateSlug,
                                    )?.name;
                                    const score = scoreByAffiliate(slot.affiliateSlug);
                                    return (
                                        <article key={slot.affiliateSlug} className={secondaryCardClass}>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                                                    {slot.badge}
                                                </span>
                                                <span className="text-xs font-medium text-stone-500">{slot.rankLabel}</span>
                                            </div>
                                            <h3 className="mt-3 text-lg font-semibold text-stone-900">{name}</h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <StarRow score={score} />
                                                <span className="text-sm font-semibold text-stone-800">
                                                    {score.toFixed(1)}/10
                                                </span>
                                            </div>
                                            <ul className="mt-4 space-y-2 text-sm text-stone-600">
                                                {slot.usps.slice(0, 4).map((u) => (
                                                    <li key={u} className="flex gap-2">
                                                        <span className="text-stone-400">•</span>
                                                        <span>{u}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-3 text-sm leading-relaxed text-stone-500">{slot.shortDescription}</p>
                                            <div className="mt-5">
                                                <AffiliateLink
                                                    affiliateSlug={slot.affiliateSlug}
                                                    pageType="omega-3-vergelijken"
                                                    position={`top3_${slot.role}_${slot.affiliateSlug}`}
                                                    className={ctaButtonClass}
                                                >
                                                    Bekijk actuele prijs →
                                                </AffiliateLink>
                                                <CtaTrustBlock />
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>

                        <p className="mt-8 text-sm text-stone-500">
                            <span className="font-medium text-stone-700">Prijs per dag:</span> de scherpste €/dag in deze
                            vergelijking is Arctic Blue Visolie — zie ook de tabel hieronder.
                        </p>
                    </div>
                </section>

                {/* Comparison table */}
                <ContentSection
                    id="vergelijking"
                    title="Vergelijking in één oogopslag"
                    description="EPA/DHA, vorm, dagprijs en score — minimaal, scanbaar, met directe doorklik naar de aanbieder."
                >
                    <div className="mt-2 overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Product</th>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">EPA/DHA</th>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Vorm</th>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Prijs per dag</th>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Score</th>
                                    <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Actie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonTableRows.map((row) => (
                                    <tr
                                        key={row.product}
                                        className={
                                            row.isBest
                                                ? "border-t border-amber-200/80 bg-amber-50/60 transition hover:bg-amber-50"
                                                : "border-t border-stone-100 transition hover:bg-stone-50/80"
                                        }
                                    >
                                        <td className="px-4 py-4 font-medium text-stone-900">
                                            {row.isBest ? (
                                                <span className="mr-2 inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                                    Beste keuze
                                                </span>
                                            ) : null}
                                            {row.product}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-stone-700">{row.epaDha}</td>
                                        <td className="px-4 py-4 text-stone-700">{row.vorm}</td>
                                        <td className="whitespace-nowrap px-4 py-4 font-medium text-stone-900">
                                            {row.pricePerDay}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span className="font-semibold text-stone-900">{row.score}</span>
                                            <span className="text-stone-500">/10</span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <AffiliateLink
                                                affiliateSlug={row.affiliateSlug}
                                                pageType="omega-3-vergelijken"
                                                position={`table_row_${row.affiliateSlug}`}
                                                className="inline-flex min-w-[10rem] items-center justify-center rounded-lg bg-stone-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800 hover:shadow"
                                            >
                                                Bekijk actuele prijs →
                                            </AffiliateLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ul className="mt-4 flex flex-col gap-1.5 text-xs text-stone-500 sm:flex-row sm:flex-wrap sm:gap-x-8">
                        {ctaTrustLines.map((line) => (
                            <li key={line} className="flex items-center gap-2">
                                <span className="text-emerald-600" aria-hidden>
                                    ✔
                                </span>
                                {line}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-sm text-stone-500">
                        Meer achtergrond? Lees{" "}
                        <Link
                            href="/methodologie"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            hoe wij vergelijken
                        </Link>{" "}
                        of bekijk{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            alle beste keuzes
                        </Link>
                        .
                    </p>
                    <DisclosureTable />
                </ContentSection>

                {/* Educational */}
                <ContentSection
                    title="Waar moet je op letten bij omega 3?"
                    description="Korte checklist — alles wat je nodig hebt om etiketten en prijzen eerlijk te vergelijken."
                >
                    <ul className="grid gap-4 md:grid-cols-2">
                        {omega3WatchPoints.map((item) => (
                            <li
                                key={item.title}
                                className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 transition hover:border-stone-300"
                            >
                                <h3 className="font-semibold text-stone-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
                            </li>
                        ))}
                    </ul>
                </ContentSection>

                {/* Decision help */}
                <ContentSection
                    title="Welke keuze past bij jou?"
                    description="Drie veelvoorkomende profielen — met een concrete productaanbeveling per situatie."
                >
                    <div className="grid gap-5 md:grid-cols-3">
                        {decisionGuide.map((item) => (
                            <article
                                key={item.title}
                                className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-stone-300 hover:shadow-md"
                            >
                                <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                                <p className="mt-1 text-sm font-medium text-stone-700">{item.product}</p>
                                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{item.text}</p>
                                <AffiliateLink
                                    affiliateSlug={item.affiliateSlug}
                                    pageType="omega-3-vergelijken"
                                    position={`decision_${item.affiliateSlug}_${item.title}`}
                                    className={`${ctaButtonClass} mt-6 text-xs sm:text-sm`}
                                >
                                    Bekijk actuele prijs →
                                </AffiliateLink>
                                <CtaTrustBlock />
                            </article>
                        ))}
                    </div>
                </ContentSection>

                {/* How we compare — compact */}
                <ContentSection
                    title="Hoe wij vergelijken"
                    description="Consistente criteria — geen medisch advies, wel praktische vergelijkbaarheid."
                >
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 md:p-8">
                        <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                            We beoordelen supplementen op factoren die in de praktijk het meest uitmaken: dosering,
                            transparantie, gebruiksgemak, prijs per dag en toepasbaarheid. Zo blijft de vergelijking
                            scanbaar en eerlijk.{" "}
                            <Link
                                href="/wat-is-omega-3"
                                className="font-medium text-stone-800 underline-offset-4 hover:underline"
                            >
                                Wat is omega 3?
                            </Link>{" "}
                            ·{" "}
                            <Link
                                href="/waar-let-je-op-bij-omega-3"
                                className="font-medium text-stone-800 underline-offset-4 hover:underline"
                            >
                                Waar let je op?
                            </Link>
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {comparisonCriteria.map((criterion) => (
                                <span
                                    key={criterion}
                                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600"
                                >
                                    {criterion}
                                </span>
                            ))}
                        </div>
                    </div>
                </ContentSection>

                {/* Trust strip repeat */}
                <section className="border-y border-stone-100 bg-stone-50/50">
                    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
                        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10">
                            {pageTrustSignals.map((t) => (
                                <li key={t} className="flex items-center justify-center gap-2 text-sm text-stone-700">
                                    <span className="text-emerald-600" aria-hidden>
                                        ✔
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <RelatedPages
                    title="Gerelateerde pagina's"
                    description="Handige vervolgstappen als je vanuit vergelijken verder wilt in het omega-3 cluster."
                    items={relatedPages}
                />
            </article>
        </main>
    );
}

import Link from "next/link";
import ProductCard from "@/components/content/product-card";
import Disclosure, { DisclosureSmall, DisclosureTable } from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { getAffiliateRedirectPath } from "@/data/affiliate-links";
import { omega3Products } from "@/data/products/omega3";
import { formatPrice } from "@/lib/format-price";
import { faqs } from "@/features/omega3/data/beste-omega-3-supplement";

const topPicks = omega3Products
    .filter((p) => p.badge && p.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

const relatedPages = [
    {
        href: "/wat-is-omega-3",
        title: "Wat is omega 3?",
        description: "Een rustige basisuitleg voordat je producten of claims vergelijkt.",
    },
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega 3?",
        description: "Praktische houvast voor dosering, transparantie en prijs per dag.",
    },
    {
        href: "/omega-3-vergelijken",
        title: "Omega 3 vergelijken",
        description: "Bekijk alle populaire keuzes naast elkaar in een compact overzicht.",
    },
    {
        href: "/methodologie",
        title: "Onze methodologie",
        description: "Lees hoe deze selectie en rangschikking tot stand komt.",
    },
];

export default function BestOmegaPage() {
    return (
        <main className="bg-white text-slate-900">
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                            Omega 3 gids
                        </p>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                            Beste omega 3 supplementen van 2026
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                            Vergelijk populaire omega 3 supplementen op dosering, zuiverheid,
                            gebruiksgemak en prijs per dag. Zo kies je sneller een product dat
                            past bij jouw doel en budget.
                        </p>

                        <p className="mt-2 text-xs text-slate-400">Laatste update: maart 2026</p>

                        <Disclosure />

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#topkeuzes"
                                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800"
                            >
                                Bekijk topkeuzes
                            </a>

                            <Link
                                href="/omega-3-vergelijken"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                            >
                                Vergelijk supplementen
                            </Link>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Benieuwd hoe we beoordelen?{" "}
                            <Link
                                href="/methodologie"
                                className="text-slate-500 underline-offset-4 hover:underline"
                            >
                                Lees onze methodologie
                            </Link>
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">In deze gids</p>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li>• Topkeuzes voor verschillende budgetten</li>
                            <li>• Waar je op moet letten bij kwaliteit</li>
                            <li>• Compacte vergelijkingstabel</li>
                            <li>• Praktische keuzehulp voor beginners</li>
                        </ul>
                    </div>
                </div>
            </section>

            <ContentSection
                id="topkeuzes"
                title="Onze topkeuzes"
                description="Snelle keuzes voor bezoekers die niet eerst alles uitgebreid willen doorzoeken."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {topPicks.map((product) => (
                        <article
                            key={product.slug}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                                {product.badge}
                            </span>
                            <div className="mt-4 flex items-start justify-between gap-4">
                                <h3 className="text-xl font-semibold">{product.name}</h3>
                                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold">
                                    {product.score}/10
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
                            <ul className="mt-5 space-y-2 text-sm text-slate-600">
                                {product.pros.map((pro) => (
                                    <li key={pro}>• {pro}</li>
                                ))}
                            </ul>
                            <Link
                                href={getAffiliateRedirectPath(product.affiliateSlug)}
                                prefetch={false}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800"
                            >
                                Bekijk product
                            </Link>
                            <DisclosureSmall />
                        </article>
                    ))}
                </div>
            </ContentSection>

            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                    <p className="text-sm leading-6 text-slate-600">
                        Wil je eerst begrijpen waar je inhoudelijk op let — EPA, DHA, dosering per dag, prijs per dag en transparantie?{" "}
                        <Link
                            href="/waar-let-je-op-bij-omega-3"
                            className="font-medium text-green-700 underline-offset-4 hover:underline"
                        >
                            Lees de praktische gids
                        </Link>
                        {" "}voordat je doorklikt naar een product.
                    </p>
                </div>
            </div>

            <ContentSection
                title="Uitgelichte supplementen"
                description="Hieronder zie je een eerste selectie van producten in dezelfde vaste card-structuur."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {omega3Products.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Snel vergelijken"
                description="Deze compacte tabel helpt bezoekers sneller scannen voordat ze doorklikken."
            >
                <div className="overflow-x-auto rounded-3xl border border-slate-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">EPA / DHA</th>
                                <th className="px-4 py-3 font-semibold">Vorm</th>
                                <th className="px-4 py-3 font-semibold">Capsules / dag</th>
                                <th className="px-4 py-3 font-semibold">Prijs per dag</th>
                                <th className="px-4 py-3 font-semibold">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {omega3Products.map((product) => (
                                <tr key={product.slug} className="border-t border-slate-200">
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3">{product.epaMg} / {product.dhaMg} mg</td>
                                    <td className="px-4 py-3">{product.form}</td>
                                    <td className="px-4 py-3">{product.capsulesPerDay}</td>
                                    <td className="px-4 py-3">{formatPrice(product.pricePerDayEur)}</td>
                                    <td className="px-4 py-3">{product.score}/10</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <DisclosureTable />
            </ContentSection>

            <ContentSection
                title="Welke keuze past bij jou?"
                description="Niet iedereen zoekt hetzelfde. Daarom helpt een korte keuzehulp om sneller richting te geven."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {topPicks.map((product) => (
                        <div
                            key={product.slug}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold">{product.badge}</h3>
                            <p className="mt-1 text-sm font-medium text-green-700">{product.name}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
                            <Link
                                href={getAffiliateRedirectPath(product.affiliateSlug)}
                                prefetch={false}
                                className="mt-4 inline-flex items-center text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                            >
                                Bekijk product →
                            </Link>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Begin je nog helemaal aan het onderwerp? Lees dan eerst{" "}
                    <Link
                        href="/wat-is-omega-3"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        wat omega 3 is
                    </Link>
                    , zodat de verschillen tussen deze keuzes sneller logisch worden.
                </p>
            </ContentSection>

            <ContentSection
                title="Veelgestelde vragen"
                description="Een paar korte antwoorden op vragen die vaak terugkomen bij het vergelijken van omega 3 supplementen."
            >
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.question}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold">{faq.question}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Nog aan het vergelijken?"
                description="Bekijk de belangrijkste verschillen naast elkaar en kies sneller het omega 3 supplement dat past bij jouw doel en budget."
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/omega-3-vergelijken"
                        className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
                    >
                        Vergelijk omega 3 supplementen
                    </Link>
                    <a
                        href="#topkeuzes"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:border-slate-300"
                    >
                        Bekijk topkeuzes
                    </a>
                </div>
            </ContentSection>

            <RelatedPages
                title="Verder lezen"
                description="Aanvullende pagina's om deze topkeuzes in context te plaatsen."
                items={relatedPages}
            />
        </main>
    );
}

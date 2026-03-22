import Link from "next/link";
import AffiliateLink from "@/components/content/AffiliateLink";
import ProductCard from "@/components/content/product-card";
import Disclosure, {
    DisclosureSmall,
    DisclosureTable,
} from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { omega3Products } from "@/data/products/omega3";
import { formatPrice } from "@/lib/format-price";
import { faqs } from "@/features/omega3/data/beste-omega-3-supplement";

const topPicks = omega3Products
    .filter((p) => p.badge && p.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

const bestChoice = topPicks[0];
const easyChoice = topPicks[1];
const veganChoice = topPicks[2];

const relatedPages = [
    {
        href: "/wat-is-omega-3",
        title: "Wat is omega 3?",
        description:
            "Een rustige basisuitleg voordat je producten of claims vergelijkt.",
    },
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega 3?",
        description:
            "Praktische houvast voor dosering, transparantie en prijs per dag.",
    },
    {
        href: "/omega-3-vergelijken",
        title: "Omega 3 vergelijken",
        description:
            "Bekijk alle populaire keuzes naast elkaar in een compact overzicht.",
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
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                            Onafhankelijke omega 3 gids
                        </p>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                            Beste omega 3 supplementen van 2026
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                            Wil je sneller een goede keuze maken? We vergeleken populaire
                            omega 3 supplementen op dosering, zuiverheid, gebruiksgemak en
                            prijs per dag. Zo zie je in één oogopslag welke keuze het best
                            past bij dagelijks gebruik, gemak of een vegan voorkeur.
                        </p>

                        <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                ✓ Gebaseerd op dosering, vorm en gebruiksgemak
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                ✓ Praktisch vergeleken op prijs per dag
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                ✓ Snelle keuzehulp voor beginners
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                ✓ Beste algemene keuze: {bestChoice?.name}
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-400">
                            Laatste update: maart 2026
                        </p>

                        <Disclosure />

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#topkeuzes"
                                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800"
                            >
                                Bekijk beste keuzes
                            </a>

                            <Link
                                href="/omega-3-vergelijken"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                            >
                                Vergelijk alle supplementen
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
                        <p className="text-sm font-medium text-slate-500">
                            Snelle samenvatting
                        </p>

                        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                                Beste algemene keuze
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {bestChoice?.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Geschikt voor wie een sterke allround keuze zoekt met een goede
                                balans tussen kwaliteit, dosering en dagelijks gebruiksgemak.
                            </p>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                            <li>• Kies visolie als je vooral effect en dosering belangrijk vindt</li>
                            <li>• Kies gummies als je gemak en smaak belangrijker vindt</li>
                            <li>• Kies algenolie als je liever een vegan optie wilt</li>
                        </ul>

                        {bestChoice ? (
                            <>
                                <AffiliateLink
                                    affiliateSlug={bestChoice.affiliateSlug}
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800"
                                >
                                    Bekijk beste keuze →
                                </AffiliateLink>
                                <DisclosureSmall />
                            </>
                        ) : null}
                    </div>
                </div>
            </section>

            <ContentSection
                id="topkeuzes"
                title="Onze topkeuzes"
                description="Voor bezoekers die snel willen beslissen zonder eerst alles uitgebreid door te nemen."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {topPicks.map((product, index) => (
                        <article
                            key={product.slug}
                            className={`rounded-3xl border bg-white p-6 shadow-sm ${index === 0
                                    ? "border-green-300 ring-1 ring-green-200"
                                    : "border-slate-200"
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${index === 0
                                            ? "bg-green-100 text-green-800"
                                            : "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {product.badge}
                                </span>

                                {index === 0 ? (
                                    <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                                        Aanrader
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-4 flex items-start justify-between gap-4">
                                <h3 className="text-xl font-semibold">{product.name}</h3>
                                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold">
                                    {product.score}/10
                                </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {product.description}
                            </p>

                            {index === 0 ? (
                                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                                        Waarom dit de beste keuze is
                                    </p>
                                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                        <li>• Sterke balans tussen dosering en dagelijks gebruik</li>
                                        <li>• Duidelijke merkpositionering en transparantie</li>
                                        <li>• Meest logische keuze voor de meeste bezoekers</li>
                                    </ul>
                                </div>
                            ) : null}

                            <ul className="mt-5 space-y-2 text-sm text-slate-600">
                                {product.pros.map((pro) => (
                                    <li key={pro}>• {pro}</li>
                                ))}
                            </ul>

                            <AffiliateLink
                                affiliateSlug={product.affiliateSlug}
                                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${index === 0
                                        ? "bg-green-700 text-white hover:bg-green-800"
                                        : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                                    }`}
                            >
                                {index === 0 ? "Bekijk beste keuze →" : "Bekijk product →"}
                            </AffiliateLink>
                            <DisclosureSmall />
                        </article>
                    ))}
                </div>
            </ContentSection>

            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
                    <p className="text-sm leading-6 text-slate-600">
                        Twijfel je nog waarop je inhoudelijk moet letten — bijvoorbeeld EPA,
                        DHA, dosering per dag, prijs per dag en zuiverheid?{" "}
                        <Link
                            href="/waar-let-je-op-bij-omega-3"
                            className="font-medium text-green-700 underline-offset-4 hover:underline"
                        >
                            Lees eerst de praktische gids
                        </Link>{" "}
                        zodat je sneller begrijpt waarom deze keuzes bovenaan staan.
                    </p>
                </div>
            </div>

            <ContentSection
                title="Welke keuze past bij jou?"
                description="Niet iedereen zoekt hetzelfde. Met deze korte keuzehulp maak je sneller de juiste keuze."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {bestChoice ? (
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                            <h3 className="text-base font-semibold">Beste voor dagelijks gebruik</h3>
                            <p className="mt-1 text-sm font-medium text-green-700">
                                {bestChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                Kies deze als je vooral een sterke, brede en praktische omega 3
                                keuze zoekt zonder onnodige twijfel.
                            </p>
                            <AffiliateLink
                                affiliateSlug={bestChoice.affiliateSlug}
                                className="mt-4 inline-flex items-center text-sm font-medium text-green-800 underline-offset-4 hover:underline"
                            >
                                Bekijk beste keuze →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {easyChoice ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">Beste voor gemak en smaak</h3>
                            <p className="mt-1 text-sm font-medium text-green-700">
                                {easyChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Handig als je liever iets laagdrempeligs kiest dat makkelijker
                                vol te houden is in je dagelijkse routine.
                            </p>
                            <AffiliateLink
                                affiliateSlug={easyChoice.affiliateSlug}
                                className="mt-4 inline-flex items-center text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                            >
                                Bekijk product →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {veganChoice ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">Beste vegan keuze</h3>
                            <p className="mt-1 text-sm font-medium text-green-700">
                                {veganChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Logische keuze als je bewust zoekt naar een plantaardige
                                omega 3 bron zonder visolie.
                            </p>
                            <AffiliateLink
                                affiliateSlug={veganChoice.affiliateSlug}
                                className="mt-4 inline-flex items-center text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                            >
                                Bekijk product →
                            </AffiliateLink>
                        </div>
                    ) : null}
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Begin je nog helemaal bij de basis? Lees dan eerst{" "}
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
                title="Uitgelichte supplementen"
                description="Hieronder zie je de volledige selectie in dezelfde vaste card-structuur."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {omega3Products.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Snel vergelijken"
                description="Deze compacte tabel helpt je sneller scannen voordat je doorklikt."
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
                                    <td className="px-4 py-3">
                                        {product.epaMg} / {product.dhaMg} mg
                                    </td>
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
                title="Veelgestelde vragen"
                description="Korte antwoorden op vragen die vaak terugkomen bij het vergelijken van omega 3 supplementen."
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
                description="Bekijk alle keuzes naast elkaar of ga direct terug naar de beste opties."
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/omega-3-vergelijken"
                        className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
                    >
                        Vergelijk alle omega 3 supplementen
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
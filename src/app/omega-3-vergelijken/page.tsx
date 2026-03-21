import Link from "next/link";
import { DisclosureSmall, DisclosureTable } from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { getAffiliateRedirectPath } from "@/data/affiliate-links";
import {
    choiceRoutes,
    comparisonCriteria,
    highlights,
    products,
    tableRows,
} from "@/features/omega3/data/omega-3-vergelijken";

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

export default function OmegaComparisonPage() {
    return (
        <main className="bg-white text-slate-900">
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                            Vergelijking
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                            Omega 3 supplementen vergelijken
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                            Vergelijk populaire omega 3 supplementen op dosering, transparantie,
                            gebruiksgemak en prijs per dag in één overzichtelijke pagina.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#vergelijking"
                                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800"
                            >
                                Bekijk vergelijking
                            </a>
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                            >
                                Bekijk beste keuzes
                            </Link>
                        </div>

                        <p className="mt-5 inline-flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500">
                            <span className="mt-px shrink-0 text-slate-400" aria-hidden="true">ℹ</span>
                            Deze pagina bevat affiliate links. Bij een aankoop via deze links kan de consument korting krijgen en deze website een commissie ontvangen.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Op deze pagina</p>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li>• Kort uitgelegd hoe wij vergelijken</li>
                            <li>• Snelle highlights per type bezoeker</li>
                            <li>• Productcards met score-opbouw</li>
                            <li>• Een compacte vergelijkingstabel</li>
                        </ul>
                    </div>
                </div>
            </section>

            <ContentSection
                title="Hoe wij vergelijken"
                description="We proberen producten rustig en consistent te beoordelen op factoren die in de praktijk het meest relevant zijn voor vergelijkbaarheid."
            >
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-7">
                    <p className="max-w-3xl text-sm leading-7 text-slate-600">
                        Onze vergelijking is geen medisch oordeel en ook geen marketingranglijst.
                        We kijken per product naar de praktische bruikbaarheid binnen de categorie:
                        dosering, transparantie, gebruiksgemak, prijs per dag en toepasbaarheid.
                        Zo ontstaat een vergelijking die vooral bedoeld is om keuzes duidelijker en
                        beter scanbaar te maken. Wie eerst de basis wil begrijpen, kan beginnen met{" "}
                        <Link
                            href="/wat-is-omega-3"
                            className="font-medium text-green-700 underline-offset-4 hover:underline"
                        >
                            wat omega 3 is
                        </Link>
                        ; wie precies wil weten hoe we deze punten wegen, leest onze{" "}
                        <Link
                            href="/methodologie"
                            className="font-medium text-green-700 underline-offset-4 hover:underline"
                        >
                            methodologie
                        </Link>
                        .
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {comparisonCriteria.map((criterion) => (
                            <span
                                key={criterion}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                            >
                                {criterion}
                            </span>
                        ))}
                    </div>
                </div>
            </ContentSection>

            <ContentSection
                title="Snelle highlights"
                description="Voor bezoekers die direct willen weten welke richting het best bij hun doel of budget past."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {highlights.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm font-medium text-green-700">{item.label}</p>
                            <h3 className="mt-2 text-lg font-semibold">{item.value}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Twijfel je nog welke criteria echt verschil maken? Lees dan ook{" "}
                    <Link
                        href="/waar-let-je-op-bij-omega-3"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        waar je op let bij omega 3 supplementen
                    </Link>
                    .
                </p>
            </ContentSection>

            <ContentSection
                title="Populaire keuzes naast elkaar"
                description="De cards hieronder maken verschillen sneller zichtbaar zonder dat je meteen een grote tabel hoeft te lezen."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {products.map((product) => (
                        <article
                            key={product.name}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{product.name}</h3>
                                    <p className="mt-1 text-sm font-medium text-green-700">{product.bestFor}</p>
                                </div>
                                <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold">
                                    {product.score}/10
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-600">{product.summary}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.specs.map((spec) => (
                                    <span
                                        key={spec}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <h4 className="text-sm font-semibold">Pluspunten</h4>
                                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                        {product.pros.map((pro) => (
                                            <li key={pro}>• {pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold">Aandachtspunten</h4>
                                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                        {product.cons.map((con) => (
                                            <li key={con}>• {con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Score-opbouw
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {product.breakdown.map(([label, score]) => (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                                        >
                                            <span className="text-sm text-slate-600">{label}</span>
                                            <span className="text-sm font-medium text-slate-900">{score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href={getAffiliateRedirectPath(product.affiliateSlug)}
                                prefetch={false}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:border-slate-300"
                            >
                                Bekijk product
                            </Link>
                            <DisclosureSmall />
                        </article>
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                id="vergelijking"
                title="Vergelijkingstabel"
                description="Een compact overzicht van de belangrijkste eigenschappen om sneller verschillen te zien zonder veel tekst te hoeven lezen."
            >
                <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-slate-600 md:flex-row md:items-center md:justify-between">
                    <p>
                        Wil je liever direct onze selectie zien? Bekijk dan ook de{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="font-medium text-green-700 underline-offset-4 hover:underline"
                        >
                            beste omega 3 supplementen
                        </Link>
                        .
                    </p>
                    <Link
                        href="/methodologie"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        Lees hoe wij vergelijken
                    </Link>
                </div>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Dosering</th>
                                <th className="px-4 py-3 font-semibold">Transparantie</th>
                                <th className="px-4 py-3 font-semibold">Gebruiksgemak</th>
                                <th className="px-4 py-3 font-semibold">Prijs per dag</th>
                                <th className="px-4 py-3 font-semibold">Beste voor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row) => (
                                <tr key={row.product} className="border-t border-slate-200">
                                    <td className="px-4 py-3 font-medium">{row.product}</td>
                                    <td className="px-4 py-3">{row.type}</td>
                                    <td className="px-4 py-3">{row.dosage}</td>
                                    <td className="px-4 py-3">{row.transparency}</td>
                                    <td className="px-4 py-3">{row.convenience}</td>
                                    <td className="px-4 py-3">{row.price}</td>
                                    <td className="px-4 py-3">{row.bestFor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <DisclosureTable />
            </ContentSection>

            <ContentSection
                title="Welke keuze past bij jou?"
                description="Als je niet alles wilt vergelijken, helpen deze vier routes om sneller bij een logische eerste keuze uit te komen."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {choiceRoutes.map((route) => (
                        <article
                            key={route.title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm font-medium text-green-700">{route.title}</p>
                            <h3 className="mt-2 text-base font-semibold text-slate-900">
                                {route.product}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{route.text}</p>
                            <Link
                                href={getAffiliateRedirectPath(route.affiliateSlug)}
                                prefetch={false}
                                className="mt-4 inline-flex items-center text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                            >
                                Bekijk product →
                            </Link>
                        </article>
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Onze conclusie"
                description="Voor de meeste bezoekers is een korte eindkeuze handiger dan nog meer losse details."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: "Topkeuze",
                            text: "Kies Arctic Blue Visolie als je een sterke allround keuze zoekt met balans tussen dosering en dagelijks gebruik.",
                        },
                        {
                            title: "Beste prijs/gebruiksgemak",
                            text: "Kies Arctic Blue Gummies als je vooral laagdrempelig wilt beginnen en smaak en routine belangrijk vindt.",
                        },
                        {
                            title: "Beste plantaardige optie",
                            text: "Kies Arctic Blue Algenolie als je liever een plantaardige omega-3 bron gebruikt dan visolie.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Zoek je liever een kortere shortlist dan een volledige vergelijking? Bekijk dan de{" "}
                    <Link
                        href="/beste-omega-3-supplement"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        beste omega 3 supplementen
                    </Link>
                    .
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/beste-omega-3-supplement"
                        className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
                    >
                        Bekijk beste omega 3 supplementen
                    </Link>
                    <a
                        href="#vergelijking"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:border-slate-300"
                    >
                        Terug naar vergelijking
                    </a>
                </div>
            </ContentSection>

            <RelatedPages
                title="Gerelateerde pagina's"
                description="Handige vervolgstappen als je vanuit vergelijken verder wilt in het omega 3 cluster."
                items={relatedPages}
            />
        </main>
    );
}

import Link from "next/link";
import AffiliateLink from "@/components/content/AffiliateLink";
import {
    BlogArticleExcerpt,
    BlogArticleIntro,
} from "@/components/blog/BlogArticleIntro";
import Container from "@/components/layout/Container";
import { DisclosureSmall, DisclosureTable } from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import {
    choiceRoutes,
    comparisonCriteria,
    products,
    tableRows,
} from "@/features/omega3/data/omega-3-vergelijken";

export function generateMetadata() {
    return {
        ...buildArticlePageMetadata("omega-3-vergelijken"),
        alternates: { canonical: "/omega-3-vergelijken" },
    };
}

function splitSpec(spec: string): { label: string; value: string } {
    const [label, ...rest] = spec.split(": ");
    return {
        label,
        value: rest.join(": ") || spec,
    };
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
        href: "/methodologie",
        title: "Onze methodologie",
        description: "Lees hoe vergelijkingen en rankings worden opgebouwd.",
    },
];

export default function OmegaComparisonPage() {
    const post = getBlogPostBySlug("omega-3-vergelijken");
    if (!post) {
        throw new Error("Blog post omega-3-vergelijken ontbreekt");
    }

    return (
        <main className="text-stone-900">
            <article>
            <div className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0]">
            <section className="relative overflow-hidden">
                <Container className="relative">
                    <nav aria-label="Breadcrumb" className="pt-6 pb-2">
                        <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
                            <li className="flex items-center gap-1">
                                <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
                                <span aria-hidden="true">/</span>
                            </li>
                            <li className="flex items-center gap-1">
                                <Link href="/beste-omega-3-supplement" className="hover:text-stone-600 transition-colors">Omega 3</Link>
                                <span aria-hidden="true">/</span>
                            </li>
                            <li>
                                <span className="text-stone-600">Omega 3 vergelijken</span>
                            </li>
                        </ol>
                    </nav>
                    <div className="grid gap-10 pt-10 pb-20 md:gap-12 md:pt-14 md:pb-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,360px)] lg:items-start">
                        <div className="relative">
                            <header className="max-w-3xl">
                                <BlogArticleIntro post={post} />
                                <h1 className="font-display mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight">
                                    Omega 3 supplementen vergelijken
                                </h1>
                                <BlogArticleExcerpt post={post} />
                            </header>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#vergelijking"
                                    className="inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
                                >
                                    Bekijk vergelijking
                                </a>
                                <Link
                                    href="/beste-omega-3-supplement"
                                    className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                                >
                                    Bekijk beste keuzes
                                </Link>
                                <Link
                                    href="/intake"
                                    className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                                >
                                    Doe de Leefstijlcheck
                                </Link>
                            </div>

                            <p className="mt-5 inline-flex max-w-xl items-start gap-2 rounded-xl border border-stone-200/90 bg-white/90 px-4 py-3 text-sm leading-6 text-stone-500 shadow-[0_1px_3px_rgba(28,25,23,0.04)]">
                                <span className="mt-px shrink-0 text-stone-400" aria-hidden="true">ℹ</span>
                                Deze pagina bevat affiliate links. Bij een aankoop via deze links kan de consument korting krijgen en deze website een commissie ontvangen.
                            </p>
                        </div>

                        <div className="relative rounded-[1.75rem] border border-stone-200/90 bg-white/95 p-6 shadow-[0_12px_40px_-18px_rgba(28,25,23,0.18)] ring-1 ring-stone-900/[0.03] backdrop-blur-[2px]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                In één oogopslag
                            </p>
                            <div className="mt-5 space-y-4">
                                <div className="border-b border-stone-100 pb-4">
                                    <p className="text-sm font-semibold text-stone-900">Waarop je vergelijkt</p>
                                    <p className="mt-1.5 text-sm leading-6 text-stone-600">
                                        Dosering, transparantie, gebruiksgemak en prijs per dag.
                                    </p>
                                </div>
                                <div className="border-b border-stone-100 pb-4">
                                    <p className="text-sm font-semibold text-stone-900">Voor wie deze pagina handig is</p>
                                    <p className="mt-1.5 text-sm leading-6 text-stone-600">
                                        Voor wie snel verschillen wil zien zonder meerdere productpagina&apos;s naast elkaar te leggen.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-stone-900">Snelle routes</p>
                                    <div className="mt-3 flex flex-col gap-2.5">
                                        <a
                                            href="#producten"
                                            className="inline-flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white hover:text-stone-900"
                                        >
                                            <span>Bekijk populaire keuzes</span>
                                            <span aria-hidden="true">→</span>
                                        </a>
                                        <a
                                            href="#vergelijking"
                                            className="inline-flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white hover:text-stone-900"
                                        >
                                            <span>Ga naar vergelijkingstabel</span>
                                            <span aria-hidden="true">→</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
            </div>

            <ContentSection
                title="Hoe wij vergelijken"
                description="We proberen producten rustig en consistent te beoordelen op factoren die in de praktijk het meest relevant zijn voor vergelijkbaarheid."
            >
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6 md:p-7">
                    <p className="max-w-3xl text-sm leading-7 text-stone-600">
                        Onze vergelijking is geen medisch oordeel en ook geen marketingranglijst.
                        We kijken per product naar de praktische bruikbaarheid binnen de categorie:
                        dosering, transparantie, gebruiksgemak, prijs per dag en toepasbaarheid.
                        Zo ontstaat een vergelijking die vooral bedoeld is om keuzes duidelijker en
                        beter scanbaar te maken. Wie eerst de basis wil begrijpen, kan beginnen met{" "}
                        <Link
                            href="/wat-is-omega-3"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            wat omega 3 is
                        </Link>
                        ; wie precies wil weten hoe we deze punten wegen, leest onze{" "}
                        <Link
                            href="/methodologie"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            methodologie
                        </Link>
                        .
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

            <ContentSection
                id="producten"
                title="Populaire keuzes naast elkaar"
                description="De drie hoogst scorende producten direct naast elkaar — voor een snelle eerste vergelijking zonder dat je door een grote tabel hoeft."
            >
                <div className="grid gap-5 xl:grid-cols-3">
                    {products.map((product) => (
                        <article
                            key={product.name}
                            className="flex h-full flex-col rounded-[1.75rem] border border-stone-200/90 bg-white p-6 shadow-[0_8px_30px_-18px_rgba(28,25,23,0.16)] ring-1 ring-stone-900/[0.03] md:p-7"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <p className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone-600">
                                    {product.bestFor}
                                </p>
                                <div className="shrink-0 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-right">
                                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone-500">
                                        Score
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-stone-900">
                                        {product.score}/10
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <h3 className="text-[1.375rem] font-semibold tracking-tight text-stone-900">
                                    {product.name}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-stone-600">
                                    {product.summary}
                                </p>
                            </div>

                            <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                                {product.specs.map((spec) => {
                                    const { label, value } = splitSpec(spec);
                                    return (
                                        <div
                                            key={spec}
                                            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                                        >
                                            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-stone-500">
                                                {label}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-stone-900">
                                                {value}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 grid gap-5 border-t border-stone-100 pt-5">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                                        Sterk in
                                    </h4>
                                    <ul className="mt-3 space-y-2.5 text-sm leading-6 text-stone-600">
                                        {product.pros.map((pro) => (
                                            <li key={pro} className="flex items-start gap-2">
                                                <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                                        Let op
                                    </h4>
                                    <ul className="mt-3 space-y-2.5 text-sm leading-6 text-stone-600">
                                        {product.cons.map((con) => (
                                            <li key={con} className="flex items-start gap-2">
                                                <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
                                                <span>{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                                    Score-opbouw
                                </p>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {product.breakdown.map(([label, score]) => (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5"
                                        >
                                            <span className="text-sm text-stone-600">{label}</span>
                                            <span className="text-sm font-medium text-stone-900">{score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <AffiliateLink
                                affiliateSlug={product.affiliateSlug}
                                pageType="omega-3-vergelijken"
                                position={`comparison_card_${product.affiliateSlug}`}
                                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Bekijk actuele prijs bij aanbieder →
                            </AffiliateLink>
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
                <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-stone-600 md:flex-row md:items-center md:justify-between">
                    <p>
                        Wil je liever direct onze selectie zien? Bekijk dan ook de{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            beste omega 3 supplementen
                        </Link>
                        .
                    </p>
                    <Link
                        href="/methodologie"
                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A] font-medium"
                    >
                        Lees hoe wij vergelijken
                    </Link>
                </div>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">EPA / DHA</th>
                                <th className="px-4 py-3 font-semibold">Dosering</th>
                                <th className="px-4 py-3 font-semibold">Transparantie</th>
                                <th className="px-4 py-3 font-semibold">Gebruiksgemak</th>
                                <th className="px-4 py-3 font-semibold whitespace-nowrap">Prijs per dag</th>
                                <th className="px-4 py-3 font-semibold">Beste voor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row) => (
                                <tr key={row.product} className="border-t border-stone-200">
                                    <td className="px-4 py-3 font-medium">{row.product}</td>
                                    <td className="px-4 py-3">{row.type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{row.epa}</td>
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
                            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm font-medium text-stone-800">{route.title}</p>
                            <h3 className="mt-2 text-base font-semibold text-stone-900">
                                {route.product}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{route.text}</p>
                            <AffiliateLink
                                affiliateSlug={route.affiliateSlug}
                                pageType="omega-3-vergelijken"
                                position={`choice_route_${route.affiliateSlug}`}
                                className="mt-4 inline-flex items-center text-xs font-medium text-stone-500 underline-offset-4 hover:text-stone-700 hover:underline"
                            >
                                Bekijk actuele prijs bij aanbieder →
                            </AffiliateLink>
                        </article>
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Onze conclusie"
                description="Voor de meeste bezoekers is een korte eindkeuze handiger dan nog meer losse details."
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            title: "Topkeuze",
                            text: "Kies Minami MorEPA Original als je de hoogste EPA-concentratie zoekt met CO2-extractie en wetenschappelijk gevalideerde kwaliteit.",
                        },
                        {
                            title: "Beste prijs-kwaliteit",
                            text: "Kies Vitaminstore Super Fish Oil als je een kwalitatieve triglyceride-visolie zoekt voor de scherpste prijs per mg omega-3.",
                        },
                        {
                            title: "Beste vloeibaar",
                            text: "Kies Arctic Blue Visolie als je liever vloeibare olie gebruikt dan capsules en een sterke dagelijkse routine wilt opbouwen.",
                        },
                        {
                            title: "Beste plantaardige optie",
                            text: "Kies Arctic Blue Algenolie als je liever een plantaardige omega-3 bron gebruikt dan visolie.",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-600">
                    Zoek je liever een kortere shortlist dan een volledige vergelijking? Bekijk dan de{" "}
                    <Link
                        href="/beste-omega-3-supplement"
                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                    >
                        beste omega 3 supplementen
                    </Link>
                    .
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/beste-omega-3-supplement"
                        className="inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7F5A] transition-colors"
                    >
                        Bekijk beste omega 3 supplementen
                    </Link>
                    <a
                        href="#vergelijking"
                        className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 hover:border-stone-300"
                    >
                        Terug naar vergelijking
                    </a>
                </div>
            </ContentSection>

            <ContentSection
                title="Handige vervolgstappen"
                description="Klaar om een concrete keuze te maken? Bekijk onze shortlist met productkaarten en actuele prijzen."
            >
                <Link
                    href="/beste-omega-3-supplement"
                    className="block max-w-md rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-[#5A8F6A]/30"
                >
                    <span className="font-medium text-stone-900">Bekijk onze top 5 omega-3 →</span>
                    <span className="mt-0.5 block text-sm text-stone-500">Vergeleken op EPA/DHA, prijs en zuiverheid</span>
                </Link>
            </ContentSection>

            <section className="mt-16 mb-12">
                <Container>
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 px-8 py-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700 mb-3">Persoonlijk advies</p>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                            Welke omega-3 past bij jou?
                        </h2>
                        <p className="text-base text-stone-500 leading-relaxed mb-6 max-w-xl mx-auto">
                            Ontdek in 3 minuten welke supplementen bij jouw situatie passen — op basis van je slaap, stress, energie en meer.
                        </p>
                        <Link
                            href="/intake"
                            className="inline-block bg-[#5A8F6A] text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-[#4A7F5A] transition-colors"
                        >
                            Doe de gratis Leefstijlcheck
                        </Link>
                    </div>
                </Container>
            </section>

            <RelatedPages
                title="Gerelateerde pagina's"
                description="Handige vervolgstappen als je vanuit vergelijken verder wilt in het omega 3 cluster."
                items={relatedPages}
            />
            </article>
        </main>
    );
}

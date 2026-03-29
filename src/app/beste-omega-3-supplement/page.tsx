import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
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

const voorWieMap: Record<string, string> = {
    "arctic-blue-visolie": "Dagelijks gebruik, brede ondersteuning",
    "arctic-blue-gummies": "Wie gemak en smaak belangrijk vindt",
    "arctic-blue-algenolie": "Wie plantaardig de voorkeur geeft",
};

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

const selectionCriteria = [
    {
        label: "EPA/DHA gehalte",
        text: "We kijken naar het werkzame bestanddeel per portie, niet naar de totale hoeveelheid olie.",
    },
    {
        label: "Opneembaarheid (vorm)",
        text: "Triglyceride- en vloeibare vormen hebben in de meeste onderzoeken een betere opname dan ethyl ester.",
    },
    {
        label: "Zuiverheid en transparantie",
        text: "We selecteren merken die open communiceren over herkomst, testresultaten en samenstelling.",
    },
    {
        label: "Prijs per gram",
        text: "Een hoge prijs garandeert geen betere kwaliteit. We wegen prijs altijd af tegen de daadwerkelijke inhoud.",
    },
];

export default function BestOmegaPage() {
    return (
        <main className="text-stone-900">
            {/* Hero */}
            <section className="border-b border-stone-200 bg-stone-50">
                <Container>
                <div className="grid gap-10 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-800">
                            Onafhankelijke omega 3 gids
                        </p>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                            Beste omega 3 supplementen van 2026
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                            Vergeleken op dosering, zuiverheid, gebruiksgemak en prijs per dag. Zo zie je in één oogopslag welke keuze het best past bij jouw situatie.
                        </p>

                        <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Gebaseerd op dosering, vorm en gebruiksgemak
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Praktisch vergeleken op prijs per dag
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Snelle keuzehulp voor beginners
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Beste algemene keuze: {bestChoice?.name}
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-stone-400">
                            Laatste update: maart 2026
                        </p>

                        <Disclosure />

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#topkeuzes"
                                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Bekijk beste keuzes
                            </a>

                            <Link
                                href="/omega-3-vergelijken"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                            >
                                Vergelijk alle supplementen
                            </Link>
                        </div>

                        <p className="mt-4 text-xs text-stone-400">
                            Benieuwd hoe we beoordelen?{" "}
                            <Link
                                href="/methodologie"
                                className="text-stone-500 underline-offset-4 hover:underline"
                            >
                                Lees onze methodologie
                            </Link>
                        </p>
                    </div>

                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-stone-500">
                            Snelle samenvatting
                        </p>

                        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-100 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-800">
                                Beste algemene keuze
                            </p>
                            <p className="mt-1 text-lg font-semibold text-stone-900">
                                {bestChoice?.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Sterke allround keuze met een goede balans tussen kwaliteit, dosering en dagelijks gebruiksgemak.
                            </p>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
                            <li>• Kies visolie als je effect en dosering prioriteit geeft</li>
                            <li>• Kies gummies als je gemak en smaak voorop stelt</li>
                            <li>• Kies algenolie als je plantaardig wilt</li>
                        </ul>

                        {bestChoice ? (
                            <>
                                <AffiliateLink
                                    affiliateSlug={bestChoice.affiliateSlug}
                                    pageType="beste-omega-3-supplement"
                                    position="hero_sidebar"
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800"
                                >
                                    Bekijk actuele prijs bij aanbieder →
                                </AffiliateLink>
                                <DisclosureSmall />
                            </>
                        ) : null}
                    </div>
                </div>
                </Container>
            </section>

            {/* Top picks — het belangrijkste blok */}
            <ContentSection
                id="topkeuzes"
                title="Onze topkeuzes"
                description="Drie keuzes, snel te scannen. Klik door voor prijs en besteloptie."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {topPicks.map((product, index) => {
                        const isTop = index === 0;
                        const voorWie =
                            voorWieMap[product.slug] ?? product.description;

                        return (
                            <article
                                key={product.slug}
                                className={`flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                                    isTop
                                        ? "border-stone-300 ring-1 ring-stone-200"
                                        : "border-stone-200"
                                }`}
                            >
                                {isTop && (
                                    <div className="bg-stone-900 px-6 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white">
                                        Onze aanrader
                                    </div>
                                )}

                                <div className="flex flex-1 flex-col p-6">
                                    <span
                                        className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium ${
                                            isTop
                                                ? "bg-stone-100 text-stone-800"
                                                : "bg-stone-100 text-stone-700"
                                        }`}
                                    >
                                        {product.badge}
                                    </span>

                                    {product.imageSrc && (
                                        <div className="relative mx-auto mt-5 h-28 w-28 shrink-0">
                                            <Image
                                                src={product.imageSrc}
                                                alt={product.imageAlt ?? product.name}
                                                fill
                                                sizes="112px"
                                                className="object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-start justify-between gap-3">
                                        <h3
                                            className={`font-semibold leading-tight ${
                                                isTop ? "text-xl" : "text-lg"
                                            }`}
                                        >
                                            {product.name}
                                        </h3>
                                        <div className="shrink-0 rounded-xl bg-stone-100 px-3 py-1.5 text-sm font-semibold">
                                            {product.score}/10
                                        </div>
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-stone-600">
                                        {product.description}
                                    </p>

                                    <ul className="mt-5 space-y-2.5 border-t border-stone-100 pt-5 text-sm">
                                        <li className="flex gap-3">
                                            <span className="w-20 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                                                EPA / DHA
                                            </span>
                                            <span className="text-stone-700">
                                                {product.epaMg} / {product.dhaMg} mg
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-20 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                                                Vorm
                                            </span>
                                            <span className="text-stone-700">
                                                {product.form}
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-20 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                                                Voor wie
                                            </span>
                                            <span className="text-stone-700">
                                                {voorWie}
                                            </span>
                                        </li>
                                    </ul>

                                    <div className="flex-1" />

                                    <AffiliateLink
                                        affiliateSlug={product.affiliateSlug}
                                        pageType="beste-omega-3-supplement"
                                        position={`top_pick_${index + 1}`}
                                        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                                            isTop
                                                ? "bg-stone-900 text-white hover:bg-stone-800"
                                                : "border border-stone-200 bg-white text-stone-900 hover:border-stone-300 hover:bg-stone-50"
                                        }`}
                                    >
                                        Bekijk actuele prijs bij aanbieder →
                                    </AffiliateLink>
                                    <DisclosureSmall />
                                </div>
                            </article>
                        );
                    })}
                </div>
            </ContentSection>

            {/* Waarom deze selectie? */}
            <div className="border-y border-stone-100 bg-stone-50 py-12 md:py-16">
                <Container>
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Waarom deze selectie?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">
                            Geen marketingtaal. Dit zijn de vier criteria waarop we vergelijken.
                        </p>
                    </div>
                    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                        {selectionCriteria.map((item) => (
                            <li
                                key={item.label}
                                className="rounded-2xl border border-stone-200 bg-white p-5"
                            >
                                <p className="text-sm font-semibold text-stone-900">
                                    {item.label}
                                </p>
                                <p className="mt-1.5 text-sm leading-6 text-stone-600">
                                    {item.text}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Container>
            </div>

            {/* Welke keuze past bij jou? */}
            <ContentSection
                title="Welke keuze past bij jou?"
                description="Niet iedereen zoekt hetzelfde. Met deze korte keuzehulp maak je sneller de juiste keuze."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {bestChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-stone-100 p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste voor dagelijks gebruik
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {bestChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-700">
                                Kies deze als je een sterke, brede en praktische omega 3 keuze zoekt zonder onnodige twijfel.
                            </p>
                            <AffiliateLink
                                affiliateSlug={bestChoice.affiliateSlug}
                                pageType="beste-omega-3-supplement"
                                position="section_choice_daily"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-800 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {easyChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste voor gemak en smaak
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {easyChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Handig als je iets laagdrempeligs kiest dat makkelijker vol te houden is in je dagelijkse routine.
                            </p>
                            <AffiliateLink
                                affiliateSlug={easyChoice.affiliateSlug}
                                pageType="beste-omega-3-supplement"
                                position="section_choice_easy"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {veganChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste vegan keuze
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {veganChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Logische keuze als je bewust zoekt naar een plantaardige omega 3 bron zonder visolie.
                            </p>
                            <AffiliateLink
                                affiliateSlug={veganChoice.affiliateSlug}
                                pageType="beste-omega-3-supplement"
                                position="section_choice_vegan"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-6 text-stone-600 md:text-base">
                    Begin je nog bij de basis?{" "}
                    <Link
                        href="/wat-is-omega-3"
                        className="font-medium text-stone-800 underline-offset-4 hover:underline"
                    >
                        Lees eerst wat omega 3 is
                    </Link>
                    , zodat de verschillen sneller logisch worden.
                </p>
            </ContentSection>

            {/* Visolie vs Algenolie */}
            <div className="border-y border-stone-100 bg-stone-50 py-12 md:py-16">
                <Container>
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Visolie of algenolie?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">
                            De twee meest voorkomende bronnen van omega-3. De belangrijkste verschillen op een rij.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                                Visolie
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Hogere EPA/DHA per portie
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Meest onderzocht en bewezen
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Vaak goedkoper per gram
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Niet geschikt voor veganisten
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Kan een vissmaak hebben
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                                Algenolie
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    100% plantaardig
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Geen vissmaak
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Duurzamere bron
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Vaak duurder per gram
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Meer DHA dan EPA (niet altijd ideaal)
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
                        <p className="text-sm leading-6 text-stone-600">
                            <span className="font-medium text-stone-900">
                                Conclusie:
                            </span>{" "}
                            Kies visolie als je effect en dosering prioriteit geeft. Kies algenolie als je plantaardig wilt zonder concessies aan kwaliteit te doen.
                        </p>
                    </div>
                </Container>
            </div>

            {/* Vloeibaar vs Capsules */}
            <ContentSection
                title="Vloeibaar of capsules?"
                description="Beide werken goed. Kijk wat het best past bij je routine."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                            Vloeibaar
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Hogere dosering per portie mogelijk
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Goedkoper per gram
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Makkelijk te doseren
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Smaak kan wennen
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Minder handig onderweg
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                            Capsules / gummies
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Makkelijk in te nemen
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Geen vissmaak
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Handig voor reizen
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Soms hogere prijs per gram
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Gummies bevatten minder EPA/DHA per portie
                            </li>
                        </ul>
                    </div>
                </div>
            </ContentSection>

            {/* Contextblok: lees meer */}
            <Container className="pb-6">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5">
                    <p className="text-sm leading-6 text-stone-600">
                        Twijfel je over EPA, DHA, dosering per dag en zuiverheid?{" "}
                        <Link
                            href="/waar-let-je-op-bij-omega-3"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            Lees de praktische keuzegids
                        </Link>{" "}
                        zodat je sneller begrijpt waarom deze keuzes bovenaan staan.
                    </p>
                </div>
            </Container>

            {/* Uitgelichte supplementen — volledige cards */}
            <ContentSection
                title="Uitgelichte supplementen"
                description="Dezelfde keuzes uitgebreider weergegeven met alle relevante informatie op een rij."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {omega3Products.map((product) => (
                        <ProductCard
                            key={product.slug}
                            product={product}
                            pageType="beste-omega-3-supplement"
                            position={`featured_${product.slug}`}
                        />
                    ))}
                </div>
            </ContentSection>

            {/* Vergelijkingstabel */}
            <ContentSection
                title="Snel vergelijken"
                description="Deze compacte tabel helpt je sneller scannen voordat je doorklikt."
            >
                <div className="overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">EPA / DHA</th>
                                <th className="px-4 py-3 font-semibold">Vorm</th>
                                <th className="px-4 py-3 font-semibold">
                                    Capsules / dag
                                </th>
                                <th className="px-4 py-3 font-semibold">Prijs per dag</th>
                                <th className="px-4 py-3 font-semibold">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {omega3Products.map((product) => (
                                <tr
                                    key={product.slug}
                                    className="border-t border-stone-200"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.epaMg} / {product.dhaMg} mg
                                    </td>
                                    <td className="px-4 py-3">{product.form}</td>
                                    <td className="px-4 py-3">
                                        {product.capsulesPerDay}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(product.pricePerDayEur)}
                                    </td>
                                    <td className="px-4 py-3">{product.score}/10</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <DisclosureTable />
            </ContentSection>

            {/* FAQ */}
            <ContentSection
                title="Veelgestelde vragen"
                description="Korte antwoorden op vragen die vaak terugkomen bij het kiezen van omega 3."
            >
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <div
                            key={faq.question}
                            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold">
                                {faq.question}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </ContentSection>

            {/* Bottom CTA */}
            <ContentSection
                title="Nog aan het vergelijken?"
                description="Bekijk alle keuzes naast elkaar of ga direct terug naar de beste opties."
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/omega-3-vergelijken"
                        className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800"
                    >
                        Vergelijk alle omega 3 supplementen
                    </Link>
                    <a
                        href="#topkeuzes"
                        className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 hover:border-stone-300"
                    >
                        Terug naar topkeuzes
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

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import AffiliateLink from "@/components/content/AffiliateLink";
import MagnesiumProductCard from "@/components/content/magnesium-product-card";
import Disclosure, {
    DisclosureSmall,
    DisclosureTable,
} from "@/components/ui/Disclosure";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { magnesiumProducts } from "@/data/products/magnesium";
import { formatPrice } from "@/lib/format-price";
import { faqs } from "@/features/magnesium/data/beste-magnesium";

const topPicks = magnesiumProducts
    .filter((p) => p.badge && p.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

const bestChoice = topPicks[0];
const relaxationChoice = topPicks[1];
const valueChoice = topPicks[2];

const voorWieMap: Record<string, string> = {
    "magnesium-bisglycinaat": "Alledaags gebruik, milde tolerantie",
    "magnesium-tauraat": "Ontspanning en avondroutine",
    "magnesium-citraat": "Prijs per mg en flexibel doseren",
};

const relatedPages = [
    {
        href: "/magnesium-vergelijken",
        title: "Magnesium vergelijken",
        description:
            "Vormen en doseringen naast elkaar voordat je een specifiek product kiest.",
    },
    {
        href: "/methodologie",
        title: "Onze methodologie",
        description: "Lees hoe selectie en rangschikking tot stand komt.",
    },
];

const selectionCriteria = [
    {
        label: "Elementair magnesium per portie",
        text: "We vergelijken op mg elementair magnesium per aanbevolen portie, niet op het totale gewicht van de verbinding.",
    },
    {
        label: "Vorm en gebruik",
        text: "Bisglycinaat, citraat en tauraat gedragen zich anders in tolerantie, timing en praktisch gebruik. Dat weegt mee.",
    },
    {
        label: "Transparantie",
        text: "We geven de voorkeur aan merken die helder communiceren over hoeveelheden, vorm en eventuele hulpstoffen.",
    },
    {
        label: "Prijs per dag",
        text: "Een hogere prijs zegt niet automatisch meer elementair magnesium. We relateren prijs aan wat je daadwerkelijk binnenkrijgt.",
    },
];

export default function BesteMagnesiumPage() {
    return (
        <main className="text-stone-900">
            {/* Hero */}
            <section className="border-b border-stone-200 bg-stone-50">
                <Container>
                <div className="grid gap-10 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-800">
                            Onafhankelijke magnesiumgids
                        </p>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                            Beste magnesium supplementen van 2026
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                            Vergeleken op elementaire dosering, vorm (bisglycinaat, citraat, tauraat),
                            transparantie en prijs per dag. Zo zie je snel welke richting bij jouw situatie past.
                        </p>

                        <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Gebaseerd op mg elementair magnesium per portie
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Praktisch vergeleken op prijs per dag
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                ✓ Duidelijke keuze per vorm en gebruik
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
                                href="/magnesium-vergelijken"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                            >
                                Vergelijk alle vormen
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
                                Vaak de meest logische start als je een milde, alledaagse magnesiumbron zoekt met aandacht voor verdragenheid.
                            </p>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600">
                            <li>• Bisglycinaat: mild, vaak goed in dagelijkse routine</li>
                            <li>• Tauraat: past vaak bij ontspanning en avondgebruik</li>
                            <li>• Citraat: flexibel doseren, let op darmgevoeligheid</li>
                        </ul>

                        {bestChoice ? (
                            <>
                                <AffiliateLink
                                    affiliateSlug={bestChoice.affiliateSlug}
                                    pageType="beste-magnesium"
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
                description="Drie richtingen, snel te scannen. Klik door voor prijs en besteloptie."
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
                                            <span className="w-24 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                                                Elementair Mg
                                            </span>
                                            <span className="text-stone-700">
                                                {product.elementMg} mg
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-24 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                                                Vorm
                                            </span>
                                            <span className="text-stone-700">
                                                {product.form}
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-24 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-stone-400">
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
                                        pageType="beste-magnesium"
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
                description="Niet iedereen zoekt hetzelfde. Met deze korte keuzehulp maak je sneller een passende richting."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {bestChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-stone-100 p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste keuze (algemeen)
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {bestChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-700">
                                Kies deze richting als je een brede, vaak goed verdragen vorm zoekt voor dagelijks gebruik zonder meteen de zwaarste osmotische lading van citraat te willen.
                            </p>
                            <AffiliateLink
                                affiliateSlug={bestChoice.affiliateSlug}
                                pageType="beste-magnesium"
                                position="section_choice_daily"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-800 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {relaxationChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste voor ontspanning
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {relaxationChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Handig als je magnesium bewust wilt plaatsen rond rust, ontspanning of een vaste avondroutine—naast een verstandige dagelijkse voeding.
                            </p>
                            <AffiliateLink
                                affiliateSlug={relaxationChoice.affiliateSlug}
                                pageType="beste-magnesium"
                                position="section_choice_relaxation"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}

                    {valueChoice ? (
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold">
                                Beste prijs/kwaliteit
                            </h3>
                            <p className="mt-1 text-sm font-medium text-stone-800">
                                {valueChoice.name}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                                Logisch als je vooral naar prijs per mg elementair magnesium kijkt en flexibel wilt doseren—met aandacht voor hoe je darm het ervaart.
                            </p>
                            <AffiliateLink
                                affiliateSlug={valueChoice.affiliateSlug}
                                pageType="beste-magnesium"
                                position="section_choice_value"
                                className="mt-4 inline-flex items-center text-sm font-medium text-stone-700 underline-offset-4 hover:underline"
                            >
                                Bekijk prijs bij aanbieder →
                            </AffiliateLink>
                        </div>
                    ) : null}
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-6 text-stone-600 md:text-base">
                    Wil je eerst breder vergelijken?{" "}
                    <Link
                        href="/magnesium-vergelijken"
                        className="font-medium text-stone-800 underline-offset-4 hover:underline"
                    >
                        Bekijk magnesium vormen en dosering
                    </Link>
                    , zodat de verschillen tussen verbindingen sneller helder worden.
                </p>
            </ContentSection>

            {/* Bisglycinaat, citraat, tauraat */}
            <div className="border-y border-stone-100 bg-stone-50 py-12 md:py-16">
                <Container>
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            Bisglycinaat, citraat of tauraat?
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">
                            Drie veelgekozen verbindingen. Geen medische claims—wel praktische verschillen die je op het etiket en in gebruik merkt.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-2xl border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                                Bisglycinaat
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Vaak mild voor de maag in gebruikelijke doses
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Chelaatvorm: praktisch voor dagelijkse routine
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Minder “osmotisch” dan veel citraat bij gelijke context
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Meestal duurder per mg elementair magnesium
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                                Citraat
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Goed oplosbaar; veel verkrijgbaar
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Vaak sterke prijs/kwaliteit per mg element
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Poedervorm: makkelijk doseren
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Kan laxerend werken bij hogere inname
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-stone-200 bg-white p-6">
                            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                                Tauraat
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Combineert magnesium met taurine
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Vaak gekozen rond ontspanning of avond
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-600">+</span>
                                    Capsulevorm past bij vaste gewoonte
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-stone-400">−</span>
                                    Minder breed aanbod dan citraat
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
                        <p className="text-sm leading-6 text-stone-600">
                            <span className="font-medium text-stone-900">
                                Conclusie:
                            </span>{" "}
                            Start bij bisglycinaat als je vooral mildheid en routine zoekt. Kies citraat als prijs per mg en flexibiliteit leidend zijn (let op je darm). Overweeg tauraat als je de combinatie met taurine bewust in je avond- of ontspanningscontext wilt plaatsen.
                        </p>
                    </div>
                </Container>
            </div>

            {/* Capsules of poeder */}
            <ContentSection
                title="Capsules of poeder?"
                description="Beide kunnen werken. Kijk wat het best past bij je gewoonte en gevoeligheid."
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                            Capsules / tabletten
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Vaste portie, snel in te nemen
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Handig onderweg
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Geen smaakissue
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Minder flexibel bij fijnafstelling van mg
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                            Poeder
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Eenvoudig doseren in kleinere stappen
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Vaak gunstiger per mg element
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-600">+</span>
                                Los op in water of drank
                            </li>
                            <li className="flex gap-2">
                                <span className="text-stone-400">−</span>
                                Smaak en textuur zijn persoonlijk
                            </li>
                        </ul>
                    </div>
                </div>
            </ContentSection>

            {/* Contextblok: lees meer */}
            <Container className="pb-6">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5">
                    <p className="text-sm leading-6 text-stone-600">
                        Twijfel je over elementaire mg, timing of combinatie met voeding?{" "}
                        <Link
                            href="/magnesium-vergelijken"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            Lees de magnesiumvergelijking
                        </Link>{" "}
                        voor meer houvast voordat je bestelt.
                    </p>
                </div>
            </Container>

            {/* Uitgelichte supplementen — volledige cards */}
            <ContentSection
                title="Uitgelichte supplementen"
                description="Dezelfde keuzes uitgebreider weergegeven met alle relevante informatie op een rij."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    {magnesiumProducts.map((product) => (
                        <MagnesiumProductCard
                            key={product.slug}
                            product={product}
                            pageType="beste-magnesium"
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
                                <th className="px-4 py-3 font-semibold">Elementair Mg</th>
                                <th className="px-4 py-3 font-semibold">Vorm</th>
                                <th className="px-4 py-3 font-semibold">
                                    Porties / dag
                                </th>
                                <th className="px-4 py-3 font-semibold">Prijs per dag</th>
                                <th className="px-4 py-3 font-semibold">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {magnesiumProducts.map((product) => (
                                <tr
                                    key={product.slug}
                                    className="border-t border-stone-200"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.elementMg} mg
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
                description="Korte antwoorden op vragen die vaak terugkomen bij het kiezen van magnesium."
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
                description="Bekijk alle vormen naast elkaar of ga direct terug naar de topkeuzes."
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/magnesium-vergelijken"
                        className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800"
                    >
                        Vergelijk magnesiumvormen
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

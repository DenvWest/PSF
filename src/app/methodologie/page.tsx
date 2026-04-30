import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import RelatedPages from "@/components/ui/RelatedPages";

export const metadata: Metadata = {
  title: "Onze methodologie | PerfectSupplement",
  description:
    "Hoe we supplementen beoordelen: criteria, weging en onafhankelijkheid. Transparant en herhaalbaar.",
  alternates: { canonical: "/methodologie" },
};

const criteria = [
    {
        title: "Samenstelling",
        text: "We kijken naar de formule, de logica van de opbouw en of actieve ingrediënten inhoudelijk relevant zijn binnen de categorie.",
    },
    {
        title: "Dosering en dagwaarde",
        text: "We beoordelen niet alleen of een ingrediënt aanwezig is, maar vooral hoeveel je per aanbevolen dagdosering daadwerkelijk binnenkrijgt.",
    },
    {
        title: "Claimscontrole",
        text: "We proberen claims klein en correct te houden door ze te toetsen aan toegestane formuleringen, dosiscontext en beschikbare productinformatie.",
    },
    {
        title: "Transparantie en kwaliteit",
        text: "We letten op etiketduidelijkheid, herkomst, kwaliteitsinformatie en hoe goed een merk zijn product controleerbaar presenteert.",
    },
];

const rankingFactors = [
    "samenstelling en relevantie binnen de categorie",
    "dosering per aanbevolen dagdosering",
    "prijs per dag of gebruiksmoment",
    "transparantie van het merk en het etiket",
    "praktische toepasbaarheid, zoals capsules per dag of gebruiksgemak",
];

const claimChecks = [
    "We gebruiken waar mogelijk toegestane Europese gezondheidsclaims als kader en vermijden medische overclaims.",
    "We kijken of een claim past bij de dagdosering en niet alleen bij een los ingrediënt op het label.",
    "We beschrijven claims neutraal en gebruiken ze niet als bewijs voor diagnose, behandeling of gegarandeerd effect.",
];

const affiliatePrinciples = [
    "Affiliate links kunnen een commissie opleveren wanneer iemand via een link koopt.",
    "Een affiliate vergoeding verandert niet welke criteria we gebruiken of hoe rankings worden opgebouwd.",
    "We proberen commerciële prikkels zichtbaar te houden door affiliate transparantie expliciet te benoemen.",
];

const updateMoments = [
    "wanneer productsamenstellingen veranderen",
    "wanneer prijzen of dagdoseringen duidelijk verschuiven",
    "wanneer nieuwe producten inhoudelijk relevant worden voor een vergelijking",
    "wanneer claims, bronverwijzingen of productinformatie herijkt moeten worden",
];

const relatedPages = [
    {
        href: "/wat-is-omega-3",
        title: "Wat is omega 3?",
        description: "Een rustige start als je eerst de basis van de categorie wilt begrijpen.",
    },
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega 3?",
        description: "Zie hoe onze criteria in de praktijk terugkomen bij het beoordelen.",
    },
    {
        href: "/omega-3-vergelijken",
        title: "Omega 3 vergelijken",
        description: "Bekijk hoe de methodologie uitwerkt in een concrete vergelijking.",
    },
    {
        href: "/beste-omega-3-supplement",
        title: "Beste omega 3 supplement",
        description: "Ga naar de shortlist met beste overall, budget en premium keuzes.",
    },
];

export default function MethodologiePage() {
    return (
        <>
            <main>
                <div className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0]">
                    <Container>
                        <nav aria-label="Breadcrumb" className="pt-6 pb-2">
                            <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
                                <li className="flex items-center gap-1">
                                    <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
                                    <span aria-hidden="true">/</span>
                                </li>
                                <li>
                                    <span className="text-stone-600">Methodologie</span>
                                </li>
                            </ol>
                        </nav>

                        <section className="pt-10 pb-20 md:pt-14 md:pb-28">
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-4xl">
                                Hoe wij supplementen beoordelen
                            </h1>

                            <p className="text-lg text-stone-500 leading-relaxed max-w-xl mt-4">
                                We beoordelen supplementen niet op marketing, maar op inhoud,
                                dagdosering, transparantie en praktische toepasbaarheid.
                            </p>

                            <p className="mt-4 max-w-2xl text-base text-stone-600 leading-relaxed">
                                Op deze pagina leggen we uit hoe producten worden geselecteerd, welke
                                criteria we gebruiken, hoe claims worden gecontroleerd, hoe affiliate
                                links werken en wanneer beoordelingen worden herijkt. Wil je de
                                uitkomst hiervan in de praktijk zien, bekijk dan onze{" "}
                                <Link
                                    href="/omega-3-vergelijken"
                                    className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                >
                                    vergelijking van omega 3 supplementen
                                </Link>{" "}
                                of ga direct naar de{" "}
                                <Link
                                    href="/beste-omega-3-supplement"
                                    className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                >
                                    beste omega 3 supplementen
                                </Link>
                                .
                            </p>
                        </section>
                    </Container>
                </div>

                <Container>
                    <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {criteria.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-6"
                            >
                                <h2 className="font-display text-xl font-semibold text-stone-900">
                                    {item.title}
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-stone-600">
                                    {item.text}
                                </p>
                            </article>
                        ))}
                    </section>

                    <div className="mt-16 md:mt-20 space-y-14">
                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Hoe producten worden geselecteerd
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Niet alle supplementen op de markt worden op deze website
                                    opgenomen. We selecteren producten op basis van relevantie
                                    binnen een categorie, beschikbaarheid bij betrouwbare
                                    aanbieders en de mate van transparantie van het merk.
                                </p>
                                <p>
                                    Het doel is om een representatieve selectie van producten te
                                    tonen die bezoekers helpt verschillende opties beter te
                                    vergelijken. Daarbij kijken we niet alleen naar populaire
                                    producten, maar vooral naar producten die inhoudelijk logisch
                                    zijn binnen een specifieke categorie en duidelijk genoeg
                                    gespecificeerd zijn om te beoordelen op dagdosering, prijs per
                                    dag en claims. Voor de praktische vertaalslag hiervan kun je
                                    ook lezen{" "}
                                    <Link
                                        href="/waar-let-je-op-bij-omega-3"
                                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                    >
                                        waar je op let bij omega 3 supplementen
                                    </Link>
                                    .
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Welke criteria we gebruiken
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Onze beoordelingen zijn gebaseerd op een vaste set criteria. Die
                                    criteria helpen om producten consistenter te bekijken en niet
                                    alleen af te gaan op verpakking, merkbekendheid of commerciële
                                    positionering.
                                </p>
                                <p>
                                    In de praktijk betekent dit dat we kijken naar de formule, de
                                    dosering per dag, de informatie die het merk beschikbaar stelt,
                                    prijs per dag en de algemene kwaliteit van het product. Niet elk
                                    criterium weegt in elke categorie exact hetzelfde, maar de
                                    uitgangspunten blijven gelijk. Op de pagina{" "}
                                    <Link
                                        href="/waar-let-je-op-bij-omega-3"
                                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                    >
                                        waar let je op bij omega 3
                                    </Link>{" "}
                                    zie je deze criteria in compactere vorm terug.
                                </p>
                                <div className="grid gap-4 pt-2 md:grid-cols-2">
                                    {criteria.map((item) => (
                                        <div
                                            key={`detail-${item.title}`}
                                            className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-5"
                                        >
                                            <h3 className="font-display text-lg font-semibold text-stone-900">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-stone-600">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Hoe claims worden gecontroleerd
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Informatie over ingrediënten en mogelijke effecten proberen we
                                    zorgvuldig en neutraal te beschrijven. Daarbij kijken we naar
                                    beschikbare wetenschappelijke literatuur en, waar relevant, naar
                                    toegestane gezondheidsclaims binnen de Europese regelgeving en
                                    de dosiscontext waarin zo&apos;n claim gebruikt mag worden.
                                </p>
                                <p>
                                    We proberen claims niet groter te maken dan ze zijn. Dat
                                    betekent ook dat we terughoudend willen zijn met absolute
                                    formuleringen of gezondheidsbeloften die onvoldoende onderbouwd
                                    zijn.
                                </p>
                                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                                    {claimChecks.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <p>
                                    De informatie op deze website is bedoeld als algemene informatie
                                    en vervangt geen medisch advies, diagnose of behandeling. Wie
                                    eerst een rustige categorie-uitleg zoekt, kan beginnen bij{" "}
                                    <Link
                                        href="/wat-is-omega-3"
                                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                    >
                                        wat omega 3 is
                                    </Link>
                                    .
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Dosering en prijs per dag
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    In veel categorieën zegt een losse verpakking of potprijs weinig
                                    zonder gebruikscontext. Daarom kijken we waar relevant naar
                                    dosering per dag, capsules per dag en de prijs die daar in de
                                    praktijk bij hoort.
                                </p>
                                <p>
                                    Een supplement met een aantrekkelijke instapprijs kan alsnog
                                    minder sterk uitvallen wanneer de dagdosering laag is of wanneer
                                    je meerdere capsules nodig hebt om op een relevante inname uit te
                                    komen. Omgekeerd is een hogere prijs alleen verdedigbaar als daar
                                    ook aantoonbaar betere inhoud, duidelijkere specificaties of meer
                                    praktisch nut tegenover staat.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Hoe rankings tot stand komen
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Wanneer producten worden vergeleken, gebruiken we de criteria
                                    die op deze pagina worden beschreven. Rankings ontstaan dus niet
                                    op basis van één losse factor, maar op basis van een bredere
                                    beoordeling van het product binnen zijn categorie. Een concreet
                                    voorbeeld daarvan zie je terug op onze{" "}
                                    <Link
                                        href="/omega-3-vergelijken"
                                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                                    >
                                        vergelijking van omega 3 supplementen
                                    </Link>
                                    .
                                </p>
                                <p>Factoren die daarbij onder andere een rol kunnen spelen:</p>

                                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                                    {rankingFactors.map((factor) => (
                                        <li key={factor}>{factor}</li>
                                    ))}
                                </ul>

                                <p>
                                    Rankings kunnen worden aangepast wanneer nieuwe informatie
                                    beschikbaar komt, productsamenstellingen veranderen of wanneer
                                    nieuwe producten aan een vergelijking worden toegevoegd.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Affiliate transparantie
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Sommige links op deze website kunnen affiliate links zijn. Dat
                                    betekent dat we mogelijk een commissie ontvangen wanneer iemand
                                    via zo&apos;n link een product koopt.
                                </p>
                                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                                    {affiliatePrinciples.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                                Updates en wijzigingen
                            </h2>
                            <div className="space-y-5 text-base leading-relaxed text-stone-600">
                                <p>
                                    Productinformatie, verpakkingen en samenstellingen kunnen in de
                                    loop van de tijd veranderen. Daarom kunnen beoordelingen,
                                    vergelijkingen en rankings periodiek worden bijgewerkt.
                                </p>
                                <p>
                                    We herijken content onder andere:
                                </p>
                                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                                    {updateMoments.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <p>
                                    Op die manier proberen we informatie zo actueel en bruikbaar
                                    mogelijk te houden, zonder te doen alsof elke beoordeling
                                    definitief of tijdloos is.
                                </p>
                            </div>
                        </section>
                    </div>
                </Container>

                <RelatedPages
                    title="Verder lezen"
                    description="Pagina's die deze methodologie concreet maken binnen het omega 3 cluster."
                    items={relatedPages}
                />
            </main>
        </>
    );
}

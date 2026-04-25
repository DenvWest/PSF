import Container from "@/components/layout/Container";
import {
    BlogArticleExcerpt,
    BlogArticleIntro,
} from "@/components/blog/BlogArticleIntro";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import Link from "next/link";

export function generateMetadata() {
    return buildArticlePageMetadata("magnesium-vergelijken");
}

const products = [
    {
        name: "Magnesium Bisglycinaat",
        bestFor: "Avondgebruik en gevoelige maag",
        form: "Bisglycinaat",
        dosage: "100–200 mg elementair magnesium",
        notes:
            "Vaak gekozen vanwege de milde vorm en praktische inzet in de avondroutine.",
    },
    {
        name: "Magnesium Citraat",
        bestFor: "Algemeen gebruik",
        form: "Citraat",
        dosage: "150–250 mg elementair magnesium",
        notes:
            "Veelgebruikte vorm met brede toepasbaarheid, afhankelijk van persoonlijke voorkeur en tolerantie.",
    },
    {
        name: "Magnesium Malaat",
        bestFor: "Overdag",
        form: "Malaat",
        dosage: "125–250 mg elementair magnesium",
        notes:
            "Wordt vaak gekozen in formules die gericht zijn op dagelijks gebruik buiten de avondroutine.",
    },
];

const factors = [
    {
        title: "Vorm van magnesium",
        text: "Niet elke vorm voelt hetzelfde in gebruik. Bij magnesium kijken we daarom eerst naar de verbinding, zoals bisglycinaat, citraat of malaat, en pas daarna naar de rest van het product.",
    },
    {
        title: "Elementaire dosering",
        text: "We letten niet alleen op het totaalgewicht van een capsule of tablet, maar vooral op hoeveel elementair magnesium een product daadwerkelijk levert per dosering.",
    },
    {
        title: "Hulpstoffen en eenvoud",
        text: "Rustige, heldere formules met beperkte onnodige toevoegingen hebben meestal de voorkeur. Transparantie op het etiket speelt hierbij een belangrijke rol.",
    },
    {
        title: "Gebruiksmoment",
        text: "Sommige magnesiumproducten worden vooral gekozen voor de avond, andere juist voor algemeen dagelijks gebruik. Dat verschil nemen we mee in de vergelijking.",
    },
];

const faq = [
    {
        question: "Welke vorm van magnesium is het best?",
        answer:
            "Dat hangt af van doel, voorkeur en tolerantie. In een vergelijking kijken we daarom niet alleen naar populariteit, maar naar vorm, dosering en praktische toepasbaarheid.",
    },
    {
        question: "Waarom is elementair magnesium belangrijk?",
        answer:
            "Omdat dat beter laat zien hoeveel magnesium je daadwerkelijk binnenkrijgt per dosering. Alleen naar het totale gewicht van de verbinding kijken is vaak misleidend.",
    },
    {
        question: "Is duurder magnesium altijd beter?",
        answer:
            "Nee. Een hogere prijs kan logisch zijn bij een sterke formule of betere transparantie, maar prijs alleen zegt weinig zonder context.",
    },
];

export default function MagnesiumVergelijkenPage() {
    const post = getBlogPostBySlug("magnesium-vergelijken");
    if (!post) {
        throw new Error("Blog post magnesium-vergelijken ontbreekt");
    }

    return (
        <main className="text-stone-900">
            <article>
            <Container>
            <div className="py-16 md:py-20">
                <div className="max-w-6xl">
                    <header>
                    <BlogArticleIntro post={post} />
                    <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                        Magnesium vergelijken: waar let je op per vorm en dosering?
                    </h1>
                    <BlogArticleExcerpt post={post} />
                    </header>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
                        Op deze pagina vergelijken we magnesiumsupplementen op vorm,
                        elementaire dosering, eenvoud van de formule en praktische
                        toepasbaarheid. Zo krijg je sneller overzicht zonder te verdwalen in
                        marketingtermen.
                    </p>

                    <p className="mt-4 max-w-3xl text-base leading-7 text-stone-500">
                        Onze vergelijkingen zijn bedoeld als algemene informatie en sluiten
                        aan op onze{" "}
                        <Link
                            href="/methodologie"
                            className="font-medium text-stone-900 underline underline-offset-4"
                        >
                            methodologie
                        </Link>
                        .
                    </p>
                </div>

                <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {factors.map((factor) => (
                        <article
                            key={factor.title}
                            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-xl font-semibold text-stone-900">
                                {factor.title}
                            </h2>
                            <p className="mt-4 text-base leading-7 text-stone-600">
                                {factor.text}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-16 max-w-6xl">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium text-stone-500">Overzicht</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                Vergelijking van veelgekozen magnesiumopties
                            </h2>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200 text-left">
                                <thead className="bg-stone-50">
                                    <tr className="text-sm text-stone-600">
                                        <th className="px-6 py-4 font-medium">Producttype</th>
                                        <th className="px-6 py-4 font-medium">Beste voor</th>
                                        <th className="px-6 py-4 font-medium">Vorm</th>
                                        <th className="px-6 py-4 font-medium">Indicatieve dosering</th>
                                        <th className="px-6 py-4 font-medium">Opmerking</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {products.map((product) => (
                                        <tr key={product.name} className="align-top">
                                            <td className="px-6 py-5 font-medium text-stone-900">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-5 text-stone-600">
                                                {product.bestFor}
                                            </td>
                                            <td className="px-6 py-5 text-stone-600">
                                                {product.form}
                                            </td>
                                            <td className="px-6 py-5 text-stone-600">
                                                {product.dosage}
                                            </td>
                                            <td className="px-6 py-5 text-stone-600">
                                                {product.notes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <div className="mt-16 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
                    <section className="max-w-4xl">
                        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            Waar wij op letten bij magnesium
                        </h2>

                        <div className="mt-5 space-y-5 text-base leading-8 text-stone-600">
                            <p>
                                Magnesiumvergelijkingen worden snel onduidelijk wanneer alleen
                                de voorkant van de verpakking wordt gevolgd. Daarom kijken we
                                eerst naar de vorm van magnesium en naar de hoeveelheid
                                elementair magnesium per dosering.
                            </p>
                            <p>
                                Daarna speelt ook de rust van de formule mee. Een product met
                                een duidelijke samenstelling, logische dosering en beperkte
                                afleiding op het etiket voelt vaak betrouwbaarder dan een
                                product dat vooral op marketing leunt.
                            </p>
                            <p>
                                We nemen ook het gebruiksmoment mee. Een magnesiumproduct voor
                                de avondroutine vraagt vaak om een andere positionering dan een
                                product dat vooral voor algemeen dagelijks gebruik bedoeld is.
                            </p>
                        </div>
                    </section>

                    <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                        <p className="text-sm font-medium text-stone-500">Gerelateerd</p>
                        <h3 className="mt-2 text-xl font-semibold text-stone-900">
                            Handige vervolgstappen
                        </h3>

                        <div className="mt-5 space-y-4 text-base text-stone-600">
                            <Link
                                href="/beste-magnesium"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300"
                            >
                                <span className="font-medium text-stone-900">Bekijk onze top 3 magnesium →</span>
                                <span className="mt-0.5 block text-sm text-stone-500">Vergeleken op vorm, dosering en prijs per dag</span>
                            </Link>
                            <Link
                                href="/methodologie"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300"
                            >
                                Lees onze methodologie
                            </Link>
                            <Link
                                href="/slaap-supplement-vergelijken"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300"
                            >
                                <span className="font-medium text-stone-900">Slaapsupplementen vergelijken →</span>
                                <span className="mt-0.5 block text-sm text-stone-500">Magnesium staat niet op zichzelf — bekijk het bredere slaapplaatje</span>
                            </Link>
                        </div>
                    </aside>
                </div>

                <section className="mt-16 max-w-4xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                        Veelgestelde vragen over magnesium vergelijken
                    </h2>

                    <div className="mt-6 space-y-4">
                        {faq.map((item) => (
                            <article
                                key={item.question}
                                className="rounded-2xl border border-stone-200 bg-white p-6"
                            >
                                <h3 className="text-lg font-semibold text-stone-900">
                                    {item.question}
                                </h3>
                                <p className="mt-3 text-base leading-7 text-stone-600">
                                    {item.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </Container>
            </article>
        </main>
    );
}
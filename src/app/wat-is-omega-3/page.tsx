import Link from "next/link";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import {
    keyPoints,
    supplementPoints,
    faqs,
} from "@/features/omega3/data/wat-is-omega-3";

const relatedPages = [
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega 3?",
        description: "Praktische checklist voor dosering, transparantie en prijs per dag.",
    },
    {
        href: "/omega-3-vergelijken",
        title: "Omega 3 vergelijken",
        description: "Bekijk producten naast elkaar in een compact overzicht.",
    },
    {
        href: "/beste-omega-3-supplement",
        title: "Beste omega 3 supplement",
        description: "Ga direct naar de beste overall, budget en premium keuzes.",
    },
    {
        href: "/methodologie",
        title: "Onze methodologie",
        description: "Lees hoe producten worden geselecteerd en beoordeeld.",
    },
];

export default function WhatIsOmega3Page() {
    return (
        <main className="bg-white text-slate-900">
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                        Uitleg
                    </p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                        Wat is omega 3?
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                        Een heldere introductie voor bezoekers die eerst willen begrijpen wat omega 3 is
                        en waarom supplementen onderling kunnen verschillen.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/omega-3-vergelijken"
                            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800"
                        >
                            Bekijk vergelijking
                        </Link>
                        <Link
                            href="/beste-omega-3-supplement"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                        >
                            Bekijk beste keuzes
                        </Link>
                    </div>
                </div>
            </section>

            <ContentSection
                title="In het kort"
                description="Deze pagina helpt je eerst de basis te begrijpen voordat je producten gaat vergelijken."
            >
                <div className="grid gap-5 md:grid-cols-3">
                    {keyPoints.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                        </article>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Wil je na deze basis vooral begrijpen hoe je supplementen beoordeelt?
                    Lees dan ook{" "}
                    <Link
                        href="/waar-let-je-op-bij-omega-3"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        waar je op let bij omega 3 supplementen
                    </Link>{" "}
                    en bekijk onze{" "}
                    <Link
                        href="/methodologie"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        methodologie
                    </Link>
                    .
                </p>
            </ContentSection>

            <ContentSection
                title="Wat betekent dit voor supplementen?"
                description="Voor bezoekers van een supplementsite is vooral belangrijk dat niet elk omega 3 product hetzelfde is."
            >
                <p className="mb-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                    Wil je direct zien hoe producten onderling verschillen? Bekijk dan ook onze{" "}
                    <Link
                        href="/omega-3-vergelijken"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        vergelijking van omega 3 supplementen
                    </Link>
                    .
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {supplementPoints.map((point) => (
                        <div
                            key={point}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                            <p className="text-sm leading-6 text-slate-600">{point}</p>
                        </div>
                    ))}
                </div>
            </ContentSection>

            <ContentSection
                title="Voor wie is dit handig?"
                description="Deze uitlegpagina is vooral nuttig voor bezoekers die nog niet direct klaar zijn om een product te kiezen."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: "Beginners",
                            text: "Voor bezoekers die eerst rustig willen snappen waar omega 3 over gaat.",
                        },
                        {
                            title: "Vergelijkers",
                            text: "Voor mensen die inhoudelijk beter willen begrijpen waarom producten verschillen.",
                        },
                        {
                            title: "Twijfelaars",
                            text: "Voor bezoekers die nog niet weten of ze direct een beste keuze of een vergelijking nodig hebben.",
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
                    Wil je liever meteen een eerste selectie zien? Bekijk dan de pagina met{" "}
                    <Link
                        href="/beste-omega-3-supplement"
                        className="font-medium text-green-700 underline-offset-4 hover:underline"
                    >
                        beste omega 3 supplementen
                    </Link>
                    .
                </p>
            </ContentSection>

            <ContentSection
                title="Waar wil je hierna naartoe?"
                description="Na deze basisuitleg kiezen de meeste bezoekers één van deze vervolgstappen."
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold">Supplementen vergelijken</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Bekijk producten naast elkaar op dosering, gebruiksgemak, transparantie en prijs.
                        </p>
                        <Link
                            href="/omega-3-vergelijken"
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
                        >
                            Naar vergelijking
                        </Link>
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold">Beste keuzes bekijken</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            Ga direct naar een selectie van beste overall, prijs-kwaliteit en premium keuzes.
                        </p>
                        <Link
                            href="/beste-omega-3-supplement"
                            className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:border-slate-300"
                        >
                            Bekijk beste keuzes
                        </Link>
                    </article>
                </div>
            </ContentSection>

            <ContentSection
                title="Veelgestelde vragen"
                description="Een paar korte antwoorden op veelvoorkomende vragen rond omega 3 en supplementen."
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
                title="Klaar om verder te kijken?"
                description="Gebruik deze uitleg als startpunt en ga daarna door naar vergelijken of de beste keuzes."
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/omega-3-vergelijken"
                        className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
                    >
                        Vergelijk omega 3 supplementen
                    </Link>
                    <Link
                        href="/beste-omega-3-supplement"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:border-slate-300"
                    >
                        Bekijk beste omega 3 supplementen
                    </Link>
                </div>
            </ContentSection>

            <RelatedPages
                title="Verder lezen"
                description="Logische vervolgstappen als je na de basisuitleg verder wilt binnen het omega 3 cluster."
                items={relatedPages}
            />
        </main>
    );
}

import Link from "next/link";
import Container from "@/components/layout/Container";
import {
    BlogArticleExcerpt,
    BlogArticleIntro,
} from "@/components/blog/BlogArticleIntro";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import {
    keyPoints,
    supplementPoints,
    faqs,
} from "@/features/omega3/data/wat-is-omega-3";

export function generateMetadata() {
    return {
        ...buildArticlePageMetadata("wat-is-omega-3"),
        alternates: { canonical: "https://perfectsupplement.nl/wat-is-omega-3" },
    };
}

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
    const post = getBlogPostBySlug("wat-is-omega-3");
    if (!post) {
        throw new Error("Blog post wat-is-omega-3 ontbreekt");
    }

    return (
        <main className="text-stone-900">
            <article>
                <div className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0]">
                    <Container>
                        <nav aria-label="Breadcrumb" className="pt-6 pb-2">
                            <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
                                <li className="flex items-center gap-1">
                                    <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
                                    <span aria-hidden="true">/</span>
                                </li>
                                <li className="flex items-center gap-1">
                                    <Link href="/omega-3-vergelijken" className="hover:text-stone-600 transition-colors">Omega 3</Link>
                                    <span aria-hidden="true">/</span>
                                </li>
                                <li>
                                    <span className="text-stone-600">Wat is omega 3?</span>
                                </li>
                            </ol>
                        </nav>

                        <section className="pt-10 pb-20 md:pt-14 md:pb-28">
                            <header>
                                <BlogArticleIntro post={post} />
                                <h1 className="font-display mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-3xl">
                                    Wat is omega 3?
                                </h1>
                                <BlogArticleExcerpt post={post} />
                            </header>
                            <p className="mt-5 max-w-xl text-lg text-stone-500 leading-relaxed">
                                Een heldere introductie voor bezoekers die eerst willen begrijpen wat omega 3 is
                                en waarom supplementen onderling kunnen verschillen.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/omega-3-vergelijken"
                                    className="inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
                                >
                                    Bekijk vergelijking
                                </Link>
                                <Link
                                    href="/beste-omega-3-supplement"
                                    className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                                >
                                    Bekijk beste keuzes
                                </Link>
                            </div>
                        </section>
                    </Container>
                </div>

                <ContentSection
                    title="In het kort"
                    description="Deze pagina helpt je eerst de basis te begrijpen voordat je producten gaat vergelijken."
                >
                    <div className="grid gap-5 md:grid-cols-3">
                        {keyPoints.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                            >
                                <h3 className="font-display text-lg font-semibold text-stone-900">{item.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.text}</p>
                            </article>
                        ))}
                    </div>
                    <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-600">
                        Wil je na deze basis vooral begrijpen hoe je supplementen beoordeelt?
                        Lees dan ook{" "}
                        <Link
                            href="/waar-let-je-op-bij-omega-3"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            waar je op let bij omega 3 supplementen
                        </Link>{" "}
                        en bekijk onze{" "}
                        <Link
                            href="/methodologie"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
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
                    <p className="mb-4 max-w-3xl text-base leading-relaxed text-stone-600">
                        Wil je direct zien hoe producten onderling verschillen? Bekijk dan ook onze{" "}
                        <Link
                            href="/omega-3-vergelijken"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            vergelijking van omega 3 supplementen
                        </Link>
                        .
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        {supplementPoints.map((point) => (
                            <div
                                key={point}
                                className="rounded-2xl border border-stone-200 bg-[#F7F5F0]/50 p-5"
                            >
                                <p className="text-sm leading-relaxed text-stone-600">{point}</p>
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
                                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                            >
                                <h3 className="font-display text-base font-semibold text-stone-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-600">
                        Wil je liever meteen een eerste selectie zien? Bekijk dan de pagina met{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
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
                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <h3 className="font-display text-xl font-semibold text-stone-900">Supplementen vergelijken</h3>
                            <p className="mt-3 text-sm leading-relaxed text-stone-600">
                                Bekijk producten naast elkaar op dosering, gebruiksgemak, transparantie en prijs.
                            </p>
                            <Link
                                href="/omega-3-vergelijken"
                                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A7F5A] transition-colors"
                            >
                                Naar vergelijking
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <h3 className="font-display text-xl font-semibold text-stone-900">Beste keuzes bekijken</h3>
                            <p className="mt-3 text-sm leading-relaxed text-stone-600">
                                Ga direct naar een selectie van beste overall, prijs-kwaliteit en premium keuzes.
                            </p>
                            <Link
                                href="/beste-omega-3-supplement"
                                className="mt-6 inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-900 hover:border-stone-300 transition-colors"
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
                                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                            >
                                <h3 className="font-display text-base font-semibold text-stone-900">{faq.question}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </ContentSection>

                <section className="mt-16 md:mt-20 border-t border-stone-100 pt-12">
                    <Container>
                        <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/beste-omega-3-supplement" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                                <p className="text-base text-stone-600 leading-relaxed">Klaar om een product te kiezen? Bekijk onze top 5 op EPA/DHA, prijs en transparantie.</p>
                                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk beste omega 3 →</span>
                            </Link>
                            <Link href="/omega-3-vergelijken" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                                <p className="text-base text-stone-600 leading-relaxed">Alle producten naast elkaar — snel de verschillen zien zonder twijfelen.</p>
                                <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Vergelijk omega 3 supplementen →</span>
                            </Link>
                        </div>
                    </Container>
                </section>

                <Container>
                    <section className="mt-16 mb-12">
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 px-8 py-10 text-center">
                            <p className="text-sm font-semibold uppercase tracking-widest text-amber-700 mb-3">Persoonlijk advies</p>
                            <p className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                                Weet jij welk supplement bij jou past?
                            </p>
                            <p className="text-base text-stone-500 leading-relaxed mb-6 max-w-md mx-auto">
                                12 vragen, 3 minuten — direct een persoonlijk herstelplan.
                            </p>
                            <Link
                                href="/intake"
                                className="inline-block bg-[#5A8F6A] text-white rounded-xl px-8 py-4 text-base font-semibold hover:bg-[#4A7F5A] transition-colors"
                            >
                                Start de gratis intake →
                            </Link>
                        </div>
                    </section>
                </Container>

                <RelatedPages
                    title="Verder lezen"
                    description="Logische vervolgstappen als je na de basisuitleg verder wilt binnen het omega 3 cluster."
                    items={relatedPages}
                />
            </article>
        </main>
    );
}

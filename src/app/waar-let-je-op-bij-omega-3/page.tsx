import Link from "next/link";
import Container from "@/components/layout/Container";
import {
    BlogArticleExcerpt,
    BlogArticleIntro,
} from "@/components/blog/BlogArticleIntro";
import ContentSection from "@/components/ui/ContentSection";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import {
    attentionPoints,
    mistakes,
    deepDiveSections,
    faqs,
} from "@/features/omega3/data/waar-let-je-op-bij-omega-3";

export function generateMetadata() {
    return buildArticlePageMetadata("waar-let-je-op-bij-omega-3");
}

const epaSection = deepDiveSections[0];
const doseringSection = deepDiveSections[1];
const capsulesSection = deepDiveSections[2];
const prijsSection = deepDiveSections[3];
const transparantieSection = deepDiveSections[4];

export default function WaarLetJeOpBijOmega3Page() {
    const post = getBlogPostBySlug("waar-let-je-op-bij-omega-3");
    if (!post) {
        throw new Error("Blog post waar-let-je-op-bij-omega-3 ontbreekt");
    }

    return (
        <main className="text-stone-900">
            <article>
            {/* 1. Hero */}
            <section className="border-b border-stone-200 bg-stone-50">
                <Container className="py-16 md:py-24">
                    <header>
                    <BlogArticleIntro post={post} />
                    <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                        Waar let je op bij omega&nbsp;3 supplementen?
                    </h1>
                    <BlogArticleExcerpt post={post} />
                    </header>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                        Niet elke omega&nbsp;3 is hetzelfde. In deze gids lees je waar je op let bij dosering,
                        EPA en DHA, prijs per dag, gebruiksgemak en kwaliteit — zodat je producten eerlijk
                        kunt vergelijken.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/beste-omega-3-supplement"
                            className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                        >
                            Bekijk beste omega&nbsp;3 supplementen
                        </Link>
                        <Link
                            href="/omega-3-vergelijken"
                            className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                        >
                            Vergelijk supplementen
                        </Link>
                    </div>
                </Container>
            </section>

            {/* 2. Samenvatting */}
            <ContentSection
                title="Waar let je op bij omega 3?"
                description="Bij omega 3 supplementen zie je de grootste verschillen terug in samenstelling, dagdosering en hoe helder een product de informatie presenteert. Dit zijn de vier punten die er het meest toe doen."
            >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {attentionPoints.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                        >
                            <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
                        </article>
                    ))}
                </div>
            </ContentSection>

            {/* 3. EPA en DHA uitgelegd */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Samenstelling
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            {epaSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">{epaSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                            {epaSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-600">—</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* 4. Dosering */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Dosering
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            {doseringSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">{doseringSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                            {doseringSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-600">—</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* 5. Prijs per dag */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Kosten
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            {prijsSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">{prijsSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                            {prijsSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-600">—</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* 6. Capsules per dag */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Gebruiksgemak
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            {capsulesSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">{capsulesSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                            {capsulesSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-600">—</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* 7. Kwaliteit en transparantie */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Kwaliteit
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            {transparantieSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">{transparantieSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600">
                            {transparantieSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-600">—</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
            </section>

            {/* 8. Hoe wij vergelijken */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl rounded-2xl border border-stone-200 bg-stone-50 px-6 py-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-800">
                            Methodologie
                        </p>
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">
                            Hoe wij vergelijken
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                            We beoordelen omega&nbsp;3 supplementen op dezelfde criteria die je op deze
                            pagina hebt gelezen: EPA en DHA per dagdosering, prijs per dag, capsules per dag
                            en de duidelijkheid van productinformatie. Marketingclaims tellen niet mee;
                            aantoonbare productspecificaties wel.
                        </p>
                        <Link
                            href="/methodologie"
                            className="mt-5 inline-flex items-center text-sm font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            Lees hoe we beoordelen →
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Inline CTA */}
            <section className="py-6">
                <Container>
                    <div className="rounded-2xl border border-stone-200 bg-stone-100 px-6 py-5">
                        <p className="text-sm font-medium text-stone-900">
                            Klaar met lezen en wil je direct de beste keuzes zien?
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-800">
                            We hebben de topkeuzes voor overall, prijs-kwaliteit en premium al op een rij gezet.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Bekijk beste omega&nbsp;3 supplementen →
                            </Link>
                            <Link
                                href="/wat-is-omega-3"
                                className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-400"
                            >
                                Wat is omega&nbsp;3? Lees de basisgids →
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 9. Veelgemaakte fouten */}
            <ContentSection
                id="veelgemaakte-fouten"
                title="Veelgemaakte fouten bij het vergelijken"
                description="Veel bezoekers vergelijken producten te snel op basis van prijs of de grootste getallen op de verpakking. Dit zijn de misstappen die dat voorkomen."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {mistakes.map((mistake) => (
                        <div
                            key={mistake}
                            className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                        >
                            <p className="text-sm leading-6 text-stone-600">{mistake}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-sm leading-6 text-stone-600">
                    Wil je producten direct naast elkaar zien? Bekijk dan onze{" "}
                    <Link
                        href="/omega-3-vergelijken"
                        className="font-medium text-stone-800 underline-offset-4 hover:underline"
                    >
                        vergelijking van omega&nbsp;3 supplementen
                    </Link>
                    .
                </p>
            </ContentSection>

            {/* 10. FAQ */}
            <ContentSection
                id="faq"
                title="Veelgestelde vragen"
                description="Gerichte antwoorden op vragen die vaak opkomen rond dosering, EPA, DHA en dagelijks gebruik."
            >
                <div className="space-y-4">
                    {faqs.slice(0, 4).map((faq) => (
                        <div
                            key={faq.question}
                            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-base font-semibold text-stone-900">{faq.question}</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </ContentSection>

            {/* 11. Afsluitende CTA */}
            <section className="border-t border-stone-100 py-16 md:py-20">
                <Container>
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Volgende stap
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            Bekijk de beste omega&nbsp;3 supplementen
                        </h2>
                        <p className="mt-4 text-base leading-7 text-stone-600">
                            Nu je weet waar je op let, kun je producten gericht vergelijken. We hebben de
                            sterkste keuzes op EPA en DHA, prijs per dag en transparantie al op een rij
                            gezet.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                            >
                                Bekijk beste omega&nbsp;3 supplementen
                            </Link>
                            <Link
                                href="/omega-3-vergelijken"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                            >
                                Vergelijk supplementen
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            </article>

        </main>
    );
}

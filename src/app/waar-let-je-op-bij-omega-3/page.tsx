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
            <div className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0]">
            <section>
                <Container className="pt-0 pb-0">
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
                                <span className="text-stone-600">Waar let je op bij omega 3?</span>
                            </li>
                        </ol>
                    </nav>

                    <div className="pt-10 pb-20 md:pt-14 md:pb-28">
                        <header>
                            <BlogArticleIntro post={post} />
                            <h1 className="font-display mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-3xl">
                                Waar let je op bij omega&nbsp;3 supplementen?
                            </h1>
                            <BlogArticleExcerpt post={post} />
                        </header>
                        <p className="mt-5 max-w-xl text-lg text-stone-500 leading-relaxed">
                            Niet elke omega&nbsp;3 is hetzelfde. In deze gids lees je waar je op let bij dosering,
                            EPA en DHA, prijs per dag, gebruiksgemak en kwaliteit — zodat je producten eerlijk
                            kunt vergelijken.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
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
            </div>

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
                            <h3 className="font-display text-base font-semibold text-stone-900">{item.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.text}</p>
                        </article>
                    ))}
                </div>
            </ContentSection>

            {/* 3. EPA en DHA uitgelegd */}
            <section className="border-t border-stone-100 py-12 md:py-16">
                <Container>
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Samenstelling
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            {epaSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">{epaSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                            {epaSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-400">—</span>
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Dosering
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            {doseringSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">{doseringSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                            {doseringSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-400">—</span>
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Kosten
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            {prijsSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">{prijsSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                            {prijsSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-400">—</span>
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Gebruiksgemak
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            {capsulesSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">{capsulesSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                            {capsulesSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-400">—</span>
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
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Kwaliteit
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            {transparantieSection.title}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">{transparantieSection.intro}</p>
                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-stone-600">
                            {transparantieSection.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                    <span className="mt-0.5 flex-shrink-0 text-stone-400">—</span>
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
                    <div className="max-w-3xl rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 px-6 py-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Methodologie
                        </p>
                        <h2 className="font-display mt-3 text-xl font-semibold text-stone-900">
                            Hoe wij vergelijken
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-stone-600">
                            We beoordelen omega&nbsp;3 supplementen op dezelfde criteria die je op deze
                            pagina hebt gelezen: EPA en DHA per dagdosering, prijs per dag, capsules per dag
                            en de duidelijkheid van productinformatie. Marketingclaims tellen niet mee;
                            aantoonbare productspecificaties wel.
                        </p>
                        <Link
                            href="/methodologie"
                            className="mt-5 inline-flex items-center text-sm font-medium text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                        >
                            Lees hoe we beoordelen →
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Inline CTA */}
            <section className="py-6">
                <Container>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5">
                        <p className="text-sm font-medium text-stone-900">
                            Klaar met lezen en wil je direct de beste keuzes zien?
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-600">
                            We hebben de topkeuzes voor overall, prijs-kwaliteit en premium al op een rij gezet.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center rounded-xl bg-[#5A8F6A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
                            >
                                Bekijk beste omega&nbsp;3 supplementen →
                            </Link>
                            <Link
                                href="/wat-is-omega-3"
                                className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-300"
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
                            className="rounded-2xl border border-stone-200 bg-[#F7F5F0]/50 p-5"
                        >
                            <p className="text-sm leading-relaxed text-stone-600">{mistake}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-600">
                    Wil je producten direct naast elkaar zien? Bekijk dan onze{" "}
                    <Link
                        href="/omega-3-vergelijken"
                        className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
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
                            <h3 className="font-display text-base font-semibold text-stone-900">{faq.question}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-stone-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </ContentSection>

            {/* 11. Lees ook */}
            <section className="border-t border-stone-100 pt-12 pb-0">
                <Container>
                    <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/beste-omega-3-supplement" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                            <p className="text-base text-stone-600 leading-relaxed">Klaar om een product te kiezen? Onze top 5 vergeleken op EPA/DHA, prijs per dag en transparantie.</p>
                            <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk beste omega 3 →</span>
                        </Link>
                        <Link href="/omega-3-vergelijken" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                            <p className="text-base text-stone-600 leading-relaxed">Alle producten naast elkaar in een vergelijkingstabel — snel de verschillen zien.</p>
                            <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Vergelijk omega 3 supplementen →</span>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* 12. Afsluitende CTA */}
            <section className="border-t border-stone-100 py-16 md:py-20">
                <Container>
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Volgende stap
                        </p>
                        <h2 className="font-display mt-3 text-2xl md:text-3xl font-bold text-stone-900">
                            Bekijk de beste omega&nbsp;3 supplementen
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-stone-600">
                            Nu je weet waar je op let, kun je producten gericht vergelijken. We hebben de
                            sterkste keuzes op EPA en DHA, prijs per dag en transparantie al op een rij
                            gezet.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/beste-omega-3-supplement"
                                className="inline-flex items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7F5A]"
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

                    <div className="mt-12 bg-amber-50 rounded-2xl border border-amber-100 px-8 py-10 text-center">
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
                </Container>
            </section>

            </article>

        </main>
    );
}

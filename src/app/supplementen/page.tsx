import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
    title: "Supplementengids voor mannen 40+ | PerfectSupplement",
    description:
        "Eerlijke informatie over supplementen voor mannen boven de 40. Werking, vormen en dosering — zonder rankings of verkooppraatjes.",
};

/* ── Data ──────────────────────────────────────────────────────── */

const featured = [
    {
        slug: "magnesium",
        naam: "Magnesium",
        icoon: "⚡",
        beschrijving:
            "Het meest veelzijdige mineraal voor mannen 40+. Ondersteunt slaap, stressregulatie en spierherstel — in meerdere vormen beschikbaar.",
        categorieen: ["Slaap", "Stress", "Spieren"],
        // Subtle green-tinted white gradient
        gradientStyle: {
            background:
                "linear-gradient(145deg, #ffffff 0%, #dff0e8 100%)",
        } as React.CSSProperties,
        tagClass: "border border-emerald-200 text-emerald-700 bg-emerald-50/60",
        accentClass: "text-emerald-700",
        accentBorder: "border-t-2 border-emerald-400/60",
    },
    {
        slug: "ashwagandha",
        naam: "Ashwagandha",
        icoon: "🌿",
        beschrijving:
            "Een adaptogeen met sterke onderbouwing. Verlaagt cortisol, ondersteunt mentale veerkracht en helpt bij herstel na chronische stress.",
        categorieen: ["Stress", "Herstel", "Veerkracht"],
        // Subtle amber-tinted white gradient
        gradientStyle: {
            background:
                "linear-gradient(145deg, #ffffff 0%, #fde8c0 100%)",
        } as React.CSSProperties,
        tagClass: "border border-amber-200 text-amber-700 bg-amber-50/60",
        accentClass: "text-amber-700",
        accentBorder: "border-t-2 border-amber-400/60",
    },
];

const supplementen = [
    {
        slug: "omega-3",
        naam: "Omega-3",
        subtitel: "EPA / DHA",
        icoon: "🧠",
        beschrijving:
            "Ondersteunt hart en hersenen, en dempt laaggradige ontstekingen die energie en stemming beïnvloeden.",
        categorieen: ["Hart", "Hersenen", "Ontstekingen"],
        accentDot: "bg-sky-400",
        tagClass: "border border-stone-200 text-stone-500 bg-stone-50",
    },
    {
        slug: "vitamine-d",
        naam: "Vitamine D3 + K2",
        subtitel: "Cholecalciferol",
        icoon: "☀️",
        beschrijving:
            "Essentieel bij weinig zonlicht. Speelt een rol bij energie, immuunfunctie en testosteronondersteuning.",
        categorieen: ["Energie", "Immuun", "Botten"],
        accentDot: "bg-amber-400",
        tagClass: "border border-stone-200 text-stone-500 bg-stone-50",
    },
    {
        slug: "melatonine",
        naam: "Melatonine",
        subtitel: "Slaaphormoon",
        icoon: "🌙",
        beschrijving:
            "Helpt bij het inslapen en het herstellen van een verstoord dag-nachtritme. Geen slaappil, wel een signaal.",
        categorieen: ["Slaap", "Bioritme"],
        accentDot: "bg-indigo-400",
        tagClass: "border border-stone-200 text-stone-500 bg-stone-50",
    },
];

const principes = [
    {
        nummer: "01",
        titel: "Onafhankelijk",
        tekst: "Geen sponsors, geen betaalde plaatsingen. Elk advies is gebaseerd op openbare bronnen en peer-reviewed onderzoek.",
    },
    {
        nummer: "02",
        titel: "Onderbouwd",
        tekst: "We verwijzen naar onderzoek en vermijden medische claims. Wat niet bewezen is, noemen we niet.",
    },
    {
        nummer: "03",
        titel: "Transparant",
        tekst: "Onze beoordelingsmethode is openbaar beschikbaar.",
        link: { label: "Bekijk de methodologie", href: "/methodologie" },
    },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function SupplementenPage() {
    return (
        <div className="relative">
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section
                className="relative overflow-hidden border-b border-stone-200/60 bg-white"
                aria-label="Introductie"
            >
                {/* Ambient glow — upper left, very subtle on light bg */}
                <div
                    className="pointer-events-none absolute -left-48 -top-48 h-[36rem] w-[36rem] rounded-full opacity-[0.07]"
                    aria-hidden="true"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(16,124,106,1) 0%, transparent 70%)",
                    }}
                />
                {/* Ambient glow — lower right */}
                <div
                    className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full opacity-[0.05]"
                    aria-hidden="true"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(180,83,9,1) 0%, transparent 70%)",
                    }}
                />

                <Container className="relative pt-12 pb-20 md:pt-20 md:pb-28">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-12 md:mb-16">
                        <ol className="flex items-center gap-2 text-[0.8125rem] text-stone-500">
                            <li>
                                <Link
                                    href="/"
                                    className="transition hover:text-stone-800"
                                >
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true" className="select-none text-stone-400">
                                ›
                            </li>
                            <li className="font-medium text-stone-700">
                                Supplementen
                            </li>
                        </ol>
                    </nav>

                    <div className="max-w-3xl">
                        <p className="mb-5 text-[0.625rem] font-medium uppercase tracking-[0.26em] text-stone-500">
                            Supplementengids
                        </p>
                        <h1 className="font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-stone-900 md:text-[4.5rem]">
                            Weloverwogen kiezen,
                            <br />
                            <span className="text-stone-500"> zonder ruis.</span>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-[1.8] text-stone-600 md:text-xl">
                            Supplementen kunnen helpen — maar alleen als je weet
                            wat je neemt en waarom. Geen rankings of sterren. Wel
                            eerlijke informatie over werking, vormen en dosering.
                        </p>
                    </div>
                </Container>
            </section>

            {/* ── Featured supplements ─────────────────────────────── */}
            <section
                className="bg-[--ps-bg] py-20 md:py-28"
                aria-label="Aanbevolen supplementen"
            >
                <Container>
                    <div className="mb-8 flex items-center gap-3 md:mb-10">
                        <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
                        <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-500">
                            Meest gelezen
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {featured.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/supplementen/${item.slug}`}
                                className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-stone-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(0,0,0,0.13)] md:min-h-[420px] md:p-10 ${item.accentBorder}`}
                                style={item.gradientStyle}
                            >
                                {/* Icon */}
                                <span
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-2xl ring-1 ring-stone-200/70 shadow-sm"
                                    aria-hidden="true"
                                >
                                    {item.icoon}
                                </span>

                                {/* Content */}
                                <div className="mt-auto flex flex-1 flex-col justify-end pb-8 pt-10 md:pb-10">
                                    <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                                        {item.naam}
                                    </h2>
                                    <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-stone-600">
                                        {item.beschrijving}
                                    </p>

                                    {/* Tags */}
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {item.categorieen.map((cat) => (
                                            <span
                                                key={cat}
                                                className={`rounded-full px-3 py-1 text-[0.6875rem] font-medium ${item.tagClass}`}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div
                                        className={`mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide ${item.accentClass}`}
                                    >
                                        <span>Lees de gids</span>
                                        <span
                                            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── All supplements ──────────────────────────────────── */}
            <section
                className="bg-[--ps-bg] pb-20 md:pb-28"
                aria-label="Alle supplementen"
            >
                <Container>
                    <div className="mb-8 flex items-center gap-3 md:mb-10">
                        <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
                        <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-500">
                            Alle gidsen
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {supplementen.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/supplementen/${item.slug}`}
                                className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,0.07)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.11)] md:min-h-[300px] md:p-7"
                            >
                                {/* Accent dot — top-right corner */}
                                <div
                                    className={`absolute right-5 top-5 h-1.5 w-1.5 rounded-full opacity-80 ${item.accentDot}`}
                                    aria-hidden="true"
                                />

                                {/* Icon */}
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-xl ring-1 ring-stone-200/60"
                                    aria-hidden="true"
                                >
                                    {item.icoon}
                                </span>

                                {/* Content */}
                                <div className="mt-6 flex flex-1 flex-col">
                                    <h2 className="font-display text-lg font-semibold tracking-tight text-stone-900">
                                        {item.naam}
                                    </h2>
                                    {item.subtitel && (
                                        <p className="mt-0.5 text-xs tracking-wide text-stone-500">
                                            {item.subtitel}
                                        </p>
                                    )}

                                    <p className="mt-3 text-[0.875rem] leading-relaxed text-stone-600">
                                        {item.beschrijving}
                                    </p>

                                    {/* Tags */}
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {item.categorieen.map((cat) => (
                                            <span
                                                key={cat}
                                                className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium ${item.tagClass}`}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-auto flex items-center gap-3 pt-6 text-xs font-semibold uppercase tracking-wide text-stone-500 transition duration-300 group-hover:text-stone-800">
                                        <span>Lees de gids</span>
                                        <span
                                            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── Route advice ─────────────────────────────────────── */}
            <section
                className="border-t border-stone-200/60 bg-[--ps-bg] py-20 md:py-28"
                aria-label="Navigatie naar symptomen"
            >
                <Container>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="ps-eyebrow mb-5">Niet zeker?</p>
                        <p className="font-display text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            Begin bij wat je voelt,
                            <br className="hidden sm:block" />
                            niet bij een product.
                        </p>
                        <p className="mx-auto mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-stone-600">
                            Onze symptoomgidsen helpen je eerst begrijpen wat er
                            speelt — en wijzen je daarna naar wat kan helpen.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {[
                                { label: "Stress", href: "/symptomen/stress" },
                                { label: "Slaapproblemen", href: "/symptomen/slaap" },
                                { label: "Energieverlies", href: "/symptomen/energie" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="group flex w-full items-center justify-between rounded-xl border border-stone-200/80 bg-white px-6 py-4 text-sm font-medium text-stone-800 shadow-sm transition duration-200 hover:border-stone-300 hover:shadow-md sm:w-auto sm:justify-center sm:gap-2"
                                >
                                    <span>{link.label}</span>
                                    <span
                                        className="text-stone-400 transition-transform duration-300 group-hover:translate-x-0.5"
                                        aria-hidden="true"
                                    >
                                        →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── Trust / Werkwijze ────────────────────────────────── */}
            <section
                className="border-t border-stone-200/60 py-20 md:py-28"
                aria-label="Onze werkwijze"
            >
                <Container>
                    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
                        {principes.map((p) => (
                            <div key={p.nummer}>
                                <span className="block text-4xl font-bold text-stone-300 md:text-5xl">
                                    {p.nummer}
                                </span>
                                <h2 className="mt-3 text-base font-semibold text-stone-900">
                                    {p.titel}
                                </h2>
                                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-stone-600">
                                    {p.tekst}
                                    {p.link && (
                                        <>
                                            {" "}
                                            <Link
                                                href={p.link.href}
                                                className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900 hover:decoration-stone-500"
                                            >
                                                {p.link.label}
                                            </Link>
                                        </>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── JSON-LD ──────────────────────────────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Home",
                                item: "https://perfectsupplement.nl",
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Supplementen",
                            },
                        ],
                    }),
                }}
            />
        </div>
    );
}

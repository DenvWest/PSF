import Container from "@/components/layout/Container";
import Link from "next/link";

const sections = [
    {
        title: "Ingrediënten",
        text: "Lees rustige, inhoudelijke uitleg over ingrediënten, met de meeste diepgang rond omega-3 en vitamine D; andere categorieën volgen naarmate ze worden uitgebouwd.",
        links: [
            { label: "Wat is omega-3?", href: "/wat-is-omega-3" },
            { label: "Waar let je op bij omega-3?", href: "/waar-let-je-op-bij-omega-3" },
            { label: "Vitamine D supplementen", href: "/supplementen" },
        ],
    },
    {
        title: "Vergelijkingen",
        text: "Vergelijk supplementen op inhoud, dosering en transparantie — begin bij omega-3 en vitamine D waar de site het meest uitdiept.",
        links: [
            { label: "Omega-3 vergelijken", href: "/omega-3-vergelijken" },
            { label: "Vitamine D supplementen", href: "/supplementen" },
            { label: "Magnesium vergelijken", href: "/magnesium-vergelijken" },
        ],
    },
    {
        title: "Keuzehulpen",
        text: "Gebruik overzichtspagina’s en gidsen om sneller te bepalen welke route past — onder meer rond omega-3 en vitamine D.",
        links: [
            { label: "Beste omega-3 supplement", href: "/beste-omega-3-supplement" },
            { label: "Omega-3 en vitamine D (overzicht)", href: "/supplementen" },
            { label: "Lees onze methodologie", href: "/methodologie" },
        ],
    },
];

export default function KennisbankPage() {
    return (
        <Container>
            <div className="py-16 md:py-20">
                <div className="max-w-6xl">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Kennisbank
                    </p>

                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                        Kennisbank over supplementen, met nadruk op omega-3 en vitamine D
                    </h1>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                        In de kennisbank vind je uitleg, vergelijkingen en keuzehulpen die
                        helpen om supplementen rustiger en beter te begrijpen. Omega-3 en
                        vitamine D zijn het meest uitgewerkt; andere onderwerpen worden
                        aangevuld waar dat zinvol is. De focus blijft op inhoud, dosering,
                        transparantie en context.
                    </p>
                </div>

                <section className="mt-12 grid gap-6 lg:grid-cols-3">
                    {sections.map((section) => (
                        <article
                            key={section.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {section.title}
                            </h2>

                            <p className="mt-4 text-base leading-7 text-slate-600">
                                {section.text}
                            </p>

                            <div className="mt-6 space-y-3">
                                {section.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>

                <section className="mt-16 max-w-4xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        Hoe je de kennisbank gebruikt
                    </h2>

                    <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                        <p>
                            Gebruik de kennisbank als inhoudelijk startpunt. Voor omega-3 en
                            vitamine D kun je het supplementenoverzicht combineren met de
                            uitleg- en vergelijkingslinks hierboven. Bij andere ingrediënten
                            of doelen geldt hetzelfde patroon naarmate er meer pagina’s bij
                            komen.
                        </p>

                        <p>
                            Zo blijft de site rustiger: de kennisbank verzamelt de uitleg en
                            verdieping, terwijl de supplementen-pagina vooral helpt bij het
                            kiezen van een richting.
                        </p>
                    </div>
                </section>
            </div>
        </Container>
    );
}
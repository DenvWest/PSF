import Container from "@/components/layout/Container";
import Link from "next/link";

const filters = [
    "Alles",
    "Ingrediënten",
    "Doelen",
    "Vergelijkingen",
];

const items = [
    {
        title: "Omega-3",
        eyebrow: "Ingrediënt",
        description:
            "Bekijk uitleg, vergelijking en keuzehulp rond omega-3 supplementen.",
        badge: "Populair",
        href: "/omega-3-vergelijken",
        secondaryHref: "/beste-omega-3-supplement",
        secondaryLabel: "Beste keuze",
    },
    {
        title: "Magnesium",
        eyebrow: "Ingrediënt",
        description:
            "Krijg overzicht in vormen, doseringen en praktische verschillen tussen magnesiumproducten.",
        badge: "Veelgekozen",
        href: "/magnesium-vergelijken",
        secondaryHref: "/beste-magnesium",
        secondaryLabel: "Beste keuze",
    },
    {
        title: "Slaap",
        eyebrow: "Doel",
        description:
            "Verken formules en vergelijk slaap supplementen rustiger op samenstelling en gebruik.",
        badge: "Avondroutine",
        href: "/slaap-supplement-vergelijken",
        secondaryHref: "/blog",
        secondaryLabel: "Meer context",
    },
    {
        title: "Vitamine D",
        eyebrow: "Ingrediënt",
        description:
            "Een logische categorie voor verdere uitbouw met uitleg, vergelijking en keuzehulp.",
        badge: "In ontwikkeling",
        href: "/blog",
        secondaryHref: "/methodologie",
        secondaryLabel: "Hoe wij beoordelen",
    },
    {
        title: "Creatine",
        eyebrow: "Ingrediënt",
        description:
            "Geschikt om later uit te bouwen met vergelijkingen en praktische gidsen.",
        badge: "In ontwikkeling",
        href: "/blog",
        secondaryHref: "/methodologie",
        secondaryLabel: "Hoe wij beoordelen",
    },
    {
        title: "Probiotica",
        eyebrow: "Doel / darmgezondheid",
        description:
            "Een categorie die later goed past binnen het blog, vergelijkingen en keuzehulpen.",
        badge: "In ontwikkeling",
        href: "/blog",
        secondaryHref: "/methodologie",
        secondaryLabel: "Hoe wij beoordelen",
    },
];

/** Welke categorieën nu op deze hub verschijnen; titels uit `items` uitbreiden wanneer de catalogus groeit. */
const hubVisibleTitles = new Set<string>(["Omega-3", "Magnesium"]);
const hubItems = items.filter((item) => hubVisibleTitles.has(item.title));

export default function SupplementenPage() {
    return (
        <Container>
            <div className="py-16 md:py-20">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                    Supplementen
                </p>

                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                    Kies een supplementcategorie
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
                    Deze pagina werkt als een rustig keuze-overzicht. Voorlopig tonen we
                    omega-3 en magnesium; de catalogus kan later worden uitgebreid. Kies
                    een categorie en ga daarna verder naar een vergelijking, gids of
                    verdiepende pagina.
                </p>

                <section className="mt-10">
                    <div className="flex flex-wrap gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === "Alles"
                                        ? "border-stone-900 bg-stone-900 text-white"
                                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {hubItems.map((item) => (
                        <article
                            key={item.title}
                            className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                                        {item.eyebrow}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
                                        {item.title}
                                    </h2>
                                </div>

                                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                                    {item.badge}
                                </span>
                            </div>

                            <p className="mt-5 text-base leading-7 text-stone-600">
                                {item.description}
                            </p>

                            <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-100 pt-5">
                                <Link
                                    href={item.href}
                                    className="text-sm font-medium text-stone-900 underline underline-offset-4"
                                >
                                    Bekijk categorie
                                </Link>

                                <Link
                                    href={item.secondaryHref}
                                    className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
                                >
                                    {item.secondaryLabel}
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="mt-16 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-8 md:p-10">
                        <p className="text-sm font-medium text-stone-500">
                            Rustige structuur
                        </p>

                        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                            Minder druk dan een webshop, maar wel dezelfde duidelijke
                            oriëntatie
                        </h2>

                        <div className="mt-5 max-w-2xl space-y-4 text-base leading-8 text-stone-600">
                            <p>
                                Deze pagina is bewust opgezet als catalogusachtig overzicht.
                                Daardoor voelt hij direct duidelijk, zonder de drukte van een
                                traditionele shop of zware affiliate-pagina.
                            </p>
                            <p>
                                Wie eerst meer inhoudelijke context zoekt, kan beter beginnen in
                                het blog. Wie al weet welke richting interessant is, kan
                                vanaf hier rustig doorklikken naar vergelijkingen en
                                keuzehulpen.
                            </p>
                        </div>
                    </div>

                    <aside className="rounded-3xl border border-stone-200 bg-white p-8">
                        <p className="text-sm font-medium text-stone-500">Verder lezen</p>

                        <div className="mt-5 space-y-4">
                            <Link
                                href="/blog"
                                className="block rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-stone-300 hover:bg-white"
                            >
                                Naar het blog
                            </Link>

                            <Link
                                href="/methodologie"
                                className="block rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm font-medium text-stone-900 transition hover:border-stone-300 hover:bg-white"
                            >
                                Lees onze methodologie
                            </Link>
                        </div>
                    </aside>
                </section>
            </div>
        </Container>
    );
}

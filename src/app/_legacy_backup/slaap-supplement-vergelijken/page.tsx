import Container from "@/components/layout/Container";
import Link from "next/link";

const products = [
    {
        name: "Melatonine formule",
        bestFor: "Eenvoudige avondroutine",
        focus: "Melatonine",
        notes:
            "Wordt vaak gekozen in producten met een smalle, duidelijke focus op de avondroutine.",
    },
    {
        name: "Magnesium + slaapblend",
        bestFor: "Breder samengesteld product",
        focus: "Magnesium + aanvullende ingrediënten",
        notes:
            "Kan interessant zijn voor wie liever één formule gebruikt in plaats van losse producten.",
    },
    {
        name: "Kruidenformule voor de avond",
        bestFor: "Mildere benadering",
        focus: "Kruiden en botanicals",
        notes:
            "Wordt vaak gekozen door mensen die liever beginnen met een rustigere, meer botanische formule.",
    },
];

const factors = [
    {
        title: "Heldere samenstelling",
        text: "Bij slaapproducten kijken we eerst of de formule logisch en overzichtelijk is. Een product met te veel losse claims of onduidelijke blends wordt minder overtuigend.",
    },
    {
        title: "Dosering en focus",
        text: "We letten op de rol van elk ingrediënt binnen de formule. Het gaat niet alleen om wat erin zit, maar ook of de dosering en de combinatie logisch ogen.",
    },
    {
        title: "Gebruiksgemak in de avond",
        text: "Slaapproducten moeten praktisch zijn in gebruik. Denk aan aantal capsules, eenvoud van het advies en hoe duidelijk het product gepositioneerd is.",
    },
    {
        title: "Transparantie van het merk",
        text: "Ook hier telt openheid zwaar mee: etiketduidelijkheid, claims, productinformatie en de algemene betrouwbaarheid van de presentatie.",
    },
];

const faq = [
    {
        question: "Waar let je op bij slaap supplementen vergelijken?",
        answer:
            "Vooral op samenstelling, dosering, eenvoud van de formule en transparantie. Producten in deze categorie worden snel vaag of te breed gepositioneerd, waardoor vergelijking extra belangrijk is.",
    },
    {
        question: "Is een formule met meer ingrediënten altijd beter?",
        answer:
            "Nee. Een langere ingrediëntenlijst klinkt soms indrukwekkend, maar een eenvoudiger en logischer product kan juist sterker zijn.",
    },
    {
        question: "Waarom is transparantie zo belangrijk bij slaapproducten?",
        answer:
            "Omdat deze categorie gevoelig is voor marketingtaal. Duidelijke etiketten, heldere doseringen en rustige communicatie maken een product beter te beoordelen.",
    },
];

export default function SlaapSupplementVergelijkenPage() {
    return (
        <Container>
            <div className="py-16 md:py-20">
                <div className="max-w-6xl">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Slaap supplement vergelijken
                    </p>

                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                        Slaap supplement vergelijken: rustiger kiezen tussen formules
                    </h1>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                        Slaapproducten zijn vaak druk gepositioneerd. Daarom vergelijken we
                        ze op helderheid van de formule, dosering, praktische inzet in de
                        avond en transparantie van het merk.
                    </p>

                    <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500">
                        Deze pagina is bedoeld als algemene vergelijking en sluit aan op
                        onze{" "}
                        <Link
                            href="/methodologie"
                            className="font-medium text-slate-900 underline underline-offset-4"
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
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h2 className="text-xl font-semibold text-slate-900">
                                {factor.title}
                            </h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                {factor.text}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-16 max-w-6xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        Overzicht van veelvoorkomende slaapproduct-types
                    </h2>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left">
                                <thead className="bg-slate-50">
                                    <tr className="text-sm text-slate-600">
                                        <th className="px-6 py-4 font-medium">Producttype</th>
                                        <th className="px-6 py-4 font-medium">Beste voor</th>
                                        <th className="px-6 py-4 font-medium">Hoofdfocus</th>
                                        <th className="px-6 py-4 font-medium">Opmerking</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {products.map((product) => (
                                        <tr key={product.name} className="align-top">
                                            <td className="px-6 py-5 font-medium text-slate-900">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-5 text-slate-600">
                                                {product.bestFor}
                                            </td>
                                            <td className="px-6 py-5 text-slate-600">
                                                {product.focus}
                                            </td>
                                            <td className="px-6 py-5 text-slate-600">
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
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                            Waar wij op letten bij slaapproducten
                        </h2>

                        <div className="mt-5 space-y-5 text-base leading-8 text-slate-600">
                            <p>
                                Deze categorie vraagt om extra rust in de presentatie. Veel
                                slaapproducten combineren meerdere ingrediënten en communiceren
                                breed, waardoor het lastig wordt om snel te zien wat de kern van
                                het product eigenlijk is.
                            </p>
                            <p>
                                Daarom kijken we eerst naar de opbouw van de formule. Is het een
                                product met één duidelijke focus, of is het een mix van
                                ingrediënten zonder heldere logica? Daarna kijken we naar
                                dosering, praktische inzet en de openheid van het merk.
                            </p>
                            <p>
                                Een professioneler product voelt meestal niet groter of
                                luider, maar juist rustiger, duidelijker en beter uitlegbaar.
                            </p>
                        </div>
                    </section>

                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm font-medium text-slate-500">Gerelateerd</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">
                            Meer context
                        </h3>

                        <div className="mt-5 space-y-4 text-base text-slate-600">
                            <Link
                                href="/methodologie"
                                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300"
                            >
                                Lees hoe wij beoordelen
                            </Link>
                            <Link
                                href="/supplementen"
                                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300"
                            >
                                Bekijk alle supplementen
                            </Link>
                        </div>
                    </aside>
                </div>

                <section className="mt-16 max-w-4xl">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        Veelgestelde vragen over slaap supplement vergelijken
                    </h2>

                    <div className="mt-6 space-y-4">
                        {faq.map((item) => (
                            <article
                                key={item.question}
                                className="rounded-2xl border border-slate-200 bg-white p-6"
                            >
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {item.question}
                                </h3>
                                <p className="mt-3 text-base leading-7 text-slate-600">
                                    {item.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </Container>
    );
}

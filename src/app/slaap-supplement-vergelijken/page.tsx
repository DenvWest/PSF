import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Slaapsupplement vergelijken — wat werkt écht? | PerfectSupplement",
  description:
    "Vergelijk slaapsupplementen op werking, dosering en transparantie. Onafhankelijk overzicht voor mannen 40+.",
  alternates: { canonical: "/slaap-supplement-vergelijken" },
};

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
                                <span className="text-stone-600">Slaap supplement vergelijken</span>
                            </li>
                        </ol>
                    </nav>

                    <section className="pt-10 pb-20 md:pt-14 md:pb-28">
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-4xl">
                            Slaap supplement vergelijken: rustiger kiezen tussen formules
                        </h1>

                        <p className="text-lg text-stone-500 leading-relaxed max-w-xl mt-4">
                            Slaapproducten zijn vaak druk gepositioneerd. Daarom vergelijken we
                            ze op helderheid van de formule, dosering, praktische inzet in de
                            avond en transparantie van het merk.
                        </p>

                        <p className="mt-4 max-w-2xl text-base text-stone-500 leading-relaxed">
                            Deze pagina is bedoeld als algemene vergelijking en sluit aan op
                            onze{" "}
                            <Link
                                href="/methodologie"
                                className="text-[#5A8F6A] underline hover:text-[#4A7F5A]"
                            >
                                methodologie
                            </Link>
                            .
                        </p>

                        <p className="text-sm text-stone-500 mt-4 max-w-2xl">
                            Dit artikel bevat affiliate links. Bij aankoop via deze links ontvangen wij een
                            kleine vergoeding. Dit heeft geen invloed op onze beoordeling —
                            onze{" "}
                            <Link href="/methodologie" className="underline hover:text-stone-700">methodologie</Link>{" "}
                            is onafhankelijk.
                        </p>
                    </section>
                </Container>
            </div>

            <Container>
                <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {factors.map((factor) => (
                        <article
                            key={factor.title}
                            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                        >
                            <h2 className="font-display text-xl font-semibold text-stone-900">
                                {factor.title}
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-stone-600">
                                {factor.text}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-16 md:mt-20">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                        Overzicht van veelvoorkomende slaapproduct-types
                    </h2>

                    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200 text-left">
                                <thead className="bg-stone-50">
                                    <tr className="text-sm text-stone-600">
                                        <th className="px-6 py-4 font-medium">Producttype</th>
                                        <th className="px-6 py-4 font-medium">Beste voor</th>
                                        <th className="px-6 py-4 font-medium">Hoofdfocus</th>
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
                                                {product.focus}
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

                <div className="mt-16 md:mt-20 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
                    <section>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                            Waar wij op letten bij slaapproducten
                        </h2>

                        <div className="space-y-5 text-base leading-relaxed text-stone-600">
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

                    <aside className="rounded-2xl border border-stone-200 bg-[#F7F5F0]/50 p-6">
                        <p className="text-sm font-medium text-stone-500">Gerelateerd</p>
                        <h3 className="font-display mt-2 text-xl font-semibold text-stone-900">
                            Meer context
                        </h3>
                        <p className="mt-2 text-sm text-stone-600">
                            Magnesium is het meest gebruikte slaapsupplement. Bekijk de vergelijking of ga direct naar onze top 3.
                        </p>

                        <div className="mt-5 space-y-4 text-base text-stone-600">
                            <Link
                                href="/magnesium-vergelijken"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-[#5A8F6A]/30"
                            >
                                <span className="font-medium text-stone-900">Magnesium vergelijken →</span>
                                <span className="mt-0.5 block text-sm text-stone-500">Bisglycinaat vs citraat vs malaat — wat past bij jouw avondroutine?</span>
                            </Link>
                            <Link
                                href="/beste-magnesium"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-[#5A8F6A]/30"
                            >
                                <span className="font-medium text-stone-900">Beste magnesium supplement →</span>
                                <span className="mt-0.5 block text-sm text-stone-500">Top 3 vergeleken op vorm, dosering en prijs per dag</span>
                            </Link>
                            <Link
                                href="/methodologie"
                                className="block rounded-xl border border-stone-200 bg-white px-4 py-3 transition hover:border-[#5A8F6A]/30 text-[#5A8F6A] font-medium"
                            >
                                Lees hoe wij beoordelen
                            </Link>
                        </div>
                    </aside>
                </div>

                <section className="mt-16 md:mt-20">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                        Veelgestelde vragen over slaap supplement vergelijken
                    </h2>

                    <div className="space-y-4">
                        {faq.map((item) => (
                            <article
                                key={item.question}
                                className="rounded-2xl border border-stone-200 bg-white p-6"
                            >
                                <h3 className="font-display text-lg font-semibold text-stone-900">
                                    {item.question}
                                </h3>
                                <p className="mt-3 text-base leading-relaxed text-stone-600">
                                    {item.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-16 md:mt-20 border-t border-stone-100 pt-12">
                    <h2 className="font-display text-2xl font-bold text-stone-900 mb-8">Lees ook</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/profiel/onrustige-slaper" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                            <p className="text-base text-stone-600 leading-relaxed">Slecht slapen na 40? Ontdek of jij een Onrustige Slaper bent en welke stappen echt helpen.</p>
                            <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk het profiel →</span>
                        </Link>
                        <Link href="/beste-magnesium" className="group block rounded-xl border border-stone-200 p-6 hover:border-[#5A8F6A]/30 transition-colors">
                            <p className="text-base text-stone-600 leading-relaxed">Magnesium is stap één bij slaapproblemen. Bekijk welke vorm het beste bij jou past.</p>
                            <span className="mt-3 inline-block text-sm font-semibold text-[#5A8F6A] group-hover:underline">Bekijk beste magnesium →</span>
                        </Link>
                    </div>
                </section>

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
        </main>
    );
}

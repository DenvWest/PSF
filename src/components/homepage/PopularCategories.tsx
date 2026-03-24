import Link from "next/link";
import Container from "@/components/layout/Container";

export default function PopularCategories() {
    /** Actieve focus (Omega-3, Vitamine D); uitbreiden door items toe te voegen wanneer de prioriteit meegroeit. */
    const categories = [
        { name: "Omega-3", href: "/omega-3-vergelijken" },
        { name: "Vitamine D", href: "/supplementen" },
    ];

    return (
        <section className="pb-16 md:pb-20">
            <Container>
                <div className="max-w-2xl">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                        Populaire onderwerpen
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                        Begin bij een onderwerp
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
                        Kies omega-3 of vitamine D en ga direct naar de vergelijking of het
                        supplementenoverzicht.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={category.href}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}

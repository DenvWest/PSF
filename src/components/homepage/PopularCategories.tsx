import Link from "next/link";

export default function PopularCategories() {
    const categories = [
        { name: "Omega 3", href: "/omega-3-vergelijken" },
        { name: "Magnesium", href: "/magnesium-vergelijken" },
        { name: "Slaap", href: "/slaap-supplement-vergelijken" },
    ];

    return (
        <section className="pb-12 md:pb-16">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="max-w-2xl">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-green-700">
                        Populaire onderwerpen
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                        Begin bij een onderwerp
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
                        Kies een populair thema en ga direct naar de eerste vergelijking of beste keuzes.
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
            </div>
        </section>
    );
}

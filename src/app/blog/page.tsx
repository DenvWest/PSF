import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Analyse en uitleg over omega 3, magnesium en de keuzes die ertoe doen.",
};

const articles = [
  {
    title: "Supplement kiezen: waar op letten?",
    href: "/supplement-kiezen-waar-op-letten",
    category: "Keuzehulp",
    description:
      "Kwaliteit herkennen: dosering, opneembaarheid, zuiverheid en transparantie — zonder marketingpraat.",
    date: "Maart 2026",
  },
  {
    title: "Wat is omega-3?",
    href: "/wat-is-omega-3",
    category: "Ingrediënten",
    description:
      "Een introductie op de rol van omega-3 vetzuren in het lichaam en waarom de bron ertoe doet.",
    date: "Maart 2025",
  },
  {
    title: "Waar let je op bij omega-3?",
    href: "/waar-let-je-op-bij-omega-3",
    category: "Ingrediënten",
    description:
      "Kwaliteit, dosering en zuiverheid — wat er werkelijk toe doet bij de keuze van een omega-3 supplement.",
    date: "Maart 2025",
  },
  {
    title: "Omega-3 vergelijken",
    href: "/omega-3-vergelijken",
    category: "Vergelijking",
    description:
      "Populaire omega-3 supplementen naast elkaar op EPA/DHA-gehalte, prijs per dag en kwaliteitsindicatoren.",
    date: "Februari 2025",
  },
  {
    title: "Beste omega-3 supplement",
    href: "/beste-omega-3-supplement",
    category: "Keuzehulp",
    description:
      "De beste keuzes voor verschillende situaties: dagelijks gebruik, budget en premium kwaliteit.",
    date: "Februari 2025",
  },
  {
    title: "Magnesium vergelijken",
    href: "/magnesium-vergelijken",
    category: "Vergelijking",
    description:
      "Vormen, doseringen en toepassingen — van magnesiumcitraat tot bisglycinaat.",
    date: "Januari 2025",
  },
  {
    title: "Beste magnesium supplement",
    href: "/beste-magnesium",
    category: "Keuzehulp",
    description:
      "Welke magnesiumvorm werkt het best voor jouw doel? Een overzicht van de meest relevante varianten.",
    date: "Januari 2025",
  },
];

export default function BlogPage() {
  return (
    <Container>
      <div className="py-16 md:py-24">

        {/* Page header */}
        <div className="max-w-[520px]">
          <p className="text-[0.63rem] font-medium uppercase tracking-[0.26em] text-stone-400">
            Blog
          </p>
          <h1 className="ps-display mt-5 text-[3rem] leading-[1.06] text-stone-900 sm:text-[3.75rem]">
            Analyse en uitleg over omega&nbsp;3 en magnesium.
          </h1>
          <p className="mt-6 text-base leading-[1.85] text-stone-400">
            Gerichte artikelen over ingrediënten, vergelijkingen en de keuzes
            die ertoe doen. Inhoudelijk, zonder hype.
          </p>
        </div>

        {/* Articles grid */}
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group flex flex-col"
            >
              {/* Image area */}
              <div className="aspect-[3/2] w-full overflow-hidden rounded-md bg-stone-100 transition duration-300 group-hover:bg-stone-200/70" />

              <div className="mt-5 flex flex-1 flex-col">
                <div className="flex items-center gap-3">
                  <p className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-stone-400">
                    {article.category}
                  </p>
                  <span className="text-stone-200" aria-hidden>·</span>
                  <p className="text-[0.625rem] text-stone-400">{article.date}</p>
                </div>

                <h2 className="ps-display mt-3 text-[1.3125rem] leading-[1.2] text-stone-900 transition group-hover:text-stone-600">
                  {article.title}
                </h2>

                <p className="mt-3 flex-1 text-[0.875rem] leading-[1.8] text-stone-400">
                  {article.description}
                </p>

                <p className="mt-5 text-[0.8125rem] font-medium text-stone-400 underline decoration-stone-200 underline-offset-4 transition group-hover:text-stone-700 group-hover:decoration-stone-400">
                  Lees meer
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </Container>
  );
}

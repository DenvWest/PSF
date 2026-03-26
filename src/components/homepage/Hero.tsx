import Link from "next/link";
import Container from "@/components/layout/Container";

const startLinks = [
  {
    title: "Omega 3 vergelijken",
    description: "EPA/DHA-gehalte, prijs en kwaliteit naast elkaar.",
    href: "/omega-3-vergelijken",
  },
  {
    title: "Beste omega 3 keuzes",
    description: "Aanbevelingen per situatie en budget.",
    href: "/beste-omega-3-supplement",
  },
  {
    title: "Magnesium uitleg",
    description: "Vormen, doseringen en wanneer het relevant is.",
    href: "/magnesium-vergelijken",
  },
];

export default function Hero() {
  return (
    <section className="border-b border-stone-200/60">
      <Container>
        <div className="grid gap-10 py-20 md:py-24 lg:grid-cols-[1fr_348px] lg:items-start lg:gap-16">

          {/* Left: headline, subtext, CTAs */}
          <div className="pt-2">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.26em] text-stone-400">
              PerfectSupplement · Omega 3 &amp; Magnesium
            </p>
            <h1 className="ps-display mt-6 text-[2.625rem] leading-[1.06] text-stone-900 sm:text-[3.25rem] lg:text-[3.75rem]">
              Kies de juiste omega&nbsp;3 en magnesium supplementen, helder uitgelegd.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-[1.8] text-stone-500">
              Vergelijk dosering, kwaliteit en prijs per supplement.
              Duidelijk uitgelegd, zonder overbodige ruis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/supplementen"
                className="inline-flex items-center rounded border border-stone-800 bg-stone-900 px-5 py-2.5 text-[0.8125rem] font-medium tracking-[0.01em] text-white transition duration-150 hover:bg-stone-800"
              >
                Bekijk supplementen
              </Link>
              <Link
                href="/methodologie"
                className="inline-flex items-center rounded border border-stone-300 px-5 py-2.5 text-[0.8125rem] font-medium tracking-[0.01em] text-stone-600 transition duration-150 hover:border-stone-500 hover:text-stone-900"
              >
                Bekijk methodologie
              </Link>
            </div>
          </div>

          {/* Right: startblok */}
          <div className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            <div className="px-5 py-3.5">
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.22em] text-stone-400">
                Direct naar
              </p>
            </div>
            {startLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800 transition group-hover:text-stone-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-stone-400">
                    {item.description}
                  </p>
                </div>
                <span
                  className="mt-0.5 shrink-0 text-stone-300 transition group-hover:text-stone-600"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}

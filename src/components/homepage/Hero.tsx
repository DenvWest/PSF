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
    title: "Magnesium vergelijken",
    description: "Vormen, doseringen en wanneer het relevant is.",
    href: "/magnesium-vergelijken",
  },
  {
    title: "Beste magnesium keuzes",
    description: "Topkeuzes per vorm en gebruik, met duidelijke onderbouwing.",
    href: "/beste-magnesium",
  },
];

export default function Hero() {
  return (
    <section className="relative border-b border-stone-200/60">
      {/* Soft top wash — ties hero to page without feeling empty */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-8%,rgba(255,255,255,0.85),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200/70 to-transparent"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid gap-10 py-24 sm:gap-12 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-16 xl:gap-[5.5rem]">

          {/* Left: headline, subtext, CTAs — lg:pt-3 matches card header inset so eyebrows align */}
          <div className="flex min-w-0 flex-col lg:max-w-[min(100%,40rem)] xl:max-w-[min(100%,42rem)] lg:pt-3">
            <p className="ps-eyebrow">
              PerfectSupplement · Omega 3 &amp; Magnesium
            </p>
            <h1 className="ps-display mt-5 text-[2.625rem] leading-[1.05] text-stone-900 sm:text-[3.375rem] lg:text-[3.75rem]">
              Kies de juiste omega&nbsp;3 en magnesium supplementen, helder uitgelegd.
            </h1>
            <p className="mt-5 max-w-[44ch] text-[0.9375rem] leading-[1.8] text-stone-500">
              Vergelijk dosering, kwaliteit en prijs per supplement.
              Duidelijk uitgelegd, zonder overbodige ruis.
            </p>

            {/* Primary leads; secondary stays visually quieter */}
            <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
              <Link
                href="/supplementen"
                className="ps-btn-primary-hero w-full text-center sm:w-auto sm:min-w-[12rem]"
              >
                Bekijk supplementen
              </Link>
              <Link
                href="/methodologie"
                className="ps-btn-secondary-hero w-full text-center sm:w-auto"
              >
                Bekijk methodologie
              </Link>
            </div>
          </div>

          {/* Right: quick-nav — header py matches left lg:pt-3 so label rows line up */}
          <div className="w-full border-t border-stone-200/70 pt-10 lg:min-w-0 lg:border-t-0 lg:pt-3">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-[0_8px_40px_-12px_rgba(28,25,23,0.12),0_2px_8px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/[0.04] backdrop-blur-[2px]">
              <div className="border-b border-stone-100/90 bg-gradient-to-b from-stone-50 to-stone-50/30 px-6 py-3">
                <p className="ps-eyebrow">Direct naar</p>
              </div>
              <ul className="divide-y divide-stone-100/90">
                {startLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-start justify-between gap-4 px-6 py-[0.9375rem] transition-colors duration-150 hover:bg-stone-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400/40"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.875rem] font-medium text-stone-800 transition-colors duration-150 group-hover:text-stone-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[0.8125rem] leading-[1.55] text-stone-400">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className="mt-0.5 shrink-0 text-stone-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-stone-500"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

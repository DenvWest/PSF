import Link from "next/link";
import Container from "@/components/layout/Container";

const startLinks = [
  {
    title: "Vergelijk omega 3 supplementen",
    description:
      "EPA/DHA, opname en dosering naast elkaar — zo vind je de beste omega 3 voor jouw doel.",
    href: "/omega-3-vergelijken",
    highlight: false,
  },
  {
    title: "Beste omega 3: top 5",
    description:
      "Top 5 supplementen vergeleken op dosering, kwaliteit en prijs per dag.",
    href: "/beste-omega-3-supplement",
    highlight: false,
  },
  {
    title: "Vergelijk magnesium (vormen & opname)",
    description:
      "Per vorm: opname, dosering en effect — kies welke magnesium het beste past.",
    href: "/magnesium-vergelijken",
    highlight: false,
  },
  {
    title: "Beste magnesium: top 5",
    subtitle:
      "Vergelijk vormen en dosering; top 5 op basis van samenstelling en prijs.",
    description:
      "Top 5 per vorm, met opname en dosering helder uitgelegd.",
    href: "/beste-magnesium",
    highlight: true,
  },
] as const;

const trustBullets = [
  "Gebaseerd op wetenschappelijke studies",
  "Onafhankelijke vergelijking",
] as const;

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
              PerfectSupplement · Omega 3 &amp; Magnesium · 2026
            </p>
            <h1 className="ps-display mt-5 text-[1.875rem] leading-[1.1] text-stone-900 sm:text-[2.25rem] md:text-[2.625rem] lg:text-[2.875rem]">
              Beste Omega 3 &amp; Magnesium supplementen (2026) – Vergelijking
              &amp; Advies
            </h1>
            <p className="mt-5 max-w-[52ch] text-[0.9375rem] leading-[1.8] text-stone-500">
              We leggen uit hoe <strong className="font-medium text-stone-700">opname</strong> en{" "}
              <strong className="font-medium text-stone-700">dosering</strong> samenhangen met{" "}
              <strong className="font-medium text-stone-700">effect</strong>, en welke
              supplementen daarbij passen. Geen merkpraat: een{" "}
              <strong className="font-medium text-stone-700">onafhankelijke vergelijking</strong> op
              inhoud en prijs.
            </p>

            <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
              <Link
                href="/supplementen"
                className="ps-btn-primary-hero w-full text-center sm:w-auto sm:min-w-[12rem]"
              >
                Bekijk beste supplementen →
              </Link>
              <Link
                href="/methodologie"
                className="ps-btn-secondary-hero w-full text-center sm:w-auto"
              >
                Hoe wij vergelijken →
              </Link>
            </div>
          </div>

          {/* Right: quick-nav — header py matches left lg:pt-3 so label rows line up */}
          <div className="w-full border-t border-stone-200/70 pt-10 lg:min-w-0 lg:border-t-0 lg:pt-3">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-[0_8px_40px_-12px_rgba(28,25,23,0.12),0_2px_8px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/[0.04] backdrop-blur-[2px]">
              <div className="border-b border-stone-100/90 bg-gradient-to-b from-stone-50 to-stone-50/30 px-6 py-3">
                <p className="ps-eyebrow">Vergelijk &amp; top 5</p>
                <p className="mt-1 text-[0.75rem] leading-snug text-stone-500">
                  Snel naar de beste keuzes: dosering, opname en prijs per dag.
                </p>
              </div>
              <ul className="divide-y divide-stone-100/90">
                {startLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-start justify-between gap-4 px-6 py-[0.9375rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-400/40 ${
                        item.highlight
                          ? "relative bg-gradient-to-br from-amber-50/90 via-white to-stone-50/40 ring-2 ring-amber-200/80 ring-inset hover:from-amber-50 hover:to-stone-50/60"
                          : "hover:bg-stone-50/90"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[0.875rem] font-medium text-stone-800 transition-colors duration-150 group-hover:text-stone-900">
                          {item.title}
                        </p>
                        {"subtitle" in item && item.subtitle ? (
                          <p className="mt-1 text-[0.8125rem] font-medium leading-snug text-stone-600">
                            {item.subtitle}
                          </p>
                        ) : null}
                        <p
                          className={`text-[0.8125rem] leading-[1.55] text-stone-400 ${
                            "subtitle" in item && item.subtitle ? "mt-1" : "mt-0.5"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={`mt-0.5 shrink-0 transition-all duration-150 group-hover:translate-x-0.5 ${
                          item.highlight
                            ? "text-amber-600 group-hover:text-amber-700"
                            : "text-stone-300 group-hover:text-stone-500"
                        }`}
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

        <div className="border-t border-stone-200/70 pb-8 pt-6 sm:pb-10 sm:pt-8">
          <ul
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-2"
            aria-label="Waarom je ons kunt vertrouwen"
          >
            {trustBullets.map((text) => (
              <li
                key={text}
                className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-stone-600"
              >
                <span
                  className="mt-0.5 text-emerald-600"
                  aria-hidden
                >
                  ✓
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

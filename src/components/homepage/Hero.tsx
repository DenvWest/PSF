import Link from "next/link";
import Container from "@/components/layout/Container";

const quickLinks = [
  {
    title: "Kennisbank",
    description: "Begrippen en context voor zelfverzekerde keuzes.",
    href: "/kennisbank",
  },
  {
    title: "Methodologie",
    description: "Hoe we informatie beoordelen en vergelijken.",
    href: "/methodologie",
  },
  {
    title: "Veelgestelde vragen",
    description: "Praktische antwoorden om snel verder te gaan.",
    href: "/faqs",
  },
  {
    title: "Blog",
    description: "Leefstijl, routines en evidence-based tips.",
    href: "/blog",
  },
];

export default function Hero() {
  return (
    <section className="relative border-b border-stone-200/60">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-8%,rgba(255,255,255,0.85),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200/70 to-transparent"
        aria-hidden
      />

      <Container className="relative">
        <div className="home-hero-grid grid gap-10 pb-[3em] sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-16 xl:gap-[5.5rem]">
          <div className="home-hero-column flex min-w-0 flex-col lg:max-w-[min(100%,40rem)] xl:max-w-[min(100%,42rem)] lg:pt-1">
            <h1 className="home-hero-title ps-display text-stone-900">
              Voor mannen 40+ die merken dat hun energie verandert
            </h1>
            <p className="home-lead home-hero-sub mt-5 text-stone-600">
              <span className="block">
                Wat voelt als ‘gewoon ouder worden’ is vaak een hormonale verschuiving.
              </span>
              <span className="mt-2 block">
                Krijg weer grip met de juiste leefstijl en gerichte supplementen.
              </span>
            </p>

            <div className="mt-9 sm:mt-10">
              <Link href="#step-care" className="ps-btn-primary-hero inline-flex w-full max-w-md justify-center text-center sm:w-auto sm:min-w-[14rem]">
                Start jouw pad
              </Link>
            </div>
          </div>

          <div className="w-full border-t border-stone-200/70 pt-10 lg:min-w-0 lg:border-t-0 lg:pt-1">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-[0_8px_40px_-12px_rgba(28,25,23,0.12),0_2px_8px_rgba(28,25,23,0.04)] ring-1 ring-stone-900/[0.04] backdrop-blur-[2px]">
              <div className="border-b border-stone-100/90 bg-gradient-to-b from-stone-50 to-stone-50/30 px-6 py-3">
                <p className="ps-eyebrow">Direct verder</p>
              </div>
              <ul className="divide-y divide-stone-100/90">
                {quickLinks.map((item) => (
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

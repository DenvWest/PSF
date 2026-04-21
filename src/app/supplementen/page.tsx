import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import ThemeFilter from "@/components/supplements/ThemeFilter";

export const metadata: Metadata = {
  title: "Supplementengids — Onafhankelijk advies voor mannen 40+ | PerfectSupplement",
  description:
    "Eerlijke, wetenschappelijk onderbouwde informatie over supplementen. Geen rankings of sterren — wel heldere vergelijkingen op biobeschikbaarheid, dosering en prijs-kwaliteit.",
  openGraph: {
    title: "Supplementengids — PerfectSupplement",
    description:
      "Onafhankelijke supplementgidsen en vergelijkingen voor mannen 40+.",
  },
};

/* ── Data ──────────────────────────────────────────────────────── */

const SUPPLEMENTS = [
  {
    slug: "magnesium",
    name: "Magnesium",
    description:
      "Het meest veelzijdige mineraal voor mannen 40+. Ondersteunt slaap, stressregulatie en spierherstel — in meerdere vormen beschikbaar.",
    tags: ["Slaap", "Stress", "Spieren"],
    icon: "⚡",
    gradient: "from-emerald-50 to-teal-50",
    iconBg: "bg-emerald-100",
    featured: true,
    comingSoon: false,
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    description:
      "Een adaptogeen met sterke onderbouwing. Verlaagt cortisol, ondersteunt mentale veerkracht en helpt bij herstel na chronische stress.",
    tags: ["Stress", "Herstel", "Veerkracht"],
    icon: "🌿",
    gradient: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    featured: true,
    comingSoon: false,
  },
  {
    slug: "omega-3",
    name: "Omega-3",
    description:
      "Essentiële vetzuren die je lichaam niet zelf aanmaakt. Cruciaal voor hersenfunctie, gewrichten en ontstekingsregulatie.",
    tags: ["Hersenen", "Gewrichten", "Hart"],
    icon: "🐟",
    gradient: "from-sky-50 to-blue-50",
    iconBg: "bg-sky-100",
    featured: true,
    comingSoon: false,
  },
  {
    slug: "vitamine-d",
    name: "Vitamine D",
    description:
      "Het 'zonnevitamine' waar bijna elke Nederlander een tekort aan heeft. Essentieel voor immuniteit, botten en stemming.",
    tags: ["Immuniteit", "Botten", "Energie"],
    icon: "☀️",
    gradient: "from-yellow-50 to-amber-50",
    iconBg: "bg-yellow-100",
    featured: false,
    comingSoon: true,
  },
  {
    slug: "creatine",
    name: "Creatine",
    description:
      "Niet alleen voor sporters. Ondersteunt ook cognitieve functie en energieproductie op celniveau.",
    tags: ["Spieren", "Energie", "Cognitie"],
    icon: "💪",
    gradient: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100",
    featured: false,
    comingSoon: true,
  },
  {
    slug: "zink",
    name: "Zink",
    description:
      "Belangrijk voor testosteron, immuunsysteem en wondgenezing. Tekorten komen vaak voor bij mannen 40+.",
    tags: ["Testosteron", "Immuniteit", "Herstel"],
    icon: "🛡️",
    gradient: "from-slate-50 to-gray-50",
    iconBg: "bg-slate-100",
    featured: false,
    comingSoon: true,
  },
] as const;

const COMPARISONS = [
  { name: "Omega-3", href: "/beste-omega-3-supplement" },
  { name: "Magnesium", href: "/beste-magnesium" },
  { name: "Ashwagandha", href: "/beste-ashwagandha" },
] as const;

const featuredSupplements = SUPPLEMENTS.filter((s) => s.featured);
const allSupplements = SUPPLEMENTS;

/* ── Page ──────────────────────────────────────────────────────── */

export default function SupplementenPage() {
  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #FDFCFA 0%, #F7F5F0 100%)" }}
        aria-label="Introductie"
      >
        {/* Decorative radial glow — top right */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full opacity-30"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
          }}
        />

        <Container className="relative py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-stone-500 uppercase mb-5">
                Supplementengids
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-stone-900">
                Weloverwogen kiezen,
                <br />
                <span className="text-[#C4873B]">zonder ruis.</span>
              </h1>
              <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl font-sans">
                Supplementen kunnen helpen — maar alleen als je weet wat je
                neemt en waarom. Geen rankings of sterren. Wel eerlijke
                informatie over werking, vormen en dosering.
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 bg-[#5A8F6A] hover:bg-[#4a7a5a] text-white rounded-full px-8 py-3.5 font-medium text-sm transition-all shadow-sm hover:shadow-md"
                >
                  Doe de Leefstijlcheck
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Right: decorative blob — hidden on mobile */}
            <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
              <div className="relative w-80 h-80">
                {/* Soft outer ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-50 to-emerald-50 opacity-60" />
                {/* Inner blob */}
                <div
                  className="absolute inset-8 rounded-full opacity-40"
                  style={{
                    background:
                      "radial-gradient(ellipse at 40% 40%, #d4e8db 0%, #f5e4c8 60%, transparent 100%)",
                  }}
                />
                {/* Center icon cluster */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    {(["⚡", "🌿", "🐟", "☀️"] as const).map((icon, i) => (
                      <span
                        key={i}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm ring-1 ring-stone-200/60"
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── ThemeFilter — floating card ───────────────────────── */}
      <div className="relative z-10 -mt-10">
        <Container>
          <ThemeFilter />
        </Container>
      </div>

      {/* ── Featured supplements ─────────────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#FDFCFA" }}
        aria-label="Meest gelezen gidsen"
      >
        <Container>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
            <p className="text-xs font-medium tracking-widest text-stone-400 uppercase">
              Meest gelezen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSupplements.map((item) => (
              <Link
                key={item.slug}
                href={`/supplementen/${item.slug}`}
                data-tags={item.tags.join(",")}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Gradient header */}
                <div
                  className={`bg-gradient-to-br ${item.gradient} h-32 flex items-center justify-center`}
                >
                  <span className="text-5xl" aria-hidden="true">
                    {item.icon}
                  </span>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h2 className="font-serif text-xl text-stone-900">
                    {item.name}
                  </h2>
                  <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#5A8F6A] group-hover:gap-2 transition-all">
                    Lees de gids
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── All supplements ──────────────────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#F7F5F0" }}
        aria-label="Alle supplementengidsen"
      >
        <Container>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
            <p className="text-xs font-medium tracking-widest text-stone-400 uppercase">
              Alle gidsen
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSupplements.map((item) => {
              const cardContent = (
                <div
                  data-tags={item.tags.join(",")}
                  className="bg-white rounded-xl p-5 border border-stone-200 hover:border-[#5A8F6A]/30 transition-all group flex items-start gap-4 h-full"
                >
                  {/* Icon */}
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${item.iconBg}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-900 text-base">
                        {item.name}
                      </span>
                      {item.comingSoon && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200">
                          Binnenkort
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {!item.comingSoon && (
                      <span className="text-xs font-medium text-[#5A8F6A] mt-2 opacity-0 group-hover:opacity-100 transition-opacity block">
                        Lees meer →
                      </span>
                    )}
                  </div>
                </div>
              );

              return item.comingSoon ? (
                <div key={item.slug} className="cursor-default">
                  {cardContent}
                </div>
              ) : (
                <Link
                  key={item.slug}
                  href={`/supplementen/${item.slug}`}
                  className="block"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Comparisons CTA ──────────────────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#FDFCFA" }}
        aria-label="Productvergelijkingen"
      >
        <Container>
          <div className="bg-white rounded-2xl border border-stone-200 p-8 lg:p-10 text-center">
            <h2 className="font-serif text-2xl text-stone-900">
              Welk product past bij jou?
            </h2>
            <p className="text-stone-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
              Bekijk onze onafhankelijke productvergelijkingen met scores op
              biobeschikbaarheid, dosering en prijs-kwaliteit.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {COMPARISONS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-2.5 rounded-full border border-stone-200 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                >
                  {item.name} vergelijken →
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Leefstijlcheck CTA ───────────────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#F7F5F0" }}
        aria-label="Leefstijlcheck"
      >
        <Container>
          <div className="bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] text-white rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="font-serif text-2xl lg:text-3xl text-white">
              Niet zeker waar je moet beginnen?
            </h2>
            <p className="text-white/80 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Doe onze gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk
              resultaat.
            </p>
            <div className="mt-6">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 bg-white text-[#5A8F6A] rounded-full px-8 py-3.5 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
              >
                Start de Leefstijlcheck
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="text-white/50 text-xs mt-4">
              Geen account nodig · Je gegevens worden anoniem verwerkt
            </p>
          </div>
        </Container>
      </section>

      {/* ── JSON-LD ──────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://perfectsupplement.nl",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Supplementen",
                item: "https://perfectsupplement.nl/supplementen",
              },
            ],
          }),
        }}
      />
    </div>
  );
}

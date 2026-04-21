import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

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
    comingSoon: false,
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
    comingSoon: false,
    cardHref: "/beste-creatine",
    ctaLabel: "Bekijk vergelijking →",
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
    comingSoon: false,
    cardHref: "/beste-zink",
    ctaLabel: "Bekijk vergelijking →",
  },
] as const;

const VERGELIJKINGEN = [
  {
    href: "/beste-magnesium",
    name: "Magnesium",
    tagline: "Vormen, elementair gehalte en prijs per dag op een rij.",
  },
  {
    href: "/beste-omega-3-supplement",
    name: "Omega-3",
    tagline: "EPA/DHA, zuiverheid en dagkosten — eerlijk vergeleken.",
  },
  {
    href: "/beste-ashwagandha",
    name: "Ashwagandha",
    tagline: "Extracten, withanoliden en dosering voor stress & herstel.",
  },
  {
    href: "/beste-vitamine-d",
    name: "Vitamine D",
    tagline: "D3, K2-combo’s en wat het etiket écht zegt.",
  },
  {
    href: "/beste-creatine",
    name: "Creatine",
    tagline: "Monohydraat, micronized en prijs per dosering.",
  },
  {
    href: "/beste-zink",
    name: "Zink",
    tagline: "Bisglycinaat, picolinaat en opname — praktisch gekozen.",
  },
] as const;

const THEMES = [
  {
    id: "slaap",
    icon: "🌙",
    label: "Slaap",
    description: "Slaapkwaliteit, ritme, herstel",
    href: "/thema/slaap",
    iconBg: "bg-indigo-100",
    comingSoon: false,
  },
  {
    id: "stress",
    icon: "🧠",
    label: "Stress",
    description: "Cortisol, ontspanning, veerkracht",
    href: "/thema/stress",
    iconBg: "bg-amber-100",
    comingSoon: false,
  },
  {
    id: "energie",
    icon: "⚡",
    label: "Energie",
    description: "Energieniveau, voeding, focus",
    href: "#energie",
    iconBg: "bg-emerald-100",
    comingSoon: true,
  },
  {
    id: "herstel",
    icon: "🔄",
    label: "Herstel",
    description: "Spierherstel, mentale rust",
    href: "#herstel",
    iconBg: "bg-rose-100",
    comingSoon: true,
  },
] as const;

/* ── Page ──────────────────────────────────────────────────────── */

export default function SupplementenPage() {
  return (
    <div className="relative">
      {/* ── Sectie 1: Hero ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #FDFCFA 0%, #F7F5F0 100%)" }}
        aria-label="Introductie"
      >
        <Container className="relative py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            {/* Linkerkolom */}
            <div className="lg:w-3/5">
              <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
                SUPPLEMENTENGIDS
              </p>
              <h1 className="mt-4 font-serif text-4xl md:text-5xl text-stone-900">
                Weloverwogen kiezen,
                <br />
                <span className="text-[#C4873B]">zonder ruis.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-stone-600">
                Supplementen kunnen helpen — maar alleen als je weet wat je neemt
                en waarom. Geen rankings of sterren. Wel eerlijke informatie over
                werking, vormen en dosering.
              </p>

              {/* Ik weet wat ik zoek */}
              <div className="mt-8">
                <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
                  IK WEET WAT IK ZOEK
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/beste-magnesium"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    ⚡ Magnesium vergelijken
                  </Link>
                  <Link
                    href="/beste-ashwagandha"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    🌿 Ashwagandha vergelijken
                  </Link>
                  <Link
                    href="/beste-omega-3-supplement"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    🐟 Omega-3 vergelijken
                  </Link>
                  <Link
                    href="/beste-vitamine-d"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    ☀️ Vitamine D vergelijken
                  </Link>
                  <Link
                    href="/beste-creatine"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    💪 Creatine vergelijken
                  </Link>
                  <Link
                    href="/beste-zink"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-[#5A8F6A] hover:text-[#5A8F6A] hover:bg-[#5A8F6A]/5 transition-all"
                  >
                    🛡️ Zink vergelijken
                  </Link>
                </div>
              </div>

              {/* Ik weet niet waar ik moet beginnen */}
              <div className="mt-6">
                <Link
                  href="/intake"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5A8F6A] px-7 py-3 text-sm font-semibold text-white hover:bg-[#4a7a5a] transition-all shadow-sm hover:shadow-md"
                >
                  Doe de Leefstijlcheck →
                </Link>
                <p className="mt-2 text-xs text-stone-400">
                  Weet je niet waar je moet beginnen? 12 vragen, 3 minuten, persoonlijk resultaat.
                </p>
              </div>
            </div>

            {/* Rechterkolom — 2x2 thema-iconen */}
            <div className="hidden lg:flex lg:w-2/5 items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full bg-amber-50/40" />
                <div className="relative grid grid-cols-2 gap-4">
                  <Link
                    href="/thema/slaap"
                    className="group flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <span className="text-2xl">🌙</span>
                    <span className="text-[10px] font-medium text-stone-500 mt-1 group-hover:text-indigo-700 transition-colors">
                      Slaap
                    </span>
                  </Link>
                  <Link
                    href="/thema/stress"
                    className="group flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <span className="text-2xl">🧠</span>
                    <span className="text-[10px] font-medium text-stone-500 mt-1 group-hover:text-amber-700 transition-colors">
                      Stress
                    </span>
                  </Link>
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 opacity-50">
                    <span className="text-2xl">⚡</span>
                    <span className="text-[10px] font-medium text-stone-500 mt-1">Energie</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 opacity-50">
                    <span className="text-2xl">🔄</span>
                    <span className="text-[10px] font-medium text-stone-500 mt-1">Herstel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Sectie 2: Thema's ────────────────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#FDFCFA" }}
        aria-label="Thema's"
      >
        <Container>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
            <p className="text-xs font-medium tracking-widest text-stone-400 uppercase">
              Kies een thema
            </p>
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2">
            Start vanuit wat je ervaart
          </h2>
          <p className="text-sm text-stone-500 mb-8 max-w-lg">
            Elk thema combineert leefstijltips, supplementadvies en een gratis gids.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {THEMES.map((theme) => {
              const cardInner = (
                <div
                  className={`rounded-2xl border border-stone-200 bg-white p-5 flex flex-col items-start gap-3 transition-all h-full ${
                    theme.comingSoon
                      ? "opacity-60"
                      : "hover:border-[#5A8F6A] hover:shadow-sm"
                  }`}
                >
                  <div className="relative">
                    <span
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${theme.iconBg}`}
                      aria-hidden="true"
                    >
                      {theme.icon}
                    </span>
                    {theme.comingSoon && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200 leading-none">
                        Binnenkort
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-stone-800">
                      {theme.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>
              );

              return theme.comingSoon ? (
                <div key={theme.id} className="cursor-default">
                  {cardInner}
                </div>
              ) : (
                <Link key={theme.id} href={theme.href} className="block">
                  {cardInner}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Sectie 3: Supplementgidsen ───────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#F7F5F0" }}
        aria-label="Supplementgidsen"
      >
        <Container>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
            <p className="text-xs font-medium tracking-widest text-stone-400 uppercase">
              Onze gidsen
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPLEMENTS.map((item) => {
              const cardHref =
                "cardHref" in item && item.cardHref
                  ? item.cardHref
                  : `/supplementen/${item.slug}`;
              const ctaBase =
                "ctaLabel" in item && item.ctaLabel
                  ? item.ctaLabel.replace(/\s*→\s*$/, "").trim()
                  : "Lees de gids";

              const cardInner = (
                <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  {/* Gradient header */}
                  <div
                    className={`bg-gradient-to-br ${item.gradient} h-32 flex items-center justify-center relative`}
                  >
                    <span className="text-5xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.comingSoon && (
                      <span className="absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/80 text-stone-500 border border-stone-200 backdrop-blur-sm">
                        Binnenkort
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="font-serif text-xl text-stone-900">
                      {item.name}
                    </h2>
                    <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed flex-1">
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
                    {!item.comingSoon && (
                      <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#5A8F6A] group-hover:gap-2 transition-all">
                        {ctaBase}
                        <span aria-hidden="true">→</span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return item.comingSoon ? (
                <div key={item.slug} className="cursor-default opacity-70">
                  {cardInner}
                </div>
              ) : (
                <Link
                  key={item.slug}
                  href={cardHref}
                  data-tags={item.tags.join(",")}
                  className="block"
                >
                  {cardInner}
                </Link>
              );
            })}
          </div>

          {/* Productvergelijkingen — compact */}
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
              <p className="text-xs font-medium tracking-widest text-stone-400 uppercase">
                Onze vergelijkingen
              </p>
            </div>
            <p className="text-sm text-stone-500 mb-6 max-w-xl">
              Producten vergeleken op inhoud, kwaliteit en prijs per dag — dezelfde criteria als in onze gidsen.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VERGELIJKINGEN.map((v) => (
                <Link
                  key={v.href}
                  href={v.href}
                  className="group flex flex-col rounded-xl border border-stone-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-[#5A8F6A]/40 hover:shadow-md"
                >
                  <span className="font-serif text-base font-semibold text-stone-900">
                    {v.name}
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-stone-500 line-clamp-2">
                    {v.tagline}
                  </span>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#5A8F6A] group-hover:gap-1.5 transition-all">
                    Bekijk vergelijking
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Sectie 4: Leefstijlcheck CTA ─────────────────────── */}
      <section
        className="py-16 lg:py-20"
        style={{ background: "#FDFCFA" }}
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
                className="inline-flex items-center gap-2 bg-white text-[#5A8F6A] rounded-lg px-8 py-3.5 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
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

import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Onze methodologie | PerfectSupplement",
  description:
    "Hoe we supplementen beoordelen: criteria, weging en onafhankelijkheid. Transparant en herhaalbaar.",
  alternates: { canonical: "/methodologie" },
};

const vergelijkingen = [
  { href: "/beste-omega-3-supplement", label: "Omega-3", sub: "EPA, DHA en prijs per dag" },
  { href: "/beste-magnesium", label: "Magnesium", sub: "Bisglycinaat, citraat en malaat" },
  { href: "/beste-ashwagandha", label: "Ashwagandha", sub: "KSM-66, Sensoril en generiek" },
  { href: "/beste-vitamine-d", label: "Vitamine D", sub: "D3, met of zonder K2" },
  { href: "/beste-creatine", label: "Creatine", sub: "Monohydraat en alternatieven" },
  { href: "/beste-zink", label: "Zink", sub: "Picolinaat, bisglycinaat en gluconaat" },
];

const criteria = [
  {
    title: "Biobeschikbaarheid",
    pct: "25%",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
        <path d="M9 3h6v5l2 4v6a1 1 0 01-1 1H8a1 1 0 01-1-1v-6l2-4V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 3H7M15 3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    content: <p className="text-sm leading-relaxed text-stone-600">Hoeveel je lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.</p>,
  },
  {
    title: "Dosering",
    pct: "30%",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
        <path d="M12 3v1M6.34 5.34l.7.7M3 12h1M6.34 18.66l.7-.7M12 20v1M17.66 18.66l-.7-.7M21 12h-1M17.66 5.34l-.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 16h14M8 16l1.5-5h5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 19h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    content: (
      <p className="text-sm leading-relaxed text-stone-600">
        Of de dosis aansluit bij de{" "}
        <Link href="/kennisbank/adh" className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]">ADH</Link>{" "}
        en bij klinisch onderzoek.
      </p>
    ),
  },
  {
    title: "Prijs-kwaliteit",
    pct: "25%",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v1m0 8v1m-2.5-5.5C9.5 10.67 10.5 10 12 10s2.5.67 2.5 1.5S13.5 13 12 13s-2.5.67-2.5 1.5S10.5 16 12 16s2.5-.67 2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    content: <p className="text-sm leading-relaxed text-stone-600">De prijs per effectieve dosis, niet per capsule.</p>,
  },
  {
    title: "Transparantie",
    pct: "20%",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-[#5A8F6A]">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    content: (
      <p className="text-sm leading-relaxed text-stone-600">
        <Link href="/kennisbank/derde-partij-testen" className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]">Derde-partij testen</Link>,{" "}
        EFSA-claims en volledige ingrediëntenlijst.
      </p>
    ),
  },
];

export default function MethodologiePage() {
  const linkClass =
    "font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] transition hover:decoration-[#5A8F6A]";

  return (
    <>
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
                  <span className="text-stone-600">Methodologie</span>
                </li>
              </ol>
            </nav>

            <section className="pt-10 pb-12 md:pt-14 md:pb-16">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-4xl">
                Hoe wij supplementen beoordelen
              </h1>

              <p className="text-lg text-stone-500 leading-relaxed max-w-xl mt-4">
                We beoordelen supplementen niet op marketing, maar op inhoud,
                dagdosering, transparantie en praktische toepasbaarheid.
              </p>
            </section>
          </Container>
        </div>

        <Container>
          <section id="leefstijl-eerst" className="mt-12 text-base leading-relaxed text-stone-600 max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
              Leefstijl eerst, supplementen tweede
            </h2>
            <p>
              Wij geloven in de juiste volgorde. Slaaphygiëne, voeding, beweging en
              stressmanagement vormen het fundament. Supplementen komen op nummer twee —
              als aanvulling, niet als vervanging. Dit noemen we{" "}
              <Link href="/kennisbank/healthspan" className={linkClass}>healthspan</Link>-denken:
              niet langer leven, maar langer goed leven.
            </p>
          </section>

          <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {criteria.map((item) => (
              <article key={item.title} className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 opacity-20 transition-opacity group-hover:opacity-35" aria-hidden="true" />
                <div className="relative rounded-2xl bg-white p-5 shadow-sm h-full flex flex-col">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    {item.icon}
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="font-display text-base font-semibold text-stone-900">{item.title}</h2>
                    <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{item.pct}</span>
                  </div>
                  {item.content}
                </div>
              </article>
            ))}
          </section>

          <div className="mt-16 md:mt-20 space-y-14">
            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Hoe producten worden geselecteerd
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                We selecteren producten op basis van relevantie binnen een categorie,
                beschikbaarheid bij betrouwbare aanbieders en de transparantie van het merk.
                Daarbij kijken we niet alleen naar populaire producten, maar naar producten die
                duidelijk genoeg gespecificeerd zijn om te beoordelen op dagdosering, prijs per dag
                en claims.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Hoe claims worden gecontroleerd
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Informatie over ingrediënten beschrijven we neutraal op basis van wetenschappelijke
                literatuur en toegestane{" "}
                <Link href="/kennisbank/efsa-claims" className={linkClass}>gezondheidsclaims</Link>{" "}
                binnen de Europese regelgeving. We maken claims niet groter dan ze zijn — geen
                medische overclaims, geen beloften die onvoldoende onderbouwd zijn. De informatie
                op deze website vervangt geen medisch advies.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Dosering en prijs per dag
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Een potprijs zegt weinig zonder gebruikscontext. Daarom kijken we naar de prijs
                per effectieve dagdosering. Een lage instapprijs kan alsnog minder sterk uitvallen
                als je meerdere capsules per dag nodig hebt — een hogere prijs is alleen
                verdedigbaar als daar aantoonbaar betere inhoud tegenover staat.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Hoe rankings tot stand komen
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Rankings ontstaan op basis van een gewogen beoordeling van biobeschikbaarheid,
                dosering, prijs-kwaliteit en transparantie — de vier criteria bovenaan deze pagina.
                Ze worden aangepast wanneer productsamenstellingen, prijzen of beschikbare informatie
                veranderen.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Affiliate transparantie
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Sommige links op deze website zijn affiliate links — we kunnen een commissie
                ontvangen wanneer iemand via zo&apos;n link een product koopt. Deze vergoeding
                heeft geen invloed op de criteria of rankings. We benoemen affiliate links
                expliciet om commerciële prikkels zichtbaar te houden.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Bekijk onze vergelijkingen
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Elk supplement hieronder is beoordeeld met dezelfde methodologie — ongeacht
                of we er een affiliate-vergoeding voor ontvangen.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vergelijkingen.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-sm"
                  >
                    <span className="text-sm font-medium text-stone-900">{item.label}</span>
                    <span className="mt-1 text-xs text-stone-500">{item.sub}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <section className="my-16">
            <div className="bg-gradient-to-br from-[#5A8F6A] to-[#4a7a5a] text-white rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                Niet zeker welk supplement bij jou past?
              </h2>
              <p className="text-white/80 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk resultaat.
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
          </section>
        </Container>
      </main>
    </>
  );
}

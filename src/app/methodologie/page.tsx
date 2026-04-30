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
    content: <p className="text-sm leading-relaxed text-stone-600">Hoeveel je lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.</p>,
  },
  {
    title: "Dosering",
    pct: "30%",
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
    content: <p className="text-sm leading-relaxed text-stone-600">De prijs per effectieve dosis, niet per capsule.</p>,
  },
  {
    title: "Transparantie",
    pct: "20%",
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

            <section className="pt-10 pb-20 md:pt-14 md:pb-28">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight max-w-4xl">
                Hoe wij supplementen beoordelen
              </h1>

              <p className="text-lg text-stone-500 leading-relaxed max-w-xl mt-4">
                We beoordelen supplementen niet op marketing, maar op inhoud,
                dagdosering, transparantie en praktische toepasbaarheid.
              </p>

              <p className="mt-4 max-w-2xl text-base text-stone-600 leading-relaxed">
                Op deze pagina leggen we uit hoe producten worden geselecteerd, welke
                criteria we gebruiken, hoe claims worden gecontroleerd, hoe affiliate
                links werken en wanneer beoordelingen worden herijkt. Wil je zien hoe
                dit er in de praktijk uitziet? Bekijk een van onze vergelijkingen
                onderaan deze pagina, bijvoorbeeld die van omega-3, magnesium of creatine.
              </p>
            </section>
          </Container>
        </div>

        <Container>
          <section id="leefstijl-eerst" className="mt-12 space-y-5 text-base leading-relaxed text-stone-600 max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
              Leefstijl eerst, supplementen tweede
            </h2>
            <p>
              Wij geloven in de juiste volgorde. Slaaphygiëne, voeding, beweging en
              stressmanagement vormen het fundament. Supplementen komen pas op nummer
              twee — als aanvulling op een sterk fundament, niet als vervanging.
            </p>
            <p>
              Dit noemen we{" "}
              <Link href="/kennisbank/healthspan" className={linkClass}>healthspan</Link>-denken:
              niet langer leven, maar langer goed leven. De Leefstijlcheck meet niet of
              je supplementen nodig hebt — hij meet hoe sterk je fundament is.
            </p>
          </section>

          <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {criteria.map((item) => (
              <article key={item.title} className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 opacity-20 transition-opacity group-hover:opacity-35" aria-hidden="true" />
                <div className="relative rounded-2xl bg-white p-5 shadow-sm h-full flex flex-col">
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
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Niet alle supplementen op de markt worden op deze website opgenomen. We
                  selecteren producten op basis van relevantie binnen een categorie,
                  beschikbaarheid bij betrouwbare aanbieders en de mate van transparantie
                  van het merk.
                </p>
                <p>
                  Het doel is om een representatieve selectie van producten te tonen die
                  bezoekers helpt verschillende opties beter te vergelijken. Daarbij kijken
                  we niet alleen naar populaire producten, maar vooral naar producten die
                  inhoudelijk logisch zijn binnen een specifieke categorie en duidelijk
                  genoeg gespecificeerd zijn om te beoordelen op dagdosering, prijs per dag
                  en claims. Bekijk een van onze vergelijkingen onderaan deze pagina voor een concreet voorbeeld.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Hoe claims worden gecontroleerd
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Informatie over ingrediënten en mogelijke effecten proberen we zorgvuldig
                  en neutraal te beschrijven. Daarbij kijken we naar beschikbare
                  wetenschappelijke literatuur en, waar relevant, naar toegestane{" "}
                  <Link href="/kennisbank/efsa-claims" className={linkClass}>gezondheidsclaims</Link>{" "}
                  binnen de Europese regelgeving en de dosiscontext waarin zo&apos;n claim
                  gebruikt mag worden.
                </p>
                <p>
                  We proberen claims niet groter te maken dan ze zijn — geen absolute
                  formuleringen of gezondheidsbeloften die onvoldoende onderbouwd zijn,
                  geen medische overclaims, en geen claims die alleen kloppen bij een
                  hogere dosis dan het product levert. De informatie op deze website is
                  bedoeld als algemene informatie en vervangt geen medisch advies, diagnose
                  of behandeling.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Dosering en prijs per dag
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  In veel categorieën zegt een losse verpakking of potprijs weinig zonder
                  gebruikscontext. Daarom kijken we waar relevant naar dosering per dag,
                  capsules per dag en de prijs die daar in de praktijk bij hoort.
                </p>
                <p>
                  Een supplement met een aantrekkelijke instapprijs kan alsnog minder sterk
                  uitvallen wanneer de dagdosering laag is of wanneer je meerdere capsules
                  nodig hebt om op een relevante inname uit te komen. Omgekeerd is een
                  hogere prijs alleen verdedigbaar als daar ook aantoonbaar betere inhoud,
                  duidelijkere specificaties of meer praktisch nut tegenover staat.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Hoe rankings tot stand komen
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Rankings ontstaan niet op basis van één losse factor, maar op basis van
                  een gewogen beoordeling van biobeschikbaarheid, dosering, prijs-kwaliteit
                  en transparantie — de vier criteria die bovenaan deze pagina staan. Een
                  concreet voorbeeld zie je terug op onze vergelijkingspagina's.
                  Rankings kunnen worden aangepast wanneer productsamenstellingen, prijzen
                  of beschikbare informatie veranderen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Affiliate transparantie
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Sommige links op deze website zijn affiliate links — we kunnen een
                  commissie ontvangen wanneer iemand via zo&apos;n link een product koopt.
                  Deze vergoeding heeft geen invloed op welke criteria we gebruiken of hoe
                  rankings worden opgebouwd. We proberen commerciële prikkels zichtbaar te
                  houden door affiliate transparantie expliciet te benoemen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Updates en wijzigingen
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Productinformatie, samenstellingen en prijzen kunnen in de loop van de
                  tijd veranderen. Beoordelingen en rankings worden periodiek bijgewerkt
                  wanneer dat nodig is — zonder te doen alsof een eerdere beoordeling
                  definitief of tijdloos was.
                </p>
              </div>
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

import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Onze methodologie | PerfectSupplement",
  description:
    "Hoe we supplementen beoordelen: criteria, weging en onafhankelijkheid. Transparant en herhaalbaar.",
  alternates: { canonical: "/methodologie" },
};

const rankingFactors = [
  "biobeschikbaarheid van de gebruikte vorm",
  "dosering per aanbevolen dagdosering",
  "prijs per dag of gebruiksmoment",
  "transparantie van het merk en het etiket",
  "praktische toepasbaarheid, zoals capsules per dag of gebruiksgemak",
];

const updateMoments = [
  "wanneer productsamenstellingen veranderen",
  "wanneer prijzen of dagdoseringen duidelijk verschuiven",
  "wanneer nieuwe producten inhoudelijk relevant worden voor een vergelijking",
  "wanneer claims, bronverwijzingen of productinformatie herijkt moeten worden",
];

const vergelijkingen = [
  { href: "/beste-omega-3-supplement", label: "Omega-3", sub: "EPA, DHA en prijs per dag" },
  { href: "/beste-magnesium", label: "Magnesium", sub: "Bisglycinaat, citraat en malaat" },
  { href: "/beste-ashwagandha", label: "Ashwagandha", sub: "KSM-66, Sensoril en generiek" },
  { href: "/beste-vitamine-d", label: "Vitamine D", sub: "D3, met of zonder K2" },
  { href: "/beste-creatine", label: "Creatine", sub: "Monohydraat en alternatieven" },
  { href: "/beste-zink", label: "Zink", sub: "Picolinaat, bisglycinaat en gluconaat" },
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
                dit er in de praktijk uitziet? Bekijk een van onze vergelijkingen,
                bijvoorbeeld die van{" "}
                <Link href="/beste-omega-3-supplement" className={linkClass}>omega-3</Link>,{" "}
                <Link href="/beste-magnesium" className={linkClass}>magnesium</Link> of{" "}
                <Link href="/beste-ashwagandha" className={linkClass}>ashwagandha</Link>.
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
              Wij geloven in de juiste volgorde.{" "}
              <Link href="/kennisbank/slaaphygiene" className={linkClass}>Slaaphygiëne</Link>,
              voeding (waaronder voldoende{" "}
              <Link href="/kennisbank/eiwitbehoefte-na-40" className={linkClass}>eiwitinname</Link>),
              beweging en stressmanagement vormen het fundament. Supplementen komen pas op
              nummer twee — als aanvulling op een sterk fundament, niet als vervanging.
            </p>
            <p>
              Dit noemen we{" "}
              <Link href="/kennisbank/healthspan" className={linkClass}>healthspan</Link>-denken:
              niet langer leven, maar langer goed leven. De{" "}
              <Link href="/intake" className={linkClass}>Leefstijlcheck</Link> meet niet of je
              supplementen nodig hebt — hij meet hoe sterk je fundament is.
            </p>
          </section>

          <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  <Link href="/kennisbank/biobeschikbaarheid" className={linkClass}>Biobeschikbaarheid</Link>
                </h2>
                <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">25%</span>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                Hoeveel je lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.
              </p>
            </article>

            <article className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-display text-xl font-semibold text-stone-900">Dosering</h2>
                <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">30%</span>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                Of de dosis aansluit bij de{" "}
                <Link href="/kennisbank/adh" className={linkClass}>ADH</Link> en bij klinisch onderzoek.
              </p>
            </article>

            <article className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-display text-xl font-semibold text-stone-900">Prijs-kwaliteit</h2>
                <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">25%</span>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                De prijs per effectieve dosis, niet per capsule.
              </p>
            </article>

            <article className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-display text-xl font-semibold text-stone-900">Transparantie</h2>
                <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">20%</span>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                <Link href="/kennisbank/derde-partij-testen" className={linkClass}>Derde-partij testen</Link>,{" "}
                <Link href="/kennisbank/efsa-claims" className={linkClass}>EFSA-claims</Link>, en volledige ingrediëntenlijst.
              </p>
            </article>
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
                  en claims. Bekijk onze{" "}
                  <Link href="/beste-magnesium" className={linkClass}>magnesiumvergelijking</Link> of{" "}
                  <Link href="/beste-ashwagandha" className={linkClass}>ashwagandha-vergelijking</Link>{" "}
                  voor een concreet voorbeeld.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Welke criteria we gebruiken
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Onze beoordelingen zijn gebaseerd op een vaste set criteria. Die criteria
                  helpen om producten consistenter te bekijken en niet alleen af te gaan op
                  verpakking, merkbekendheid of commerciële positionering.
                </p>
                <p>
                  In de praktijk betekent dit dat we kijken naar de{" "}
                  <Link href="/kennisbank/chelaatvorm" className={linkClass}>chelaatvorm</Link> of
                  molecuulvorm van een ingrediënt, de dosering per dag, de informatie die
                  het merk beschikbaar stelt, prijs per dag en de algemene kwaliteit van het
                  product. Niet elk criterium weegt in elke categorie exact hetzelfde, maar
                  de uitgangspunten blijven gelijk.
                </p>
                <div className="grid gap-4 pt-2 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-stone-900">Biobeschikbaarheid</h3>
                      <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">25%</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">
                      Hoeveel je lichaam daadwerkelijk opneemt — niet wat er op het etiket staat.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-stone-900">Dosering</h3>
                      <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">30%</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">
                      Of de dosis aansluit bij de ADH en bij klinisch onderzoek.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-stone-900">Prijs-kwaliteit</h3>
                      <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">25%</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">
                      De prijs per effectieve dosis, niet per capsule.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F7F5F0]/50 border border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-stone-900">Transparantie</h3>
                      <span className="shrink-0 rounded-full bg-[#5A8F6A]/10 px-2 py-0.5 text-xs font-medium text-[#5A8F6A]">20%</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">
                      Derde-partij testen, EFSA-claims, en volledige ingrediëntenlijst.
                    </p>
                  </div>
                </div>
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
                  We proberen claims niet groter te maken dan ze zijn. Dat betekent ook dat
                  we terughoudend willen zijn met absolute formuleringen of
                  gezondheidsbeloften die onvoldoende onderbouwd zijn.
                </p>
                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                  <li>
                    We gebruiken waar mogelijk toegestane Europese gezondheidsclaims als
                    kader en vermijden medische overclaims.
                  </li>
                  <li>
                    We kijken of een claim past bij de dagdosering en niet alleen bij een
                    los ingrediënt op het label.
                  </li>
                  <li>
                    We beschrijven claims neutraal en gebruiken ze niet als bewijs voor
                    diagnose, behandeling of gegarandeerd effect.
                  </li>
                </ul>
                <p>
                  De informatie op deze website is bedoeld als algemene informatie en
                  vervangt geen medisch advies, diagnose of behandeling.
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
                  Wanneer producten worden vergeleken, gebruiken we de criteria die op deze
                  pagina worden beschreven. Rankings ontstaan dus niet op basis van één losse
                  factor, maar op basis van een bredere beoordeling van het product binnen
                  zijn categorie. Een concreet voorbeeld zie je terug op onze{" "}
                  <Link href="/beste-omega-3-supplement" className={linkClass}>omega-3 vergelijking</Link>,{" "}
                  <Link href="/beste-magnesium" className={linkClass}>magnesium vergelijking</Link> of{" "}
                  <Link href="/beste-ashwagandha" className={linkClass}>ashwagandha vergelijking</Link>.
                </p>
                <p>Factoren die daarbij onder andere een rol kunnen spelen:</p>

                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                  {rankingFactors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>

                <p>
                  Rankings kunnen worden aangepast wanneer nieuwe informatie beschikbaar
                  komt, productsamenstellingen veranderen of wanneer nieuwe producten aan
                  een vergelijking worden toegevoegd.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Affiliate transparantie
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Sommige links op deze website kunnen affiliate links zijn. Dat betekent
                  dat we mogelijk een commissie ontvangen wanneer iemand via zo&apos;n link
                  een product koopt.
                </p>
                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                  <li>Affiliate links kunnen een commissie opleveren wanneer iemand via een link koopt.</li>
                  <li>Een affiliate vergoeding verandert niet welke criteria we gebruiken of hoe rankings worden opgebouwd.</li>
                  <li>We proberen commerciële prikkels zichtbaar te houden door affiliate transparantie expliciet te benoemen.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-6">
                Updates en wijzigingen
              </h2>
              <div className="space-y-5 text-base leading-relaxed text-stone-600">
                <p>
                  Productinformatie, verpakkingen en samenstellingen kunnen in de loop van
                  de tijd veranderen. Daarom kunnen beoordelingen, vergelijkingen en
                  rankings periodiek worden bijgewerkt.
                </p>
                <p>We herijken content onder andere:</p>
                <ul className="list-disc space-y-3 pl-5 text-stone-600 marker:text-stone-400">
                  {updateMoments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  Op die manier proberen we informatie zo actueel en bruikbaar mogelijk te
                  houden, zonder te doen alsof elke beoordeling definitief of tijdloos is.
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

          <section className="my-16 rounded-2xl bg-[#F7F5F0] border border-stone-200 p-8 md:p-10">
            <p className="text-sm font-medium text-[#5A8F6A] mb-2">Persoonlijk advies</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900 mb-3">
              Niet zeker welk supplement bij jou past?
            </h2>
            <p className="text-base leading-relaxed text-stone-600 mb-6 max-w-xl">
              Doe de gratis Leefstijlcheck — 12 vragen, 3 minuten, persoonlijk resultaat.
            </p>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Start de Leefstijlcheck →
            </Link>
          </section>
        </Container>
      </main>
    </>
  );
}

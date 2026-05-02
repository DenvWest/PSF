import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Over PerfectSupplement — Wie We Zijn | PerfectSupplement",
  description:
    "PerfectSupplement is opgericht door Dennis van Westbroek, fysiotherapeut en leefstijlcoach. Onafhankelijke supplementvergelijking voor mannen 40+.",
  alternates: { canonical: "/over-ons" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PerfectSupplement",
  url: "https://perfectsupplement.nl",
  description: "Onafhankelijk supplementvergelijkingsplatform voor mannen 40+",
  founder: {
    "@type": "Person",
    name: "Dennis van Westbroek",
    jobTitle: "Fysiotherapeut & Leefstijlcoach",
    description:
      "BIG-geregistreerd fysiotherapeut en gecertificeerd leefstijlcoach met focus op mannen 40+",
  },
};

export default function OverOnsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <Container>
          <article className="py-14 lg:py-20">

            {/* SECTIE 1 — HERO */}
            <section className="mb-16">
              <h1 className="font-serif text-4xl font-normal text-slate-900 md:text-5xl">
                Over PerfectSupplement
              </h1>
              <p className="mt-5 max-w-2xl text-xl text-slate-600">
                Onafhankelijke supplementvergelijking door een fysiotherapeut
                die dagelijks ziet wat supplementen wél en niet doen.
              </p>
            </section>

            {/* SECTIE 2 — WIE ZIT HIERACHTER */}
            <section id="wie" className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Wie zit hierachter
              </h2>

              <p className="text-slate-600 leading-relaxed">
                Ik ben Dennis van Westbroek — fysiotherapeut (BIG-geregistreerd)
                en leefstijlcoach. In mijn praktijk werk ik dagelijks met mannen
                die merken dat hun lichaam verandert na hun 40e: minder energie,
                slechter slapen, langzamer herstel.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Veel van hen vragen me: "Welk supplement moet ik nemen?" Het
                eerlijke antwoord is bijna altijd: "Dat hangt ervan af." Maar
                de supplementenmarkt maakt het onnodig ingewikkeld — onduidelijke
                doseringen, marketingclaims die niet kloppen, en prijzen die
                nergens op slaan.
              </p>

              <p className="text-slate-600 leading-relaxed">
                PerfectSupplement is ontstaan uit frustratie over dat gat. Ik
                wilde een plek waar je als man van 40+ gewoon kunt zien: welk
                supplement bevat wat het claimt, in een vorm die je lichaam
                opneemt, tegen een eerlijke prijs.
              </p>
            </section>

            {/* SECTIE 3 — WAT WE DOEN (EN NIET DOEN) */}
            <section id="wat-we-doen" className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Wat we doen
              </h2>

              <p className="text-slate-600 leading-relaxed">
                We vergelijken supplementen op vier meetbare criteria: dosering,
                biobeschikbaarheid, prijs-kwaliteit en transparantie. Elk product
                wordt op dezelfde manier beoordeeld — ongeacht het merk.{" "}
                <Link
                  href="/methodologie"
                  className="text-emerald-600 underline-offset-2 hover:underline"
                >
                  Lees onze volledige methodologie →
                </Link>
              </p>

              <p className="text-slate-600 leading-relaxed">
                Daarnaast bieden we een gratis Leefstijlcheck aan: een korte
                vragenlijst die je slaap, stress, energie, voeding, beweging
                en herstel in kaart brengt. Op basis van je scores krijg je
                concrete suggesties — eerst leefstijlaanpassingen, dan pas
                supplementen.
              </p>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Wat we niet doen
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>We stellen geen medische diagnoses — bij klachten: ga naar je huisarts</li>
                  <li>We verkopen zelf geen supplementen</li>
                  <li>We accepteren geen gesponsorde plaatsingen of betaalde reviews</li>
                  <li>We verbergen geen nadelen — als een product slecht scoort, staat dat erbij</li>
                </ul>
              </div>
            </section>

            {/* SECTIE 4 — HOE WE GELD VERDIENEN */}
            <section id="hoe-we-geld-verdienen" className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Hoe we geld verdienen
              </h2>

              <p className="text-slate-600 leading-relaxed">
                PerfectSupplement verdient geld via affiliate links. Als je via
                onze vergelijkingspagina&apos;s een product koopt bij een webshop
                zoals Vitaminstore of VitalNutrition, ontvangen wij een kleine
                commissie. Je betaalt daar niets extra voor.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Dit model heeft een belangrijk voordeel: we hoeven geen eigen
                producten te verkopen, waardoor we onafhankelijk kunnen
                beoordelen. Maar het heeft ook een beperking: we kunnen alleen
                producten vergelijken van webshops waarmee we een affiliate
                samenwerking hebben. Dat vermelden we altijd.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Onze beoordeling wordt niet beïnvloed door de commissie. De{" "}
                <Link
                  href="/methodologie"
                  className="text-emerald-600 underline-offset-2 hover:underline"
                >
                  methodologie
                </Link>{" "}
                en scoringscriteria staan vast — een product dat slecht scoort
                krijgt een lage score, ook als we er commissie op verdienen.
              </p>
            </section>

            {/* SECTIE 5 — ACHTERGROND */}
            <section id="achtergrond" className="mb-16">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl mb-6">
                Achtergrond
              </h2>

              {/* Placeholder: voeg hier een foto van Dennis toe als hij dat wil */}
              <div className="rounded-2xl bg-slate-50 p-8">
                <h3 className="font-serif text-xl text-slate-900 mb-4">
                  Dennis van Westbroek
                </h3>

                <div className="space-y-2 text-slate-600">
                  <p>Fysiotherapeut (BIG-geregistreerd)</p>
                  <p>Gecertificeerd leefstijlcoach</p>
                  <p>Oprichter PerfectSupplement</p>
                </div>

                <p className="mt-4 text-slate-600 leading-relaxed">
                  Met een achtergrond in fysiotherapie en leefstijlcoaching
                  kijk ik naar supplementen vanuit de vraag: wat heeft
                  wetenschappelijk bewijs, wat is veilig, en wat past bij
                  de levensfase van mijn doelgroep? Ik claim geen
                  alwetendheid — bij twijfel verwijs ik naar de
                  wetenschappelijke bronnen of naar een arts.
                </p>
              </div>
            </section>

            {/* SECTIE 6 — CTA */}
            <section className="mb-12 rounded-2xl bg-emerald-50 px-8 py-10">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Ontdek waar jij staat
              </h2>
              <p className="mt-3 mb-6 text-slate-600 leading-relaxed">
                Benieuwd welke supplementen bij jouw situatie passen?
                De Leefstijlcheck duurt 3 minuten en is volledig gratis.
              </p>
              <Link
                href="/intake"
                className="inline-block rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Doe de gratis Leefstijlcheck
              </Link>
            </section>

            {/* SECTIE 7 — CONTACT */}
            <section>
              <p className="text-slate-500">
                Vragen of feedback?{" "}
                <Link
                  href="/contact"
                  className="text-emerald-600 underline-offset-2 hover:underline"
                >
                  Neem contact op →
                </Link>
              </p>
            </section>

          </article>
        </Container>
      </main>
    </>
  );
}

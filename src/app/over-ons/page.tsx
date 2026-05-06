import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Over PerfectSupplement — Wie We Zijn | PerfectSupplement",
  description:
    "PerfectSupplement is een onafhankelijk tegengewicht tegen keuzestress in supplementen — opgericht door fysiotherapeut Dennis van Westbroek. Leefstijl eerst, vergelijking daarna.",
  alternates: { canonical: "/over-ons" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PerfectSupplement",
  url: "https://perfectsupplement.nl",
  description:
    "Onafhankelijk supplementvergelijkingsplatform voor mannen 40+ — met leefstijl voorop en transparante productvergelijking",
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
              <div className="mt-5 max-w-2xl space-y-4 text-xl text-slate-600">
                <p>
                  De meeste mannen merken het ergens na hun veertigste. Je wordt
                  wakker zonder je écht uitgerust te voelen. Je traint, maar
                  herstelt trager. Je energie is minder stabiel dan vroeger.
                </p>
                <p>
                  Vroeg of laat komt dezelfde vraag:{" "}
                  <span className="text-slate-800">
                    “Moet ik iets met supplementen?”
                  </span>{" "}
                  Dit platform bestaat om je daarbij te helpen — kalm, helder en
                  zonder marketingruis.
                </p>
              </div>
            </section>

            {/* SECTIE 2 — WIE ZIT HIERACHTER */}
            <section id="wie" className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Wie zit hierachter
              </h2>

              <p className="text-slate-600 leading-relaxed">
                Ik ben Dennis van Westbroek — fysiotherapeut (BIG-geregistreerd)
                en leefstijlcoach. In mijn praktijk zie ik dagelijks mannen die
                precies hier tegenaan lopen. Bijna altijd volgt dezelfde vraag:{" "}
                <span className="text-slate-800">
                  “Welk supplement werkt nou echt?”
                </span>
              </p>

              <p className="text-slate-600 leading-relaxed">
                Het eerlijke antwoord? Dat hangt af van jouw situatie. Maar wat
                me steeds meer begon te frustreren, is wat er daarna gebeurt.
                Je gaat zoeken en belandt in een wirwar van tegenstrijdige
                claims, eindeloze keuzes en influencers die vaak maar een deel
                van het verhaal vertellen. Doseringen zijn onduidelijk of niet
                in proportie. En hoe langer je zoekt, hoe groter de keuzestress —
                en hoe minder je weet wie je nog kunt vertrouwen.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Achter elk supplement zit een verdienmodel. Dat wil niet zeggen
                dat alles verdacht is — wél dat transparantie en inhoud niet
                altijd voorop staan. De volledige waarheid zie je zelden in één
                advertentie of video. Dat voedt wantrouwen, terwijl je vooral
                duidelijkheid nodig hebt.
              </p>

              <p className="text-slate-600 leading-relaxed">
                PerfectSupplement is gestart als tegengewicht. Niet om nóg een
                snelle mening te verkopen, maar om drie vragen rustig te
                beantwoorden: wat zit erin, sluit dit aan bij wat we weten, en is
                het de prijs waard? Altijd volgens dezelfde criteria —{" "}
                <span className="text-slate-800">
                  onafhankelijk van het merk.
                </span>
              </p>

              <p className="text-slate-600 leading-relaxed">
                Eén ding wil ik hier extra scherp neerzetten. Een supplement is
                letterlijk een aanvulling. Het vervangt geen goede slaap,
                regelmatige beweging, degelijke voeding, aandacht voor stress
                noch sociale verbinding.                 Als die basis scheef staat, maakt geen enkel supplement het
                verschil dat marketing je voorspiegelt.{" "}
                <span className="text-slate-800">
                  Daarom beginnen we altijd bij de basis — en gebruiken we
                  supplementen alleen waar het zinvol is.
                </span>
              </p>
            </section>

            {/* SECTIE 3 — WAT WE DOEN (EN NIET DOEN) */}
            <section id="wat-we-doen" className="mb-16 space-y-6">
              <h2 className="font-serif text-2xl font-normal text-slate-900 md:text-3xl">
                Wat we doen
              </h2>

              <p className="text-slate-600 leading-relaxed">
                Zo vertaalt dat zich naar concrete vergelijkingen. We beoordelen
                supplementen op vier vaste punten: dosering,
                biobeschikbaarheid, prijs-kwaliteit en transparantie. Elk
                product doorloopt hetzelfde stramien — ongeacht het merk.{" "}
                <Link
                  href="/methodologie"
                  className="text-emerald-600 underline-offset-2 hover:underline"
                >
                  Lees onze volledige methodologie →
                </Link>
              </p>

              <p className="text-slate-600 leading-relaxed">
                <span className="text-slate-800">Eerst inzicht, dan pas aanvullen.</span>{" "}
                Met de gratis Leefstijlcheck breng je in een paar minuten je
                slaap, stress, energie, voeding, beweging en herstel in kaart.
                Op basis daarvan krijg je gerichte suggesties — eerst
                leefstijlaanpassingen, daarna pas supplementen die daadwerkelijk
                aansluiten.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Dit platform is er niet om je meer te laten kopen. Het is er om
                je grip te geven: beter begrijpen wat je doet, scherpere keuzes
                maken en minder afhankelijk te worden van glimmende verpakkingen
                en halve verhalen.
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
                Transparantie hoort ook hier. PerfectSupplement verdient via
                affiliate links: als je via onze vergelijkingspagina&apos;s een
                product koopt bij een webshop zoals Vitaminstore of
                VitalNutrition, ontvangen wij een kleine commissie — zonder
                extra kosten voor jou.
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
                  Vanuit fysiotherapie en leefstijlcoaching kijk ik naar wat
                  onderbouwd is, wat veilig past in jouw levensfase en waar een
                  pil wél of géén zinvolle aanvulling is. Ik claim geen
                  alwetendheid: bij twijfel verwijs ik naar bronnen of naar je
                  arts — supplementen zijn geen vervanging voor professioneel
                  medisch advies.
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

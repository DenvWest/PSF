import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";

export const metadata: Metadata = {
  title: "Gidsen na 40: slaap, energie, stress en herstel | PerfectSupplement",
  description:
    "Overzicht van onze themagidsen voor mannen 40+. Kies slaap, energie, stress, herstel of testosteron — praktisch en zonder diagnoses.",
  alternates: {
    canonical: "/gidsen",
  },
};

const guides = [
  {
    href: "/slaap-verbeteren-na-40",
    title: "Slaap Verbeteren Na 40: De Complete Gids",
    description:
      "Waarom je slaap verandert na 40 en wat daar leefstijlmatig achter zit.",
    linkLabel: "Slaap Verbeteren Na 40",
  },
  {
    href: "/energie-na-40",
    title: "Energie Na 40: Waarom Je Moe Bent en Wat Je Eraan Doet",
    description:
      "Wat er speelt als je energie structureel tegenvalt: slaap, ritme, eten en beweging.",
    linkLabel: "Energie Na 40",
  },
  {
    href: "/stress-verminderen-man",
    title: "Stress Verminderen na 40: Van Altijd 'Aan' Naar Meer Rust",
    description:
      "Hoe langdurige spanning anders voelt na 40 en welke aanknopingspunten je hebt.",
    linkLabel: "Stress Verminderen na 40",
  },
  {
    href: "/herstel-verbeteren-na-40",
    title: "Herstel Verbeteren Na 40: De Complete Gids",
    description:
      "Waarom herstel trager gaat na 40 en hoe rust en leefstijl meewegen.",
    linkLabel: "Herstel Verbeteren Na 40",
  },
  {
    href: "/testosteron-na-40",
    title: "Testosteron na 40: wat verandert en wat je zelf kunt doen",
    description:
      "Wat er rond testosteron verandert met de leeftijd, in begrijpelijke taal.",
    linkLabel: "Testosteron na 40",
  },
] as const;

export default function GidsenPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <article>
            <header>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Overzicht
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                Gidsen na 40
              </h1>
            </header>

            <section className="mt-10">
              <p className="text-lg text-gray-700 leading-relaxed">
                Geen snelle fixes of vage beloftes — gewoon begrijpen waar het wringt
                en wat je eraan doet. Hieronder vind je onze vijf themagidsen voor
                mannen 40+. Kies waar je nu mee bezig bent.
              </p>
            </section>

            <section className="mt-12" aria-label="Themagidsen">
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Kies je thema
              </h2>

              <div className="mt-6 space-y-4">
                {guides.map((guide) => (
                  <div
                    key={guide.href}
                    className="p-5 rounded-xl border border-stone-200 bg-stone-50"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-gray-900">{guide.title}</strong>
                      <br />
                      {guide.description}
                    </p>
                    <Link
                      href={guide.href}
                      className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] text-sm"
                    >
                      Lees de gids: {guide.linkLabel} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-200">
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Wil je weten waar je staat?
                </h3>
                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  De Leefstijlcheck brengt in 3 minuten jouw slaap-, stress- en
                  energieprofiel in kaart. Je krijgt een persoonlijk herstelplan —
                  gratis, zonder registratie.
                </p>
                <Link
                  href="/intake"
                  className="mt-5 inline-block bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                >
                  Doe de gratis Leefstijlcheck →
                </Link>
              </div>
            </section>

            <MedicalDisclaimer />
          </article>
        </div>
      </Container>
    </main>
  );
}

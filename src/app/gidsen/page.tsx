import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { GUIDE_SLUGS, GUIDE_DATA } from "@/data/gids";

export const metadata: Metadata = {
  title: "Gidsen na 40: slaap, energie, stress en herstel | PerfectSupplement",
  description:
    "Overzicht van onze themagidsen voor mannen 40+. Kies slaap, energie, stress, herstel of testosteron — praktisch en zonder diagnoses.",
  alternates: {
    canonical: "/gidsen",
  },
};

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
                en wat je eraan doet. Kies je thema en ontvang de gratis PDF per
                e-mail, of lees de complete gids op de website.
              </p>
            </section>

            <section className="mt-12" aria-label="Themagidsen">
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Kies je thema
              </h2>

              <div className="mt-6 space-y-4">
                {GUIDE_SLUGS.map((slug) => {
                  const guide = GUIDE_DATA[slug];
                  return (
                    <div
                      key={slug}
                      className="p-5 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong className="text-gray-900">{guide.optIn.title}</strong>
                        <br />
                        {guide.heroSubtitle}
                      </p>
                      <div className="mt-3 flex flex-col sm:flex-row gap-3 text-sm">
                        <Link
                          href={`/gids/${slug}`}
                          className="font-semibold text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                        >
                          Download gratis {guide.guideName} →
                        </Link>
                        <Link
                          href={guide.pillarHref}
                          className="text-stone-600 hover:text-ps-green underline underline-offset-[3px]"
                        >
                          Lees de complete gids online
                        </Link>
                      </div>
                    </div>
                  );
                })}
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
                  Ontdek jouw herstelprofiel — gratis →
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

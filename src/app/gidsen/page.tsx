import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { GUIDE_SLUGS, GUIDE_DATA } from "@/data/gids";

export const metadata: Metadata = {
  title: "Gidsen na 40: slaap, energie, stress en herstel | PerfectSupplement",
  description:
    "Overzicht van onze themagidsen voor mannen 40+. Kies slaap, energie, stress, herstel of testosteron — praktisch en zonder diagnoses.",
  ...canonicalMetadata("/gidsen"),
};

export default function GidsenPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <div className="pillar-prose">
          <article>
            <header>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Overzicht
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                Begrijp wat er na je 40e verandert
              </h1>
            </header>

            <section className="mt-10">
              <p className="text-lg text-gray-700 leading-relaxed">
                Slechter slapen, minder energie, trager herstel — na je 40e verandert
                er van alles. Deze gidsen helpen je begrijpen wat er speelt en welke
                stappen echt verschil maken. Geen hypes, geen wondermiddelen. Kies je
                thema, ontvang de gratis PDF per e-mail of lees de complete gids online.
              </p>
            </section>

            <section className="mt-12" aria-label="Leefstijl-pillars">
              <h2 className="font-serif text-3xl font-bold text-gray-900">
                Leefstijl eerst
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                De grootste winst zit zelden in een supplement. Slaap, voeding, beweging
                en herstel doen meestal het meeste — daarom beginnen deze gidsen daar.

              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="font-semibold text-gray-900">Voeding na 40</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Eiwit, ritme en vetten — de basis die na je 40e zwaarder telt.
                    Praktische stappen vóór je aan supplementen denkt.
                  </p>
                  <Link
                    href="/voeding-na-40"
                    className="mt-3 inline-block text-sm font-semibold text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                  >
                    Lees de pillar →
                  </Link>
                </div>
                <div className="p-5 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="font-semibold text-gray-900">Beweging na 40</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Kracht, herstel en ritme — zonder sportschool-hype. Wat werkt in
                    een drukke week.
                  </p>
                  <Link
                    href="/beweging-na-40"
                    className="mt-3 inline-block text-sm font-semibold text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                  >
                    Lees de pillar →
                  </Link>
                </div>
              </div>
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
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <Link
                          href={`/gids/${slug}`}
                          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                        >
                          Ontvang de gratis {guide.guideName} →
                        </Link>
                        <Link
                          href={guide.pillarHref}
                          className="text-sm text-stone-600 underline decoration-stone-300 underline-offset-[3px] transition-colors hover:text-ps-green"
                        >
                          Lees de pillar →
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

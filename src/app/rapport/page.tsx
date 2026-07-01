import type { Metadata } from "next";
import Link from "next/link";
import { DeltaRadar } from "@/components/report/DeltaRadar";
import { DeltaRow } from "@/components/report/DeltaRow";
import type { DomainScoreKey } from "@/lib/intake-engine";

export const metadata: Metadata = {
  title: "30-Dagen Hermeting: Zie Jouw Voortgang | PerfectSupplement",
  description:
    "Wat verandert er in 30 dagen? De PerfectSupplement-hermeting vergelijkt je startmeting met je huidige antwoorden en toont de verandering per domein — objectief en zonder attributie.",
  alternates: { canonical: "https://www.perfectsupplement.nl/rapport" },
  openGraph: {
    title: "30-Dagen Hermeting: Zie Jouw Voortgang",
    description:
      "Vergelijk je startmeting met de situatie na 30 dagen — slaap, energie, stress, herstel en meer.",
    url: "https://www.perfectsupplement.nl/rapport",
  },
};

const EXAMPLE_BASELINE: Record<DomainScoreKey, number> = {
  sleep_score: 38,
  energy_score: 42,
  stress_score: 55,
  nutrition_score: 50,
  movement_score: 45,
  recovery_score: 35,
  connection_score: 40,
};

const EXAMPLE_CURRENT: Record<DomainScoreKey, number> = {
  sleep_score: 52,
  energy_score: 54,
  stress_score: 50,
  nutrition_score: 55,
  movement_score: 52,
  recovery_score: 48,
  connection_score: 58,
};

const EXAMPLE_DELTA: Array<{ label: string; delta: number }> = [
  { label: "Slaap", delta: 14 },
  { label: "Energie", delta: 12 },
  { label: "Stress", delta: -5 },
  { label: "Voeding", delta: 5 },
  { label: "Beweging", delta: 7 },
  { label: "Herstel", delta: 13 },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "30-Dagen Hermeting: Zie Jouw Voortgang",
  description:
    "Uitleg over de 30-dagen hermeting van PerfectSupplement: hoe het werkt, wat het meet en wat de scores betekenen.",
  url: "https://www.perfectsupplement.nl/rapport",
  publisher: {
    "@type": "Organization",
    name: "PerfectSupplement",
    url: "https://www.perfectsupplement.nl",
  },
};

export default function RapportLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <section className="bg-slate-50 border-b border-slate-100 py-16">
          <div className="max-w-7xl px-6 lg:px-8 mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-sm font-medium text-emerald-600 mb-3">
                30-daagse hermeting
              </p>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Zie wat er verandert in 30 dagen
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Mannen 40+ die de intake doen ontvangen na 30 dagen een
                uitnodiging om te hermeten. Het rapport toont de verandering per
                domein — feitelijk, zonder conclusies over oorzaken.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl px-6 lg:px-8 mx-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                Voorbeeldrapport
              </h2>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-8">
                <p className="text-sm text-slate-500 text-center mb-6">
                  Voorbeeld — niet gebaseerd op echte meetdata
                </p>
                <DeltaRadar
                  baseline={EXAMPLE_BASELINE}
                  current={EXAMPLE_CURRENT}
                  daysSinceBaseline={30}
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-10">
                <h3 className="text-base font-semibold text-slate-900 mb-4">
                  Verandering per domein (voorbeeld)
                </h3>
                {EXAMPLE_DELTA.map(({ label, delta }) => (
                  <DeltaRow key={label} label={label} delta={delta} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl px-6 lg:px-8 mx-auto">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Hoe werkt de hermeting?
              </h2>
              <ol className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                    1
                  </span>
                  <span>
                    Je doet de{" "}
                    <Link
                      href="/intake"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      intake
                    </Link>{" "}
                    — 15 vragen over slaap, energie, stress en meer. Dit is je
                    startmeting.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                    2
                  </span>
                  <span>
                    Na 30 dagen ontvang je een e-mail met een persoonlijke link
                    om dezelfde vragen opnieuw te beantwoorden.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center">
                    3
                  </span>
                  <span>
                    Het rapport toont de verandering per domein als puntenverschil.
                    Geen oorzaken, geen garanties — alleen jouw beeld.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl px-6 lg:px-8 mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-slate-600 mb-6 text-base">
                De hermeting is gratis en onderdeel van de intake. Start vandaag
                met je nulmeting.
              </p>
              <Link
                href="/intake"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
              >
                Start de intake →
              </Link>
              <p className="mt-4 text-sm text-slate-400">
                Of lees meer over{" "}
                <Link
                  href="/supplementen"
                  className="text-slate-500 hover:text-slate-700 underline"
                >
                  supplementen
                </Link>{" "}
                en{" "}
                <Link
                  href="/blog"
                  className="text-slate-500 hover:text-slate-700 underline"
                >
                  onze blogs
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

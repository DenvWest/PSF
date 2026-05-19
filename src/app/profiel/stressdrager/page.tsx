import type { Metadata } from "next";
import Link from "next/link";
import AshwagandhaOnHoldDisclaimer from "@/components/compliance/AshwagandhaOnHoldDisclaimer";
import Container from "@/components/layout/Container";
import { stressdragerProfile } from "@/data/profiles/stressdrager";

const profile = stressdragerProfile;

export const metadata: Metadata = {
  title: profile.seo.title,
  description: profile.seo.description,
  alternates: {
    canonical: profile.seo.canonical,
  },
  openGraph: {
    title: profile.seo.title,
    description: profile.seo.description,
    url: profile.seo.canonical,
    type: "article",
  },
};

const herkenningBullets = profile.recognition.points.map((p) => p.situation);

const quickWinLayer = profile.stepCare.find((l) => l.id === "vandaag")!;
const quickWins = quickWinLayer.items.map((item, index) => ({
  number: String(index + 1),
  title: item.title,
  body: `${item.description} ${item.actionable}`,
}));

const monthLayer = profile.stepCare.find((l) => l.id === "komende-maand")!;
const weekLayer = profile.stepCare.find((l) => l.id === "deze-week")!;
const weekPlan = [
  {
    week: "Week 1–2",
    title: monthLayer.items[0].title,
    description: monthLayer.items[0].description,
  },
  {
    week: "Week 2–3",
    title: weekLayer.title,
    description: `${weekLayer.items[0].title}: ${weekLayer.items[0].description} ${weekLayer.items[1].title}: ${weekLayer.items[1].description} ${weekLayer.items[2].title}: ${weekLayer.items[2].description}`,
  },
  {
    week: "Week 3–4",
    title: monthLayer.items[1].title,
    description: monthLayer.items[1].description,
  },
];

function relatedLinkLabel(item: { href: string; linkText?: string }): string {
  if (item.linkText) return item.linkText;
  if (item.href === "/profiel/onrustige-slaper") return "Bekijk het Onrustige Slaper-profiel";
  if (item.href === "/beste/ashwagandha") return "Bekijk de ashwagandha vergelijking";
  if (item.href === "/beste/magnesium") return "Bekijk de magnesium vergelijking";
  return "Lees meer";
}

const breadcrumbJsonLd = [
  {
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
        name: "Profielen",
        item: "https://perfectsupplement.nl/profiel",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: profile.label,
        item: profile.seo.canonical,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: profile.hero.headline,
    description: profile.seo.description,
    author: {
      "@type": "Organization",
      name: "PerfectSupplement",
      url: "https://perfectsupplement.nl",
    },
    publisher: {
      "@type": "Organization",
      name: "PerfectSupplement",
    },
    datePublished: "2026-05-01",
    dateModified: "2026-05-01",
  },
];

export default function StressdragerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main>
        <Container>
          <article>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="pt-6 pb-2">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
                <li className="flex items-center gap-1">
                  <Link href="/" className="hover:text-slate-600 transition-colors">
                    Home
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
                <li className="flex items-center gap-1">
                  <Link href="/profiel" className="hover:text-slate-600 transition-colors">
                    Profielen
                  </Link>
                  <span aria-hidden="true">/</span>
                </li>
                <li>
                  <span className="text-slate-600">{profile.label}</span>
                </li>
              </ol>
            </nav>

            {/* Hero */}
            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                {profile.hero.headline}
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">{profile.hero.subline}</p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek hoe stress jouw lichaam beïnvloedt →
                </Link>
              </div>
            </section>

            {/* Herkenning */}
            <section id="herkenning" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">Ken Je Dit?</h2>
              <ul className="mt-6 space-y-3" role="list">
                {herkenningBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-4 bg-slate-50 rounded-xl p-5">
                    <span
                      className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-emerald-600"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 7L5.5 10.5L12 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <p className="text-slate-700 leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-slate-600 font-medium">{profile.recognition.closer}</p>
            </section>

            {/* Wat er aan de hand is */}
            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Er Aan De Hand Is
              </h2>
              <div className="mt-6 space-y-5">
                {profile.understanding.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-slate-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Wat je nu kunt doen */}
            <section id="aanpak" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Wat Je Nu Kunt Doen
              </h2>

              <h3 className="font-semibold text-lg text-slate-900 mt-8 mb-2">Quick Wins — Deze Week</h3>
              <p className="text-slate-600 mb-5">{quickWinLayer.subtitle}</p>
              <div className="space-y-4">
                {quickWins.map((item) => (
                  <div key={item.number} className="flex items-start gap-5 bg-slate-50 rounded-xl p-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                      {item.number}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-slate-600 mt-2 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-lg text-slate-900 mt-10 mb-2">
                Supplementen Die Helpen Bij Dit Profiel
              </h3>
              <p className="text-slate-600 mb-6">
                Leefstijl en kleine grenzen leggen het fundament. Als je ondanks die basis nog veel
                spanning en slechte slaap herkent, kan gerichte ondersteuning via supplementen een
                volgende stap zijn — deze twee sluiten vaak aan bij dit profiel:
              </p>

              <div className="mb-6">
                <AshwagandhaOnHoldDisclaimer />
              </div>

              <div className="space-y-5">
                {profile.supplements.map((supp) => (
                  <div key={supp.href} className="border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 text-base">{supp.name}</h4>
                    <div className="mt-3 space-y-3">
                      <p className="text-slate-600 leading-relaxed">{supp.why_this_profile}</p>
                      <p className="text-slate-600 leading-relaxed">{supp.efsa_claim}</p>
                    </div>
                    <p className="text-slate-500 text-sm mt-4">
                      {supp.href === "/beste/ashwagandha"
                        ? "Welke ashwagandha werkt het best? KSM-66 vs Sensoril — objectief vergeleken."
                        : "Welke magnesium vorm past bij jou? Glycinaat, bisglycinaat of citraat — objectief vergeleken."}
                    </p>
                    <Link
                      href={supp.href}
                      className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      {supp.href === "/beste/ashwagandha"
                        ? "Bekijk de ashwagandha vergelijking →"
                        : "Bekijk de magnesium vergelijking →"}
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* 30-Dagen Plan */}
            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 30-Dagen Stressplan
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {monthLayer.subtitle}. Je hoeft niet alles perfect te doen — volhoudbare stappen zijn
                belangrijker dan pieken van motivatie.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {weekPlan.map((step, index) => (
                  <div key={index} className="relative bg-slate-50 rounded-xl p-6">
                    <div className="inline-block bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {step.week}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base">{step.title}</h3>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">{step.description}</p>
                    {index < weekPlan.length - 1 && (
                      <span
                        className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 text-lg"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Blok */}
            <section className="py-16">
              <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                  {profile.guidanceCta.title}
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  {profile.guidanceCta.text}
                </p>
                <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto">
                  Geen medische test — wel inzicht in 6 leefstijldomeinen.
                </p>
                <Link
                  href="/intake"
                  className="inline-flex items-center mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek jouw profiel — match met Stressdrager
                </Link>
                <p className="mt-4 text-sm text-slate-400">
                  Gratis, anoniem, geen account nodig. Je krijgt direct je persoonlijke Herstelplan.
                </p>
              </div>
            </section>

            {/* Verder Lezen */}
            <section className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-xl text-slate-900 mb-6">Verder Lezen</h2>
              <div className="space-y-5">
                {profile.relatedPillar && (
                  <div>
                    <p className="text-slate-600 text-sm">{profile.relatedPillar.turboSnippet}</p>
                    <Link
                      href={profile.relatedPillar.href}
                      className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                    >
                      Alles over stressvermindering na 40 — de complete gids →
                    </Link>
                  </div>
                )}
                {profile.relatedComparisons.map((item, index) => (
                  <div key={`${item.href}-${index}`}>
                    <p className="text-slate-600 text-sm">{item.turboSnippet}</p>
                    <Link href={item.href} className="text-emerald-600 hover:underline font-medium">
                      {relatedLinkLabel(item)} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <aside className="py-8 border-t border-slate-100 text-xs text-slate-400">
              <p>
                PerfectSupplement geeft adviezen op basis van wetenschappelijk onderzoek, geen medische
                diagnoses. Bij langdurige somberheid, burn-outklachten of paniek: zoek professionele hulp via
                je huisarts of de POH-GGZ. Supplementen zijn geen vervanging voor psychologische zorg.
                Onze Leefstijlcheck is een hulpmiddel voor zelfinzicht, geen vervanging voor
                professioneel medisch advies. Bij aanhoudende klachten die je dagelijks functioneren
                beïnvloeden raden wij aan om contact op te nemen met je huisarts.
              </p>
            </aside>
          </article>
        </Container>
      </main>
    </>
  );
}

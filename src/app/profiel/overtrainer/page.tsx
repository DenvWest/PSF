import type { Metadata } from "next";
import Link from "next/link";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import Container from "@/components/layout/Container";
import { IntakeResultsReturnBanner } from "@/components/intake/IntakeResultsReturnBanner";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";
import { overtrainerProfile } from "@/data/profiles/overtrainer";

const profile = overtrainerProfile;
const PROFILE_LINK_CLASS =
  "font-medium text-emerald-600 underline underline-offset-2 hover:text-emerald-700";

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
    description: weekLayer.items.map((i) => `${i.title}: ${i.description}`).join(" "),
  },
  {
    week: "Week 3–4",
    title: monthLayer.items[1].title,
    description: monthLayer.items[1].description,
  },
];

const faqItems = [
  {
    q: 'Is dit automatisch "overtraining" in medische zin?',
    a: "Nee. Hier lees je herkenning zonder oordeel, geen medische diagnose. Bij aanhoudende blessures, uitval op werk of fors gewichtsverlies: schakel een huisarts of sportarts in.",
  },
  {
    q: "Moet ik helemaal stoppen met sporten?",
    a: "Zelden nodig. Meestal helpt volumekap en meer slaap meer dan het tot stilstand zetten van alle beweging. Licht wandelen of mobiliteit kan passen als klachten niet oplopen — vraag bij twijfel eerst je arts of trainer.",
  },
  {
    q: "Hoe snel kan ik verschil verwachten?",
    a: "Dat verschilt: trainingsgeschiedenis, werkstress en slapen sturen elk mee. Sommige mannen merken binnen enkele weken verschil; anderen hebben langer stabiele grenzen nodig. Houd kleine eigen metingen bij en herhaal de Leefstijlcheck voor het grotere plaatje.",
  },
  {
    q: "Met welk supplement begin ik?",
    a: "Geen vaste eerste keuze. Magnesium, omega-3 en eiwit dekken veel onderwerpen binnen officiële claimteksten. Vitamine D en zink stem je inhoudelijker af op voeding, zonlicht en eventueel bloedonderzoek — geen fantasiedoses zonder begeleiding.",
  },
  {
    q: "Wanneer zijn supplementen géén tussenstap meer?",
    a: "Bij druk- of pijnklachten in het borstgebied tijdens inspanning, flauwvallen, snelle toename van klacht na training, ernstige duizeligheid of fors onbedoeld gewichtsverlies: niet wachten op pillen maar direct medische triage zoeken.",
  },
];

function supplementComparisonTeaser(href: string): string {
  const map: Record<string, string> = {
    "/beste/magnesium": "Welke magnesiumvorm past bij jou? Glycinaat, citraat of bisglycinaat eerlijk naast elkaar.",
    "/beste/omega-3-supplement":
      "EPA/DHA-gehaltes, formulering en praktische dosering vergeleken, binnen officiële claimcontext.",
    "/beste/vitamine-d": "Bolus, dagelijkse doses en combinaties zonder gedoe op het etiket.",
    "/beste/zink": "Zwavelzouten, bisglycinaat en wat dat betekent voor opname én kopertekorten bij overdosering.",
    "/beste/creatine":
      "Monohydraat eerst hoe en wanneer 3 gram past bij korte bursts zonder rookgordijnmarketing.",
    "/beste/eiwitpoeder":
      "Whey, blends en plantaardige opties smaak en oplosbaarheid met kritische ketens op het label.",
  };
  return map[href] ?? "Objectief geordende vergelijkingspagina op basis van etiketinformatie.";
}

function relatedLinkLabel(item: { href: string; linkText?: string }): string {
  if (item.linkText) return item.linkText;
  if (item.href === "/profiel/onrustige-slaper") return "Bekijk het Onrustige Slaper-profiel";
  if (item.href === "/gids/herstel") return "Het thema Herstel — volledige context";
  if (item.href === "/gids/energie") return "Het energiethema";
  if (item.href === "/gids/slaap") return "Het slaapthema";
  if (item.href === "/beste/ashwagandha") return "Bekijk de ashwagandha vergelijking";
  if (item.href === "/beste/magnesium") return "Bekijk de magnesium vergelijking";
  if (item.href === "/beste/omega-3-supplement") return "Bekijk de omega-3 vergelijking";
  if (item.href === "/beste/vitamine-d") return "Bekijk de vitamine D vergelijking";
  if (item.href === "/beste/zink") return "Bekijk de zink vergelijking";
  if (item.href === "/beste/creatine") return "Bekijk de creatine vergelijking";
  if (item.href === "/beste/eiwitpoeder") return "Bekijk de eiwitpoeder vergelijking";
  if (item.href === "/blog/creatine-en-herstel") return "Lees: creatine en herstel na 40";
  if (item.href === "/kennisbank/overtrainingssyndroom") return "Overtrainingssyndroom in de kennisbank";
  return "Lees meer";
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const structuredJsonLd = [
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
    datePublished: "2026-05-09",
    dateModified: "2026-05-09",
  },
];

export default function OvertrainerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main>
        <Container>
          <article>
            <IntakeResultsReturnBanner />
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

            <section className="pt-10 pb-14">
              <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
                Profiel
              </span>
              <h1 className="font-[var(--font-heading)] text-3xl md:text-5xl text-slate-900 leading-tight max-w-2xl">
                {profile.hero.headline}
              </h1>
              <p className="mt-5 text-xl text-slate-600 max-w-2xl leading-relaxed">{profile.hero.subline}</p>
              <p className="mt-6 text-slate-600 max-w-2xl leading-relaxed">
                Meer over herstel na 40: zie ook het{" "}
                <Link href="/gids/herstel" className="text-emerald-600 font-medium hover:text-emerald-700">
                  thema Herstel
                </Link>
                , energie in het{" "}
                <Link href="/gids/energie" className="text-emerald-600 font-medium hover:text-emerald-700">
                  energiethema
                </Link>{" "}
                en slaap in het{" "}
                <Link href="/gids/slaap" className="text-emerald-600 font-medium hover:text-emerald-700">
                  slaapthema
                </Link>
                .
              </p>
              <div className="mt-8">
                <Link
                  href="/intake"
                  className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
                >
                  Check je balans tussen trainen en herstel →
                </Link>
              </div>
            </section>

            <section id="herkenning" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Herkenning — vijf veelgehoorde signalen
              </h2>
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

            <section id="uitleg" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                {profile.understanding.title}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
                HPA-as, cortisolritme, ontstekingsdruk en het centrale zenuwstelsel komen vaak ter sprake als
                je veel traint en weinig landt. Meer context:{" "}
                <Link href="/kennisbank/overtrainingssyndroom" className="text-emerald-600 font-medium hover:text-emerald-700">
                  overtrainingssyndroom in de kennisbank
                </Link>
                . Dit is algemene fysiologie geen persoonlijke diagnose.
              </p>
              <div className="mt-6 space-y-5">
                {profile.understanding.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-slate-600 leading-relaxed">
                    {renderInlineMarkdownLinks(paragraph, {
                      linkClassName: PROFILE_LINK_CLASS,
                    })}
                  </p>
                ))}
              </div>
            </section>

            <section id="aanpak" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Stap voor stap naar rustiger verhoudingen
              </h2>

              <h3 className="font-semibold text-lg text-slate-900 mt-8 mb-2">Quick wins — deze dagen</h3>
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
                Recovery-ondersteunende supplementen (alleen waar etiket + claims kloppen)
              </h3>
              <p className="text-slate-600 mb-6">
                Supplementen vervangen geen volumekap, slaap en vaste eiwitmaaltijden. Daarna kunnen ze
                logisch helpen waar Europese gezondheidsclaims houvast geven. Hieronder staan formuleringen die
                binnen die claimteksten blijven.
              </p>

              <div className="space-y-5">
                {profile.supplements.map((supp) => (
                  <div key={supp.href} className="border border-slate-200 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 text-base">{supp.name}</h4>
                    <div className="mt-3 space-y-3">
                      <p className="text-slate-600 leading-relaxed">{supp.why_this_profile}</p>
                      <p className="text-slate-600 leading-relaxed text-sm border-l-2 border-emerald-200 pl-3">
                        Claimcontext: {supp.efsa_claim}
                      </p>
                    </div>
                    <p className="text-slate-500 text-sm mt-4">{supplementComparisonTeaser(supp.href)}</p>
                    <Link
                      href={supp.href}
                      className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Naar de vergelijking →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section id="plan" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                Je 4-weken recovery-protocol
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {monthLayer.subtitle} {weekLayer.subtitle}. Je hoeft geen perfect atleetmodel te zijn: het gaat om
                consequent gas terugnemen én jezelf serieus meten.
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

            <section id="faq" className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">Veelgestelde vragen</h2>
              <dl className="mt-8 space-y-8">
                {faqItems.map((item) => (
                  <div key={item.q}>
                    <dt className="font-semibold text-slate-900">{item.q}</dt>
                    <dd className="mt-2 text-slate-600 leading-relaxed">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="py-16">
              <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-[var(--font-heading)] text-2xl md:text-3xl text-slate-900">
                  {profile.guidanceCta.title}
                </h2>
                <p className="text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                  {profile.guidanceCta.text}
                </p>
                <IntakeCtaMicro className="mt-4 max-w-xl mx-auto text-sm text-slate-500" />
                <Link
                  href="/intake"
                  className="inline-flex items-center mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-base"
                >
                  Ontdek jouw profiel — match met Overtrainer
                </Link>
              </div>
            </section>

            <section className="py-12 border-t border-slate-100">
              <h2 className="font-[var(--font-heading)] text-xl text-slate-900 mb-6">Verder lezen</h2>
              <div className="space-y-5">
                {profile.relatedPillar && (
                  <div>
                    <p className="text-slate-600 text-sm">{profile.relatedPillar.turboSnippet}</p>
                    <Link
                      href={profile.relatedPillar.href}
                      className="mt-2 inline-block font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px]"
                    >
                      Alles over herstel na 40 — het complete thema →
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

            <MedicalDisclaimer />
          </article>
        </Container>
      </main>
    </>
  );
}

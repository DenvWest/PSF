import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMetadata } from "@/lib/seo/canonical";
import Container from "@/components/layout/Container";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import PillarReadingChrome from "@/components/content/PillarReadingChrome";
import PillarStickyIntakeCta from "@/components/content/PillarStickyIntakeCta";
import { buildArticleSchema, buildFaqSchema } from "@/lib/seo/structuredData";

const LINK =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green hover:text-ps-green-hover";

export const metadata: Metadata = {
  title: "Beweging Na 40: Kracht, Ritme en Herstel | PerfectSupplement",
  description:
    "Krachttraining, cardio en herstel na 40 — zonder sportschool-hype. Praktische stappen vóór supplementen, met links naar blogs en kennisbank.",
  ...canonicalMetadata("/beweging-na-40"),
  openGraph: {
    title: "Beweging Na 40 — eerst belasting en rust, dan pas supplementen",
    description:
      "Herkenning, trainingsritme en wanneer creatine of eiwit zinvol zijn — voor mannen 40+.",
    url: "/beweging-na-40",
    type: "article",
  },
};

const articleSchema = buildArticleSchema({
  headline: "Beweging Na 40: Kracht, Ritme en Herstel",
  description:
    "Krachttraining, cardio en herstel na 40 — praktische stappen vóór supplementen.",
  path: "/beweging-na-40",
  datePublished: "2026-06-04",
});

const faqSchema = buildFaqSchema([
  {
    question: "Hoe vaak moet ik krachttrainen na 40?",
    answer:
      "Twee tot drie korte krachtsessies per week zijn voor veel mannen een haalbaar startpunt. Consistentie en progressieve belasting tellen meer dan het perfecte schema — bespreek pijn of blessures met je huisarts of fysiotherapeut.",
  },
  {
    question: "Moet ik meteen creatine nemen?",
    answer:
      "Nee. Eerst slaap, voeding (voldoende eiwit) en een haalbaar trainingsritme. Creatine kan daarna een ondersteuning zijn bij krachttraining — geen vervanging van herstel of rustdagen.",
  },
  {
    question: "Wat als ik altijd moe ben na training?",
    answer:
      "Dat kan wijzen op te veel volume, te weinig slaap of onvoldoende eiwit. Lees over overtraining en herstel; pas volume aan vóór je extra supplementen stapelt.",
  },
]);

export default function BewegingNa40Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="pb-24 md:pb-28 py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <PillarReadingChrome>
              <article>
                <header>
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                    Leefstijl eerst
                  </p>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-2">
                    Beweging Na 40: Kracht, Ritme en Herstel
                  </h1>
                  <p className="mt-4 text-lg text-gray-600">
                    Ken je dit: je traint nog “genoeg”, maar herstel duurt langer, spieren voelen
                    trager terug en je bent vaker stijf? Na 40 verandert hoe snel je belastbaar
                    bent — niet omdat bewegen niet meer werkt, maar omdat ritme en rust zwaarder
                    meetellen.
                  </p>
                  <div className="mt-6 text-center">
                    <Link
                      href="/intake"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-green-700 px-8 py-3 text-sm font-semibold text-white no-underline hover:bg-green-800 transition-colors"
                    >
                      Ontdek jouw bewegingsprofiel →
                    </Link>
                    <IntakeCtaMicro className="mx-auto mt-4 max-w-lg text-sm text-gray-500" />
                  </div>
                </header>

                <nav
                  className="mt-10 rounded-xl border border-stone-200 bg-white p-5 text-sm"
                  aria-label="Inhoudsopgave"
                >
                  <p className="font-semibold text-stone-900">Op deze pagina</p>
                  <ul className="mt-3 space-y-2 text-stone-600">
                    <li>
                      <a href="#herkenning" className={LINK}>
                        Herkenning
                      </a>
                    </li>
                    <li>
                      <a href="#biologie" className={LINK}>
                        Wat er na 40 verandert
                      </a>
                    </li>
                    <li>
                      <a href="#stappen" className={LINK}>
                        Stappen zonder sportschool-hype
                      </a>
                    </li>
                    <li>
                      <a href="#supplementen" className={LINK}>
                        Wanneer supplementen
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className={LINK}>
                        Veelgestelde vragen
                      </a>
                    </li>
                  </ul>
                </nav>

                <section id="herkenning" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Herken je dit?
                  </h2>
                  <ul className="mt-4 space-y-3 text-gray-700 leading-relaxed list-disc pl-5">
                    <li>Krachttraining voelt zwaarder dan vroeger; je herstelt een dag langer.</li>
                    <li>Cardio of wandelen schiet er in drukke weken bij in.</li>
                    <li>Je traint door “uit gewoonte” terwijl slaap of voeding achterblijven.</li>
                    <li>Spierpijn blijft hangen zonder dat je bewust meer volume deed.</li>
                  </ul>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Past dit bij jou? Bekijk{" "}
                    <Link href="/profiel/overtrainer" className={LINK}>
                      Overtrainer
                    </Link>{" "}
                    of{" "}
                    <Link href="/profiel/lage-batterij" className={LINK}>
                      Lage Batterij
                    </Link>
                    — of start de{" "}
                    <Link href="/intake" className={LINK}>
                      gratis Leefstijlcheck
                    </Link>
                    .
                  </p>
                </section>

                <section id="biologie" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Wat er na 40 verandert
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Spiermassa en kracht kunnen behouden blijven met voldoende{" "}
                    <Link href="/kennisbank/eiwitbehoefte-na-40" className={LINK}>
                      eiwit en belasting
                    </Link>
                    , maar herstel vraagt meer structuur. Te veel volume zonder rust kan
                    aansluiten bij{" "}
                    <Link href="/kennisbank/overtrainingssyndroom" className={LINK}>
                      overbelasting
                    </Link>{" "}
                    — geen diagnose, wel een signaal om volume te capen.
                  </p>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Cardio en dagelijkse beweging blijven belangrijk voor ritme, bloedsuiker en
                    slaap — niet als straf, maar als ondersteuning van je krachtwerk.
                  </p>
                </section>

                <section id="stappen" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Stappen die passen in een drukke week
                  </h2>
                  <ol className="mt-4 space-y-4 text-gray-700 leading-relaxed list-decimal pl-5">
                    <li>
                      <strong>2× kracht per week</strong> — ook thuis met lichaamsgewicht. Lees{" "}
                      <Link href="/blog/krachttraining-na-40" className={LINK}>
                        krachttraining na 40
                      </Link>
                      .
                    </li>
                    <li>
                      <strong>Rustdag na zware sessie</strong> — geen schuldgevoel, wel planning.
                    </li>
                    <li>
                      <strong>Eiwit bij maaltijden</strong> — zie{" "}
                      <Link href="/voeding-na-40" className={LINK}>
                        voeding na 40
                      </Link>{" "}
                      en{" "}
                      <Link href="/blog/eiwit-na-40" className={LINK}>
                        eiwit na 40
                      </Link>
                      .
                    </li>
                    <li>
                      <strong>Slaap prioriteit</strong> — training zonder slaap versterkt vermoeidheid; zie{" "}
                      <Link href="/slaap-verbeteren-na-40" className={LINK}>
                        slaap na 40
                      </Link>
                      .
                    </li>
                  </ol>
                </section>

                <section id="supplementen" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Supplementen: pas als laatste stap
                  </h2>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    Geen affiliate in deze pillar — wel doorverwijzingen als basis en belasting
                    kloppen:
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li>
                      <Link href="/supplementen/creatine" className={LINK}>
                        Creatine gids — wanneer het past bij krachttraining →
                      </Link>
                    </li>
                    <li>
                      <Link href="/beste/creatine" className={LINK}>
                        Objectieve creatine vergelijking (affiliate) →
                      </Link>
                    </li>
                    <li>
                      <Link href="/supplementen/eiwitpoeder" className={LINK}>
                        Eiwitpoeder gids — als voeding niet volstaat →
                      </Link>
                    </li>
                    <li>
                      <Link href="/herstel-verbeteren-na-40" className={LINK}>
                        Herstel-pillar — als training en slaap samen knellen →
                      </Link>
                    </li>
                  </ul>
                </section>

                <section id="faq" className="mt-12">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Veelgestelde vragen
                  </h2>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Kan ik beginnen zonder sportschool?
                      </h3>
                      <p className="mt-2 text-gray-700 leading-relaxed">
                        Ja. Lichaamsgewicht, elastieken of een paar dumbbells volstaan om te
                        starten — consistentie eerst.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Wanneer is creatine logisch?
                      </h3>
                      <p className="mt-2 text-gray-700 leading-relaxed">
                        Als je al structureel traint, voldoende eiwit eet en geen medische
                        contra-indicatie hebt. Vergelijk pas na je basis op orde is.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="mt-12 rounded-2xl bg-ps-green/10 p-6 text-center">
                  <p className="text-gray-800 font-medium">
                    Wil je weten of beweging, slaap of voeding bij jou het zwaarst weegt?
                  </p>
                  <Link
                    href="/intake"
                    className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-6 py-3 text-sm font-bold text-white no-underline hover:opacity-90"
                  >
                    Start de Leefstijlcheck →
                  </Link>
                </div>

                <MedicalDisclaimer className="mt-10" />
              </article>
            </PillarReadingChrome>
          </div>
        </Container>
        <PillarStickyIntakeCta />
      </main>
    </>
  );
}

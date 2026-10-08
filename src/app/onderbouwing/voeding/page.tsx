import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import EvidenceQuestionCard from "@/components/evidence/EvidenceQuestionCard";
import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { NutritionResultsReturnBanner } from "@/components/intake/NutritionResultsReturnBanner";
import { HOW_IT_WORKS_QUESTIONS, type HowItWorksQuestion } from "@/data/how-it-works";
import {
  NUTRITION_EVIDENCE_DISCLAIMER,
  NUTRITION_EVIDENCE_DISPLAY_ORDER,
  NUTRITION_EVIDENCE_STRENGTH_DISCLAIMER,
  NUTRITION_EVIDENCE_BY_ID,
} from "@/data/nutrition/nutrition-question-evidence";
import {
  NUTRITION_CORE_SLIDER_IDS,
  NUTRITION_QUESTIONS,
} from "@/data/nutrition/lifescore-questions";
import { voedingsnormenVoor, type KernstofMetNorm } from "@/data/nutrition/voedingsnormen";
import { CHECK_DURATION_LABEL } from "@/lib/check-facts";
import { NEVO_BEREKEND_CITATION, NEVO_CITATION, NEVO_URL } from "@/lib/nevo-bron";
import { normLabel } from "@/lib/nutrition-normen";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Onderbouwing Wat mis je?";
const DESCRIPTION =
  "Hoe PerfectSupplement rekent: waarom de check elke vraag stelt, welke norm we gebruiken (Gezondheidsraad, EFSA, NNR), waar de gehaltes vandaan komen (NEVO) en wat de PS-Score beoordeelt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/onderbouwing/voeding"),
  ...basicOpenGraph({ path: "/onderbouwing/voeding", title: TITLE, description: DESCRIPTION }),
};

const sectionTitleClass =
  "font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-900";
const subTitleClass = "font-display text-xl font-semibold text-stone-900";
const bodyClass = "mt-3 text-base leading-relaxed text-stone-600";
const linkClass = "font-medium text-emerald-800 underline";

const KERNSTOF_LABELS: Record<KernstofMetNorm, string> = {
  magnesium: "Magnesium",
  zinc: "Zink",
  vitamin_d: "Vitamine D",
  omega3: "Omega-3 (EPA+DHA)",
};
const KERNSTOF_ORDER: readonly KernstofMetNorm[] = ["magnesium", "zinc", "vitamin_d", "omega3"];
const NORMEN_MAN = voedingsnormenVoor("man");
const NORMEN_VROUW = voedingsnormenVoor("vrouw");

function promptForQuestionId(id: string): string | undefined {
  return NUTRITION_QUESTIONS.find((item) => item.id === id)?.prompt;
}

function howItWorks(id: HowItWorksQuestion["id"]): HowItWorksQuestion {
  const item = HOW_IT_WORKS_QUESTIONS.find((question) => question.id === id);
  if (!item) throw new Error(`Onbekende vraag: ${id}`);
  return item;
}

function QuestionHeader({ id, index }: { id: HowItWorksQuestion["id"]; index: number }) {
  const item = howItWorks(id);
  return (
    <header className="max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800">
        Vraag {index + 1} van 3 · {item.where}
      </p>
      <h2 className={`mt-2 ${sectionTitleClass}`}>{item.question}</h2>
      <p className={bodyClass}>{item.answer}</p>
    </header>
  );
}

export default function OnderbouwingVoedingPage() {
  return (
    <main className="bg-gradient-to-b from-[#FDFCFA] to-[#F7F5F0] pb-20">
      <Container className="pt-8 md:pt-12">
        <NutritionResultsReturnBanner />
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-stone-400">
            <li>
              <Link href="/" className="transition hover:text-stone-600">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/voeding" className="transition hover:text-stone-600">
                Voeding
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-stone-600">Onderbouwing</li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Onderbouwing van Wat mis je?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            We beantwoorden drie vragen, in deze volgorde. Per vraag lees je hier waar we
            op rekenen en welke bronnen we gebruiken.
          </p>
          <nav aria-label="Inhoud" className="mt-6">
            <ol className="space-y-2 text-base">
              {HOW_IT_WORKS_QUESTIONS.map((item, index) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={linkClass}>
                    {index + 1}. {item.question}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">Belangrijke afbakening</p>
            <p className="mt-2">{NUTRITION_EVIDENCE_DISCLAIMER}</p>
          </div>
        </header>

        <section id="nodig" className="mt-16 scroll-mt-28">
          <QuestionHeader id="nodig" index={0} />
          <div className="mt-8 max-w-4xl">
            <h3 className={subTitleClass}>Wat de check meet</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-stone-600">
              <li>
                {NUTRITION_CORE_SLIDER_IDS.length} vragen over hoe vaak je iets eet, plus je
                voorkeur en allergieën. Geen dagboek, geen grammen.
              </li>
              <li>
                Daaruit schatten we per stof of je voeding waarschijnlijk genoeg levert: eiwit,
                omega-3, magnesium, vitamine D en zink.
              </li>
              <li>
                Eerst krijg je stappen met gewone voeding. Een supplement komt pas in beeld als
                je voeding het gat waarschijnlijk niet dicht.
              </li>
              <li>Doe de check later opnieuw om verschil te zien. Het blijft een schatting, geen meting.</li>
            </ul>
          </div>

          <div className="mt-10">
            <h3 className={subTitleClass}>Waarom we elke vraag stellen</h3>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-stone-500">
              {NUTRITION_EVIDENCE_STRENGTH_DISCLAIMER}
            </p>
            <div className="mt-6 space-y-6">
              {NUTRITION_EVIDENCE_DISPLAY_ORDER.map((questionId, index) => (
                <EvidenceQuestionCard
                  key={questionId}
                  evidence={NUTRITION_EVIDENCE_BY_ID[questionId]}
                  prompt={promptForQuestionId(questionId)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="voeding" className="mt-20 scroll-mt-28">
          <QuestionHeader id="voeding" index={1} />

          <div className="mt-8 max-w-4xl">
            <h3 className={subTitleClass}>Welke norm we gebruiken</h3>
            <p className={bodyClass}>
              Per stof leggen we de normen van de Gezondheidsraad, EFSA en de Nordic Nutrition
              Recommendations (NNR 2023) naast elkaar. Verschillen ze, dan nemen we de hoogste.
              Zo krijg je liever een vinkje te weinig dan een vinkje dat niet klopt.
            </p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table className="w-full min-w-[480px] text-left text-sm">
                <caption className="sr-only">Normen per stof voor volwassenen tot 70</caption>
                <thead className="bg-stone-50 text-stone-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Stof</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Man</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Vrouw</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Bron</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-600">
                  {KERNSTOF_ORDER.map((stof) => (
                    <tr key={stof}>
                      <th scope="row" className="px-4 py-3 font-medium text-stone-800">
                        {KERNSTOF_LABELS[stof]}
                      </th>
                      <td className="px-4 py-3 tabular-nums">{normLabel(NORMEN_MAN[stof])}</td>
                      <td className="px-4 py-3 tabular-nums">{normLabel(NORMEN_VROUW[stof])}</td>
                      <td className="px-4 py-3">
                        {NORMEN_MAN[stof].bron === NORMEN_VROUW[stof].bron
                          ? NORMEN_MAN[stof].bron
                          : `${NORMEN_MAN[stof].bron} / ${NORMEN_VROUW[stof].bron}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={bodyClass}>Je eigen norm hangt af van wat je in Je doelen invult:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-stone-600">
              <li>
                <strong className="font-semibold text-stone-800">Geslacht</strong> bepaalt
                magnesium, zink en vitamine C. Weten we het niet, dan geldt de hogere waarde.
              </li>
              <li>
                <strong className="font-semibold text-stone-800">Leeftijd</strong> bepaalt
                calcium, vitamine D (20 µg vanaf 70) en de ondergrens voor eiwit (hoger vanaf 65).
              </li>
              <li>
                <strong className="font-semibold text-stone-800">Menstruatie</strong> bepaalt
                ijzer: 16 mg zolang je menstrueert, anders 11 mg. Dit vragen we alleen als je dat
                zelf wilt invullen.
              </li>
              <li>
                <strong className="font-semibold text-stone-800">Vegetarisch of veganistisch</strong>{" "}
                eten verhoogt de zinknorm, omdat plantaardige voeding zink minder goed laat opnemen.
              </li>
              <li>
                <strong className="font-semibold text-stone-800">Gewicht en hoe actief je dag is</strong>{" "}
                bepalen je vezelnorm (3 g per MJ die je verbruikt). Hoe zwaar je traint, bepaalt
                je eiwitdoel.
              </li>
            </ul>
            <p className={bodyClass}>
              Bij een stof zie je soms ook een &ldquo;onderzochte zone&rdquo;: wat onderzoek bij
              gezonde mensen laat zien. Die zone is extra informatie en verandert je norm niet.
              Op een etiket staat een ander getal, de % ADH. Dat is één vaste waarde voor
              iedereen, niet jouw norm.
            </p>
          </div>

          <div className="mt-10 max-w-4xl">
            <h3 className={subTitleClass}>Waar de gehaltes vandaan komen</h3>
            <p className={bodyClass}>
              Wat er in een voedingsmiddel zit, halen we uit het Nederlands
              Voedingsstoffenbestand (NEVO) van het RIVM. We nemen die waarden ongewijzigd over,
              per 100 gram. Rekenen we ze om naar jouw portie of tellen we ze op tot een dag,
              dan is dat onze berekening op basis van NEVO. Supermarktproducten zonder
              NEVO-record komen van het etiket, via Open Food Facts. Meer daarover op{" "}
              <Link href="/bronnen" className={linkClass}>
                Bronnen en licenties
              </Link>
              .
            </p>
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-relaxed text-stone-600">
              <p className="font-semibold text-stone-800">Bronvermelding</p>
              <p className="mt-2">
                Gehaltes:{" "}
                <a href={NEVO_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
                  {NEVO_CITATION}
                </a>
                .
              </p>
              <p className="mt-1">Dagtotalen en porties: {NEVO_BEREKEND_CITATION}.</p>
            </div>
          </div>

          <div className="mt-10 max-w-4xl">
            <h3 className={subTitleClass}>Wat &ldquo;≈&rdquo; en een streepje betekenen</h3>
            <p className={bodyClass}>
              Staat er ≈ bij een getal, dan is het een schatting: NEVO heeft dat product niet,
              dus rekenen we met een vergelijkbaar product (diepvriesbroccoli met gekookte
              broccoli). Een vinkje voor je norm krijg je alleen op echte meetwaarden. Een
              streepje betekent dat de stof niet gemeten is, niet dat er niets in zit.
            </p>
          </div>
        </section>

        <section id="supplement" className="mt-20 scroll-mt-28">
          <QuestionHeader id="supplement" index={2} />
          <div className="mt-8 max-w-4xl">
            <p className="text-base leading-relaxed text-stone-600">
              De PS-Score (0–100) beoordeelt een product: de dosering vergeleken met de dosis
              uit onderzoek, de vorm van de stof, erkende EU-claims, een transparant etiket en
              onafhankelijke toetsing. Hij zegt
              niets over jou en is geen advies om iets te nemen. De prijs telt niet mee. Of een
              supplement past, volgt uit de eerste twee vragen: alleen als je voeding een gat
              laat, zet je voeding en supplement naast elkaar.
            </p>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Lees hoe we scoren in{" "}
              <Link href="/ps-score" className={linkClass}>
                de PS-Score-methode
              </Link>{" "}
              of bekijk de beoordeelde producten in de{" "}
              <Link href="/supplementen" className={linkClass}>
                supplementengids
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-emerald-900 p-8 text-emerald-50">
          <h2 className="font-display text-2xl font-semibold">Begin bij je voeding</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
            De check duurt ongeveer {CHECK_DURATION_LABEL}. Je ziet per stof of je voeding
            waarschijnlijk genoeg levert, en wat je eerst met gewone voeding kunt doen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <IntakeCtaLink
              locatie="onderbouwing_voeding"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Wat mis je? Doe de check
            </IntakeCtaLink>
            <Link
              href="/voeding-na-40"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            >
              Voeding na 30
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}

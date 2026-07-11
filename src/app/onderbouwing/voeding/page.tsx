import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import EvidenceQuestionCard from "@/components/evidence/EvidenceQuestionCard";
import { NutritionResultsReturnBanner } from "@/components/intake/NutritionResultsReturnBanner";
import {
  NUTRITION_EVIDENCE_DISCLAIMER,
  NUTRITION_EVIDENCE_DISPLAY_ORDER,
  NUTRITION_EVIDENCE_STRENGTH_DISCLAIMER,
  NUTRITION_EVIDENCE_BY_ID,
} from "@/data/nutrition/nutrition-question-evidence";
import { NUTRITION_QUESTIONS } from "@/data/nutrition/lifescore-questions";
import { canonicalMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Onderbouwing Voedingscheck | PerfectSupplement",
  description:
    "Wetenschappelijke onderbouwing van de snelle voedingscheck per vraag — frequentie-proxy's, vuistregels en bronnen.",
  ...canonicalMetadata("/onderbouwing/voeding"),
};

const sectionTitleClass =
  "font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-900";

function promptForQuestionId(id: string): string | undefined {
  const question = NUTRITION_QUESTIONS.find((item) => item.id === id);
  if (!question) return undefined;
  if (question.kind === "slider") return question.prompt;
  return question.prompt;
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
              <Link href="/onderbouwing" className="transition hover:text-stone-600">
                Onderbouwing
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-stone-600">Voedingscheck</li>
          </ol>
        </nav>

        <header className="max-w-4xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            Onderbouwing van de voedingscheck
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            De voedingscheck op{" "}
            <Link href="/intake/voeding" className="font-medium text-emerald-800 underline">
              /intake/voeding
            </Link>{" "}
            is een lichtgewicht frequentie-check: geen dagboek, geen grammen-logging.
            Deze pagina legt uit waarom we elke vraag stellen en hoe we gaps inschatten.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">Belangrijke afbakening</p>
            <p className="mt-2">{NUTRITION_EVIDENCE_DISCLAIMER}</p>
          </div>
        </header>

        <section className="mt-14 max-w-4xl">
          <h2 className={sectionTitleClass}>Wat meet de voedingscheck?</h2>
          <ul className="mt-4 space-y-2 text-base leading-relaxed text-stone-600">
            <li>- 10 frequentie-sliders + voorkeur en allergieën (opgeslagen, niet altijd in advies).</li>
            <li>- 5 nutriënt-banden: eiwit, omega-3, magnesium, vitamine D en zink.</li>
            <li>- Leefstijl-eerst advies met portie-vuistregels; supplementen alleen via een vier-stappen gate.</li>
            <li>- Herhaal de check om verschil te zien — geen medische uitspraak.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            Meer context:{" "}
            <Link href="/voeding-na-40" className="font-medium text-emerald-800 underline">
              Voeding na 40
            </Link>
            {" · "}
            <Link href="/onderbouwing" className="font-medium text-emerald-800 underline">
              Leefstijlcheck-onderbouwing
            </Link>
          </p>
        </section>

        <section className="mt-16">
          <h2 className={sectionTitleClass}>Onderbouwing per vraag</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-stone-500">
            {NUTRITION_EVIDENCE_STRENGTH_DISCLAIMER}
          </p>
          <div className="mt-6 space-y-6">
            {NUTRITION_EVIDENCE_DISPLAY_ORDER.map((questionId, index) => {
              const evidence = NUTRITION_EVIDENCE_BY_ID[questionId];
              return (
                <EvidenceQuestionCard
                  key={questionId}
                  evidence={evidence}
                  prompt={promptForQuestionId(questionId)}
                  index={index}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-emerald-900 p-8 text-emerald-50">
          <h2 className="font-display text-2xl font-semibold">
            Van onderbouwing naar actie
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
            De check duurt ongeveer drie minuten. Je krijgt direct inzicht in je
            frequentie — en concrete stappen vóór je supplementen overweegt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/intake/voeding"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Doe de voedingscheck
            </Link>
            <Link
              href="/onderbouwing"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            >
              Leefstijlcheck-onderbouwing
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}

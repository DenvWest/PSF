import type { NutritionQuestionEvidence } from "@/data/nutrition/nutrition-question-evidence";
import EvidenceReferenceList from "@/components/evidence/EvidenceReferenceList";
import EvidenceStars from "@/components/evidence/EvidenceStars";

interface EvidenceQuestionCardProps {
  evidence: NutritionQuestionEvidence;
  prompt?: string;
  headingLevel?: "h2" | "h3";
  index?: number;
}

export default function EvidenceQuestionCard({
  evidence,
  prompt,
  headingLevel = "h3",
  index,
}: EvidenceQuestionCardProps) {
  const Heading = headingLevel;
  const headingText =
    index !== undefined ? `Vraag ${index + 1}: ${evidence.title}` : evidence.title;

  return (
    <article
      id={evidence.questionId}
      className="scroll-mt-28 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <Heading className="font-display text-xl font-semibold text-stone-900">
        {headingText}
      </Heading>
      {prompt ? (
        <p className="mt-2 text-base leading-relaxed text-stone-700">{prompt}</p>
      ) : null}

      <div className="mt-6 space-y-5">
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Waarom stellen we deze vraag?
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {evidence.whyThisQuestion}
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Wetenschappelijke onderbouwing
          </h4>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed text-stone-600">
            {evidence.scientificRationale.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Wat zegt jouw antwoord?
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {evidence.answerMeaning.higherAlignment}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {evidence.answerMeaning.lowerAlignment}
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Sterkte van het bewijs
          </h4>
          <div className="mt-2">
            <EvidenceStars stars={evidence.strength.stars} label={evidence.strength.label} />
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {evidence.strength.rationale}
            </p>
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-800">
            Bronnen
          </h4>
          <EvidenceReferenceList references={evidence.references} />
        </section>
      </div>
    </article>
  );
}

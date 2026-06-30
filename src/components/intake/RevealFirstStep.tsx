"use client";

import { buildRecommendationInput } from "@/lib/recommendation-input";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { resolveRevealFirstStep } from "@/lib/reveal-first-step";
import type { RevealModel } from "@/lib/reveal-model";

type RevealFirstStepProps = {
  model: RevealModel;
  answers: Record<string, number>;
};

function teaser(detail: string): string {
  const first = detail.split(". ")[0].trim();
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

export default function RevealFirstStep({ model, answers }: RevealFirstStepProps) {
  const input = buildRecommendationInput({
    scores: mapCheckScoresToDomainScores(model.scores),
    answers,
  });
  const step = resolveRevealFirstStep(model, input);

  return (
    <article className="reveal-first-step reveal-first-step--premium">
      <section className="reveal-first-step__lane reveal-first-step__lane--now">
        <header className="reveal-first-step__lane-head">
          <span className="reveal-first-step__lane-badge reveal-first-step__lane-badge--now">
            {step.lifestyleTrack}
          </span>
          <span className="reveal-first-step__lane-meta">{REVEAL_COPY.firstStepNowMeta}</span>
        </header>
        <h3 className="reveal-first-step__title">{step.lifestyle.title}</h3>
        <p className="reveal-first-step__detail">{teaser(step.lifestyle.detail)}</p>
      </section>

      {step.qualifiesForSupplement && step.supplement ? (
        <section className="reveal-first-step__lane reveal-first-step__lane--supplement">
          <header className="reveal-first-step__lane-head">
            <span className="reveal-first-step__lane-badge reveal-first-step__lane-badge--later">
              {REVEAL_COPY.firstStepLaterLabel}
            </span>
          </header>
          <div className="reveal-first-step__product">
            <div className="reveal-first-step__product-main">
              <span className="reveal-first-step__supplement-name">{step.supplement.name}</span>
              <span className="reveal-first-step__supplement-form">{step.supplement.form}</span>
            </div>
            <span className="reveal-first-step__grade">{step.supplement.grade}</span>
          </div>
          <p className="reveal-first-step__quality">{step.supplement.qualityRule}</p>
        </section>
      ) : (
        <section className="reveal-first-step__lane reveal-first-step__lane--supplement-muted">
          <header className="reveal-first-step__lane-head">
            <span className="reveal-first-step__lane-badge reveal-first-step__lane-badge--later">
              {REVEAL_COPY.firstStepLaterLabel}
            </span>
          </header>
          <p className="reveal-first-step__detail">{REVEAL_COPY.firstStepNoSupplementLead}</p>
        </section>
      )}
    </article>
  );
}

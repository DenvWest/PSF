"use client";

import type { ComponentType } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import {
  REVEAL_COPY,
  REVEAL_FIRST_STEP_APPROACH,
} from "@/lib/results-reveal-copy";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import { resolveRevealFirstStep } from "@/lib/reveal-first-step";
import type { RevealModel } from "@/lib/reveal-model";
import type { Pillar } from "@/types/dashboard";

type RevealFirstStepProps = {
  model: RevealModel;
  answers: Record<string, number>;
  selectedPillar: Pillar;
};

function teaser(detail: string): string {
  const first = detail.split(". ")[0].trim();
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

export default function RevealFirstStep({ model, answers, selectedPillar }: RevealFirstStepProps) {
  const input = buildRecommendationInput({
    scores: mapCheckScoresToDomainScores(model.scores),
    answers,
  });
  const step = resolveRevealFirstStep(model, input, { selectedPillar });
  const pillarMeta = PILLAR[selectedPillar.id];
  const PillarIcon = Icons[pillarMeta.icon as keyof typeof Icons] as ComponentType<{
    s?: number;
  }>;

  return (
    <article className="reveal-first-step reveal-first-step--premium">
      <section className="reveal-first-step__approach" aria-label={REVEAL_COPY.firstStepApproachTitle}>
        <p className="reveal-first-step__approach-title">{REVEAL_COPY.firstStepApproachTitle}</p>
        <ul className="reveal-first-step__approach-list">
          {REVEAL_FIRST_STEP_APPROACH.map((item) => (
            <li key={item.label} className="reveal-first-step__approach-item">
              <span className="reveal-first-step__approach-dot" aria-hidden />
              <span>
                <span className="reveal-first-step__approach-label">{item.label}</span>
                {" — "}
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="reveal-first-step__lane reveal-first-step__lane--now">
        <header className="reveal-first-step__lane-head">
          <div className="reveal-first-step__pillar-row">
            <span
              className="reveal-first-step__icon-square"
              style={{
                background: `${selectedPillar.color}1a`,
                color: selectedPillar.color,
              }}
              aria-hidden
            >
              <PillarIcon s={18} />
            </span>
            <span className="reveal-first-step__lane-badge reveal-first-step__lane-badge--now">
              {step.lifestyleTrack}
            </span>
            <span className="reveal-first-step__duration-pill">{REVEAL_COPY.durationBadge}</span>
          </div>
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
            <div className="reveal-first-step__pillar-row reveal-first-step__pillar-row--muted">
              <span className="reveal-first-step__icon-square reveal-first-step__icon-square--muted" aria-hidden>
                <Icons.Lock s={16} />
              </span>
              <span className="reveal-first-step__lane-badge reveal-first-step__lane-badge--later">
                {REVEAL_COPY.firstStepLaterLabel}
              </span>
            </div>
          </header>
          <p className="reveal-first-step__detail">{REVEAL_COPY.firstStepNoSupplementLead}</p>
        </section>
      )}
    </article>
  );
}

"use client";

import type { ReactNode } from "react";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealDashboardTease from "@/components/intake/RevealDashboardTease";
import RevealStartSection from "@/components/intake/RevealStartSection";
import RevealHeroCard from "@/components/intake/RevealHeroCard";
import type { ProfileLabel } from "@/lib/intake-engine";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealStoryPathProps = {
  model: RevealModel;
  profile: ProfileLabel;
  answers: Record<string, number>;
  firstName?: string | null;
};

type PathStepProps = {
  step: string;
  title: string;
  children: ReactNode;
  isLast?: boolean;
  stepId?: string;
};

function PathStep({ step, title, children, isLast = false, stepId }: PathStepProps) {
  return (
    <li
      id={stepId}
      className={`reveal-path-step${isLast ? " reveal-path-step--last" : ""}`}
    >
      <div className="reveal-path-step__rail" aria-hidden>
        <span className="reveal-path-step__node">{step}</span>
        {!isLast ? <span className="reveal-path-step__line" /> : null}
      </div>
      <div className="reveal-path-step__content">
        <header className="reveal-path-step__header">
          <h2 className="reveal-path-step__title">{title}</h2>
        </header>
        <div className="reveal-path-step__panel">{children}</div>
      </div>
    </li>
  );
}

export default function RevealStoryPath({
  model,
  profile,
  answers,
  firstName = null,
}: RevealStoryPathProps) {
  return (
    <article className="reveal-path" aria-label="Jouw leefstijlverhaal">
      <header className="reveal-path__intro">
        <p className="reveal-path__eyebrow">{REVEAL_COPY.eyebrow}</p>
        <p className="reveal-path__lead">{REVEAL_COPY.pathIntro}</p>
      </header>

      <ol className="reveal-path__track">
        <PathStep step="01" title={REVEAL_COPY.stepTitleRecognition}>
          <RevealHeroCard model={model} profile={profile} firstName={firstName} />
        </PathStep>

        <PathStep step="02" title={REVEAL_COPY.stepTitleStart}>
          <RevealStartSection model={model} answers={answers} />
        </PathStep>

        <PathStep step="03" title={REVEAL_COPY.stepTitleDashboard}>
          <RevealDashboardTease model={model} />
        </PathStep>

        <PathStep step="04" title={REVEAL_COPY.stepTitleSave} isLast stepId="reveal-step-save">
          <RevealCtaStack />
        </PathStep>
      </ol>

      <p className="reveal-path__disclaimer">{REVEAL_COPY.contextLine}</p>
    </article>
  );
}

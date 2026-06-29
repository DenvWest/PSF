"use client";

import type { ReactNode } from "react";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealDashboardTease from "@/components/intake/RevealDashboardTease";
import RevealFirstStep from "@/components/intake/RevealFirstStep";
import RevealHeroCard from "@/components/intake/RevealHeroCard";
import RevealLadderCard from "@/components/intake/RevealLadderCard";
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
  label: string;
  title: string;
  children: ReactNode;
  isLast?: boolean;
};

function PathStep({ step, label, title, children, isLast = false }: PathStepProps) {
  return (
    <li className={`reveal-path-step${isLast ? " reveal-path-step--last" : ""}`}>
      <div className="reveal-path-step__rail" aria-hidden>
        <span className="reveal-path-step__node">{step}</span>
        {!isLast ? <span className="reveal-path-step__line" /> : null}
      </div>
      <div className="reveal-path-step__content">
        <header className="reveal-path-step__header">
          <p className="reveal-path-step__label">{label}</p>
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
        <PathStep
          step="01"
          label={REVEAL_COPY.pathStepProfile}
          title={profile.name}
        >
          <RevealHeroCard model={model} profile={profile} firstName={firstName} />
        </PathStep>

        <PathStep
          step="02"
          label={REVEAL_COPY.pathStepPriority}
          title={REVEAL_COPY.whereYouStartTitle}
        >
          <RevealLadderCard model={model} />
        </PathStep>

        <PathStep
          step="03"
          label={REVEAL_COPY.pathStepAction}
          title={REVEAL_COPY.firstStepTitle}
        >
          <RevealFirstStep model={model} answers={answers} />
        </PathStep>

        <PathStep
          step="04"
          label={REVEAL_COPY.pathStepDashboard}
          title={REVEAL_COPY.dashboardTeaseTitle}
        >
          <RevealDashboardTease model={model} />
        </PathStep>

        <PathStep
          step="05"
          label={REVEAL_COPY.pathStepSave}
          title="Klaar om door te gaan?"
          isLast
        >
          <RevealCtaStack />
        </PathStep>
      </ol>

      <p className="reveal-path__disclaimer">{REVEAL_COPY.contextLine}</p>
    </article>
  );
}

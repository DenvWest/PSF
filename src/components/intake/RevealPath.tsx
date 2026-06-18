"use client";

import VitalityRing from "@/components/app/VitalityRing";
import PriorityLadderPreview from "@/components/intake/PriorityLadderPreview";
import RevealLifestylePlan from "@/components/intake/RevealLifestylePlan";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealPathProps = {
  model: RevealModel;
  emailLine?: string | null;
  onViewDashboard: () => void;
};

export default function RevealPath({ model, emailLine, onViewDashboard }: RevealPathProps) {
  return (
    <div className="space-y-5 lg:space-y-6">
      <section aria-label="Jouw vitaliteit">
        <article
          className="rounded-3xl border px-5 py-5 lg:px-6 lg:py-6"
          style={{
            background: "var(--panel, rgba(255,255,255,0.05))",
            borderColor: "rgba(90,143,106,0.28)",
            boxShadow: "0 0 0 1px rgba(90,143,106,0.08)",
          }}
        >
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-8">
            <VitalityRing value={model.vitality} showLockedHint size={160} />
            <div className="text-center lg:text-left">
              <p className="font-serif text-xl text-intake-ink lg:text-[22px]">
                {model.profileName}
              </p>
              {emailLine ? (
                <p className="mt-1 text-sm text-intake-ink-muted">{emailLine}</p>
              ) : null}
              <p className="mt-2 text-[13px] text-intake-ink-subtle lg:max-w-[30ch]">
                {REVEAL_COPY.contextLine}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Waar je begint">
        <header className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
              {REVEAL_COPY.priorityEyebrow}
            </p>
            <h2 className="mt-1 font-serif text-xl text-intake-ink">
              {REVEAL_COPY.priorityTitle}
            </h2>
          </div>
          <span className="text-xs text-intake-ink-subtle">{REVEAL_COPY.priorityHint}</span>
        </header>
        <PriorityLadderPreview
          topLadder={model.topLadder}
          scores={model.scores}
          totalPillars={model.ladder.length}
          onViewDashboard={onViewDashboard}
        />
      </section>

      <RevealLifestylePlan items={model.lifestyle} />
    </div>
  );
}

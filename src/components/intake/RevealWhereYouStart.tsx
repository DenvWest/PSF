import Link from "next/link";
import { Leaf } from "@/components/app/icons";
import PriorityLadderPreview from "@/components/intake/PriorityLadderPreview";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealWhereYouStartProps = {
  model: RevealModel;
  onViewDashboard: () => void;
};

export default function RevealWhereYouStart({ model, onViewDashboard }: RevealWhereYouStartProps) {
  const firstStep = model.lifestyle[0];
  if (!firstStep) {
    return null;
  }

  return (
    <section aria-label="Waar je begint">
      <header className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-serif text-xl text-intake-ink">{REVEAL_COPY.whereYouStartTitle}</h2>
        <span className="text-xs text-intake-ink-subtle">{REVEAL_COPY.priorityHint}</span>
      </header>
      <article
        className="overflow-hidden rounded-3xl border"
        style={{
          background: "var(--panel, rgba(255,255,255,0.05))",
          borderColor: "var(--panel-border, rgba(255,255,255,0.12))",
        }}
      >
        <PriorityLadderPreview
          topLadder={model.topLadder}
          scores={model.scores}
          totalPillars={model.ladder.length}
          onViewDashboard={onViewDashboard}
          embedded
        />
        <Link
          href="/account/login"
          className="block border-t border-intake-divider p-4 no-underline transition-colors hover:bg-intake-sage/8 lg:p-5"
          style={{
            borderTopColor: "rgba(90,143,106,0.22)",
            background: "rgba(90,143,106,0.06)",
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-intake-sage/30 bg-intake-sage/15 text-intake-sage">
                <Leaf s={15} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-intake-sage">
                {REVEAL_COPY.lifestyleTrack}
              </span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-intake-sage">
              Start hier →
            </span>
          </div>
          <p className="text-[15px] font-semibold text-intake-ink">{firstStep.win.title}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-intake-ink-muted">
            {firstStep.win.detail}
          </p>
          <p className="mt-2 text-[13px] text-intake-sage">{REVEAL_COPY.firstStepCtaHint}</p>
        </Link>
      </article>
    </section>
  );
}

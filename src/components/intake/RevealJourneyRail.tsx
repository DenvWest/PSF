import { REVEAL_COPY } from "@/lib/results-reveal-copy";

const STEPS = [
  { id: "overview", label: REVEAL_COPY.journeyOverview, active: true },
  { id: "plan", label: REVEAL_COPY.journeyPlan, active: false },
  { id: "dashboard", label: REVEAL_COPY.journeyDashboard, active: false },
] as const;

export default function RevealJourneyRail() {
  return (
    <nav
      aria-label="Je route"
      className="flex items-center justify-center gap-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
    >
      {STEPS.map((step, index) => (
        <span key={step.id} className="flex items-center gap-2">
          {index > 0 ? (
            <span className="text-intake-ink-subtle" aria-hidden>
              —
            </span>
          ) : null}
          <span
            className={
              step.active
                ? "rounded-full border border-intake-sage/40 bg-intake-sage/15 px-2.5 py-1 text-intake-sage"
                : "px-1 text-intake-ink-subtle"
            }
          >
            {step.active ? `${step.label} ●` : step.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

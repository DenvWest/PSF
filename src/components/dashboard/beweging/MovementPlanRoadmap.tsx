"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import type {
  MovementPlanRoadmapView,
  MovementRoadmapPhase,
  RoadmapPhaseState,
} from "@/lib/movement-plan-roadmap";

export type MovementPlanRoadmapProps = {
  view: MovementPlanRoadmapView;
  /** Eén paneel tegelijk: selecteren vervangt, het stapelt niet. */
  openPhaseId: string;
  onOpenPhase: (phaseId: string) => void;
  vandaagHref: string;
  renderPhaseBody: (phaseId: string) => ReactNode;
  /** Programma-kaart + sport-lens vóór het fase-paneel. */
  beforePhase?: ReactNode;
  /** Plan-sheet ná het fase-paneel. */
  afterPhase?: ReactNode;
  /** Mechanisme + medische grens, onder het paneel. */
  footer?: ReactNode;
};

const STATE_WORD: Record<RoadmapPhaseState, string> = {
  done: "Afgerond",
  active: "Nu",
  ahead: "Later",
};

const PANEL_STATE_WORD: Record<RoadmapPhaseState, string> = {
  done: "afgerond",
  active: "nu actief",
  ahead: "preview",
};

function markerClass(state: RoadmapPhaseState): string {
  const base =
    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold";
  if (state === "active") {
    return `${base} bg-[color:var(--ac)] text-[#0F1C10]`;
  }
  if (state === "done") {
    return `${base} border border-[color:var(--ac)]/50 text-[color:var(--ac)]`;
  }
  return `${base} border border-white/20 text-[#7E8C82]`;
}

function segmentStatus(phase: MovementRoadmapPhase): string {
  const word = STATE_WORD[phase.state];
  if (phase.state === "ahead" || phase.stepCount === 0) {
    return word;
  }
  return `${word} · ${phase.loggedCount}/${phase.stepCount}`;
}

export default function MovementPlanRoadmap({
  view,
  openPhaseId,
  onOpenPhase,
  vandaagHref,
  renderPhaseBody,
  beforePhase,
  afterPhase,
  footer,
}: MovementPlanRoadmapProps) {
  const openPhase =
    view.phases.find((phase) => phase.id === openPhaseId) ??
    view.phases.find((phase) => phase.id === view.activePhaseId) ??
    view.phases[0];

  return (
    <>
      <header className="mb-5 border-b border-white/10 pb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Jouw stappenplan · beweging
        </p>
        <h2 className="font-serif text-[22px] font-normal leading-tight text-[#F1EFE8] text-pretty">
          {view.positionLabel} — {view.headline}
        </h2>
        {view.routeLine ? (
          <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
            {view.routeLine}
          </p>
        ) : null}
        {view.remeasureLine ? (
          <p className="mt-2 max-w-[68ch] border-l-2 border-[color:var(--ac)]/50 pl-3 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
            {view.remeasureLine}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
          {view.anchorQuote ? (
            <span className="italic text-[#9FB0A6]">“{view.anchorQuote}”</span>
          ) : null}
          <span className="text-[#7E8C82]">
            Afvinken doe je in{" "}
            <Link
              href={vandaagHref}
              className="font-semibold text-[color:var(--ac)] underline decoration-[color:var(--ac)]/40 underline-offset-2"
            >
              Overzicht
            </Link>
          </span>
        </div>
      </header>

      <div className="grid gap-5 @[1080px]:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] @[1080px]:gap-8">
        <nav
          aria-label="Fase-as"
          className="min-w-0 @[1080px]:sticky @[1080px]:top-4 @[1080px]:self-start"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7E8C82]">
            Jouw route
          </p>
          <ol className="grid grid-cols-3 gap-2 @[1080px]:grid-cols-1 @[1080px]:gap-1.5">
            {view.phases.map((phase, index) => {
              const isOpen = phase.id === openPhase?.id;
              const reached = phase.state !== "ahead";
              return (
                <li key={phase.id} className="min-w-0">
                  <span
                    aria-hidden
                    className={`mb-2 block h-[3px] rounded-full @[1080px]:hidden ${
                      reached ? "bg-[color:var(--ac)]/70" : "bg-white/[0.12]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => onOpenPhase(phase.id)}
                    aria-expanded={isOpen}
                    aria-controls={`phase-panel-${phase.id}`}
                    aria-current={phase.state === "active" ? "step" : undefined}
                    className={`flex min-h-[44px] w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left transition-colors @[1080px]:px-3 @[1080px]:py-2.5 ${
                      isOpen
                        ? "border-white/25 bg-white/[0.06]"
                        : "border-transparent hover:border-white/15"
                    }`}
                  >
                    <span className="flex w-full items-center gap-1.5">
                      <span className={markerClass(phase.state)} aria-hidden>
                        {phase.state === "done" ? (
                          <Icons.Check s={11} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={`min-w-0 text-[11.5px] leading-tight ${
                          phase.state === "active"
                            ? "font-semibold text-[#F1EFE8]"
                            : "text-[#CDD7D0]"
                        }`}
                      >
                        {phase.horizonLabel}
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
                      {segmentStatus(phase)}
                    </span>
                    <span className="hidden text-[12.5px] leading-snug text-[#9FB0A6] text-pretty @[1080px]:block">
                      {phase.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 space-y-3">
          {beforePhase}

          {openPhase ? (
            <article
              id={`phase-panel-${openPhase.id}`}
              aria-labelledby={`phase-panel-title-${openPhase.id}`}
              className="rounded-2xl border border-white/10 bg-[#131F1D]/90 p-5"
            >
              <header className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                    {openPhase.horizonLabel} · {PANEL_STATE_WORD[openPhase.state]}
                  </p>
                  {openPhase.state === "active" ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
                      staat komt uit Overzicht
                    </span>
                  ) : null}
                </div>
                <h3
                  id={`phase-panel-title-${openPhase.id}`}
                  className="mt-1 font-serif text-[20px] text-[#F1EFE8] text-pretty"
                >
                  {openPhase.title}
                </h3>
                {openPhase.intro ? (
                  <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
                    {openPhase.intro}
                  </p>
                ) : null}
                {openPhase.state === "active" && view.focusLine ? (
                  <p className="mt-3 max-w-[68ch] border-l-2 border-[color:var(--ac)]/40 pl-3 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
                    {view.focusLine}
                  </p>
                ) : null}
                {openPhase.spoorNote ? (
                  <p className="mt-2 max-w-[68ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                    {openPhase.spoorNote}
                  </p>
                ) : null}
              </header>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                {renderPhaseBody(openPhase.id)}
              </div>
            </article>
          ) : null}

          {afterPhase}

          {footer}
        </div>
      </div>
    </>
  );
}

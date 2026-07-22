"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import type { QuestionId } from "@/data/intake-questions";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { trackEvent } from "@/lib/ga4";
import {
  buildPlanIntakeContext,
  computeCurrentPhaseId,
} from "@/lib/lifestyle-plan-eval";
import {
  startPatternLabel,
  type MovementStartPattern,
} from "@/lib/movement-prefs";
import type { DashboardModel } from "@/types/dashboard";
import type { PlanProgress } from "@/types/lifestyle-plan";

const HORIZON_LABEL: Record<string, string> = {
  "deze-week": "deze week",
  "week-2-4": "week 2–4",
  "week-4-12": "week 4–12",
};

type MovementRouteLadderProps = {
  model: DashboardModel;
  startPattern?: MovementStartPattern | null;
  onChangeStartPattern?: () => void;
  planProgressOverride?: PlanProgress | null;
  hidePlanDoorway?: boolean;
  onOpenPlan?: () => void;
};

function stepCircleClass(isNow: boolean, isPast: boolean): string {
  if (isNow) {
    return "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--ac)] text-[12px] font-bold text-[#0f1c10]";
  }
  if (isPast) {
    return "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--ac)]/50 text-[12px] font-semibold text-[color:var(--ac)]";
  }
  return "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[12px] font-semibold text-[#7E8C82]";
}

/**
 * Read-only weergave op de bestaande plan-horizonten (movementPlanTemplate).
 * Huidige fase licht op; geen afvink-oppervlak (roadmap: GÉÉN tweede dag-waarheid).
 * Mobiel = verticale ladder; lg = horizontale stepper.
 */
export default function MovementRouteLadder({
  model,
  startPattern = null,
  onChangeStartPattern,
  planProgressOverride,
  hidePlanDoorway = false,
  onOpenPlan,
}: MovementRouteLadderProps) {
  const phases = movementPlanTemplate.phases;
  const ctx = buildPlanIntakeContext(
    model.domainScores,
    (model.answers ?? {}) as Record<QuestionId, number>,
    "movement",
  );
  const progress =
    planProgressOverride ?? model.movementPlanProgress ?? model.planProgress;
  const phaseStepStates = Object.fromEntries(
    Object.entries(progress?.steps ?? {}).map(([id, entry]) => [
      id,
      { state: entry.state },
    ]),
  );
  const currentPhaseId =
    progress?.currentPhaseId ??
    computeCurrentPhaseId(phases, ctx, phaseStepStates);
  const currentIndex = phases.findIndex((phase) => phase.id === currentPhaseId);
  const lastIndex = phases.length - 1;

  return (
    <section aria-label="Jouw route" className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
        Jouw route
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Je bouwt in fases, niet in één sprong. Dit is waar je nu staat en wat er
        straks komt.
      </p>

      {/* Mobiel: verticale ladder */}
      <ol className="mt-4 flex flex-col gap-2 lg:hidden">
        {phases.map((phase, index) => {
          const isNow = index === currentIndex;
          const isPast = currentIndex > -1 && index < currentIndex;
          return (
            <li
              key={phase.id}
              className={
                isNow
                  ? "rounded-xl border border-[color:var(--ac)]/50 bg-[color:var(--ac)]/10 px-3.5 py-3"
                  : "rounded-xl border border-white/[0.06] px-3.5 py-3"
              }
            >
              <div className="flex items-center gap-3">
                <span className={stepCircleClass(isNow, isPast)} aria-hidden>
                  {isPast ? <Icons.Check s={13} /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      isNow
                        ? "font-serif text-[16px] leading-snug text-[#F1EFE8] text-pretty"
                        : "font-serif text-[15px] leading-snug text-[#9FB0A6] text-pretty"
                    }
                  >
                    {phase.title}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-[#7E8C82]">
                    {HORIZON_LABEL[phase.horizon] ?? phase.horizon}
                  </p>
                </div>
                {isNow ? (
                  <span className="shrink-0 rounded-full bg-[color:var(--ac)]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--ac)]">
                    Nu
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* lg: horizontale stepper */}
      <ol className="mt-5 hidden lg:flex lg:items-start">
        {phases.map((phase, index) => {
          const isNow = index === currentIndex;
          const isPast = currentIndex > -1 && index < currentIndex;
          const leftReached = currentIndex > -1 && index <= currentIndex;
          const rightReached = currentIndex > -1 && index < currentIndex;
          return (
            <li key={phase.id} className="flex-1">
              <div className="flex items-center">
                <span
                  aria-hidden
                  className={
                    index === 0
                      ? "h-px flex-1 bg-transparent"
                      : leftReached
                        ? "h-px flex-1 bg-[color:var(--ac)]/50"
                        : "h-px flex-1 bg-white/15"
                  }
                />
                <span className={stepCircleClass(isNow, isPast)} aria-hidden>
                  {isPast ? <Icons.Check s={13} /> : index + 1}
                </span>
                <span
                  aria-hidden
                  className={
                    index === lastIndex
                      ? "h-px flex-1 bg-transparent"
                      : rightReached
                        ? "h-px flex-1 bg-[color:var(--ac)]/50"
                        : "h-px flex-1 bg-white/15"
                  }
                />
              </div>
              <div className="mt-2 px-2 text-center">
                <p
                  className={
                    isNow
                      ? "font-serif text-[15px] leading-snug text-[#F1EFE8] text-pretty"
                      : "font-serif text-[14px] leading-snug text-[#9FB0A6] text-pretty"
                  }
                >
                  {phase.title}
                </p>
                {isNow ? (
                  <span className="mt-1.5 inline-block rounded-full bg-[color:var(--ac)]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--ac)]">
                    Nu
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {!hidePlanDoorway ? (
          onOpenPlan ? (
            <button
              type="button"
              onClick={() => {
                trackEvent("dashboard_beweging_plan_click", {
                  surface: "kompas_beweging",
                  nav_mode: "dashboard_view",
                });
                onOpenPlan();
              }}
              className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[color:var(--ac)]"
            >
              Bekijk je volledige stappenplan <Icons.ArrowRight s={14} />
            </button>
          ) : (
            <Link
              href="/intake/plan/movement?from=dashboard&kompas=beweging"
              onClick={() => {
                trackEvent("dashboard_beweging_plan_click", {
                  surface: "kompas_beweging",
                  nav_mode: "cross_route",
                });
              }}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--ac)] no-underline"
            >
              Bekijk je volledige stappenplan <Icons.ArrowRight s={14} />
            </Link>
          )
        ) : null}
        {onChangeStartPattern ? (
          <button
            type="button"
            onClick={onChangeStartPattern}
            className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-medium text-[#9FB0A6]"
          >
            {startPattern
              ? `Startpatroon: ${startPatternLabel(startPattern)} · wijzig`
              : "Kies je startpatroon"}
          </button>
        ) : null}
      </div>
    </section>
  );
}

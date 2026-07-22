"use client";

import Link from "next/link";
import MovementPlanDeepBody from "@/components/dashboard/beweging/MovementPlanDeepBody";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { PILLAR } from "@/data/dashboard";
import type { DomainScores } from "@/lib/intake-engine";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";

type MovementPlanConfiguratorProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  sessionId: string | null;
  navMode?: "dashboard_view" | "intake_route";
};

/** Standalone intake-route wrapper (account-users redirect naar dashboard embed). */
export default function MovementPlanConfigurator({
  scores,
  answers,
  sessionId,
  navMode = "intake_route",
}: MovementPlanConfiguratorProps) {
  const accent = PILLAR.beweging.color;

  return (
    <div className="ps-dark ps-cockpit-breakout mx-auto w-full max-w-5xl px-4 pb-12 pt-2 sm:px-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Jouw stappenplan · beweging
          </p>
          <h1 className="font-serif text-[26px] font-normal leading-tight text-[#F1EFE8]">
            {movementPlanTemplate.title}
          </h1>
        </div>
        <Link
          href={buildDashboardVandaagHref("beweging")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-medium text-[#CDD7D0] no-underline hover:border-white/25"
        >
          ← Dashboard
        </Link>
      </header>

      <CockpitShell accent={accent} ariaLabel="Jouw beweegplan">
        <p className="text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {movementPlanTemplate.recognition.body}
        </p>
      </CockpitShell>

      <div className="mt-4">
        <MovementPlanDeepBody
          scores={scores}
          answers={answers}
          sessionId={sessionId}
          navMode={navMode}
        />
      </div>
    </div>
  );
}

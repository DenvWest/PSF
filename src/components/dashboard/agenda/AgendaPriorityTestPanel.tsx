"use client";

import { useMemo } from "react";
import { PILLARS } from "@/data/dashboard";
import { isInterventionDomain } from "@/lib/domain-role";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { buildPlanStepBlock } from "@/lib/agenda-timeline";
import { postPrioritySelection } from "@/lib/priority-pref-client";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

type AgendaPriorityTestPanelProps = {
  model: DashboardModel;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
};

export default function AgendaPriorityTestPanel({
  model,
  onPrefUpdated,
}: AgendaPriorityTestPanelProps) {
  const enabled = process.env.NEXT_PUBLIC_AGENDA_TEST_SCREEN === "1";

  const todaySlot = useMemo(() => {
    const slots = buildWeekSchedulePreview(model);
    return slots.find((slot) => slot.isToday) ?? slots[0];
  }, [model]);

  const analysisVisible = useMemo(() => {
    return buildPlanStepBlock(model, todaySlot) != null;
  }, [model, todaySlot]);

  if (!enabled) {
    return null;
  }

  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));

  const setFocus = async (pillarId: PillarId) => {
    const pref = await postPrioritySelection({
      pillarId,
      source: "user_selected",
      surface: "agenda_test_screen",
      timeBucket: model.timeBucket,
      scheduledTime: model.scheduledTime,
    });
    onPrefUpdated(pref);
  };

  return (
    <section className="mb-4 mt-4 rounded-[14px] border border-dashed border-white/20 bg-black/20 p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
        Test-screening agenda-sync
      </p>
      <dl className="m-0 grid gap-1 text-[12px] text-[#CDD7D0]">
        <div className="flex justify-between gap-3">
          <dt>Engine</dt>
          <dd className="m-0">{model.enginePriority.label}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Effectief</dt>
          <dd className="m-0">{model.priority.label}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Verberg-datum</dt>
          <dd className="m-0">{model.planStepDismissedDate ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Plan-stappen uit</dt>
          <dd className="m-0">{model.planStepsHidden ? "ja" : "nee"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Analyse zichtbaar</dt>
          <dd className="m-0">{analysisVisible ? "ja" : "nee"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Verwachte titel</dt>
          <dd className="m-0 text-right">{model.activeHabit?.title ?? todaySlot.title}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        {interventionPillars.map((pillar) => (
          <button
            key={pillar.id}
            type="button"
            onClick={() => void setFocus(pillar.id)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12px] font-medium text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            Focus → {pillar.label}
          </button>
        ))}
      </div>
    </section>
  );
}

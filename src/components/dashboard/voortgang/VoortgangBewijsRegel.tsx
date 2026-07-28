"use client";

import { useEffect, useRef } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { buildVoortgangBewijsRegel } from "@/lib/voortgang-bewijs-copy";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type VoortgangBewijsRegelProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
};

export default function VoortgangBewijsRegel({
  model,
  data,
  onGoAgenda,
}: VoortgangBewijsRegelProps) {
  const trackedStateRef = useRef<string | null>(null);

  const activeDays = data?.cycleEvidence?.activeDays ?? null;
  const cycleDay = data?.cycleEvidence?.cycleDay ?? null;
  const daysUntilRemeasure =
    data?.cycleEvidence?.daysUntilRemeasure ?? data?.remeasure?.daysUntil ?? null;

  const regel = buildVoortgangBewijsRegel({
    activeDays,
    cycleDay,
    daysUntilRemeasure,
    focusLabel: model.priority.label,
    focusDelta: model.deltaOf(model.priority.id),
  });

  useEffect(() => {
    if (trackedStateRef.current === regel.state) {
      return;
    }
    trackedStateRef.current = regel.state;
    trackEvent("dashboard_voortgang_bewijs_state", {
      state: regel.state,
      ...(cycleDay != null ? { cycle_day: cycleDay } : {}),
      ...(activeDays != null ? { active_days: activeDays } : {}),
    });
    clarityTag("dashboard_voortgang", `bewijs_${regel.state}`);
  }, [regel.state, cycleDay, activeDays]);

  return (
    <CockpitTile eyebrow="Bewijs" className="mb-3.5">
      <p
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--text)",
          textWrap: "pretty",
        }}
      >
        {regel.line}
      </p>
      {regel.state === "dun" && regel.ctaLabel ? (
        <button
          type="button"
          onClick={onGoAgenda}
          className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold text-[#5A8F6A]"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          {regel.ctaLabel}
          <Icons.ArrowRight s={13} />
        </button>
      ) : null}
    </CockpitTile>
  );
}

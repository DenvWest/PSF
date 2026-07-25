"use client";

import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { getReadoutPresentation } from "@/lib/dashboard-readout";
import { isReadoutDomain } from "@/lib/domain-role";
import type { DashboardModel, PillarId } from "@/types/dashboard";

function formatDriverLabels(labels: string[]): string {
  const lower = labels.map((entry) => entry.toLowerCase());
  if (lower.length <= 1) {
    return lower.join("");
  }
  return `${lower.slice(0, -1).join(", ")} en ${lower[lower.length - 1]}`;
}

type KompasReadoutSectionProps = {
  model: DashboardModel;
  onOpenDomain: (domain: PillarId) => void;
};

export default function KompasReadoutSection({
  model,
  onOpenDomain,
}: KompasReadoutSectionProps) {
  const readoutRows = model.ladder.filter((pillar) => isReadoutDomain(pillar.id));

  if (readoutRows.length === 0) {
    return null;
  }

  return (
    <CockpitTile eyebrow="Rapport">
      <h2
        className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Volgt uit je gedrag
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Energie en herstel zijn readouts — geen apart plan, wel een spiegel van je
        leefstijl.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {readoutRows.map((pillar) => {
          const presentation = getReadoutPresentation(
            pillar.id as "energie" | "herstel",
          );
          const primaryCta = presentation.primaryCta;
          return (
            <div
              key={pillar.id}
              className="rounded-xl border border-white/8 bg-black/15 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-[15px] text-[#CDD7D0]">
                  {pillar.label}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
                  Rapport
                </span>
              </div>
              {presentation.driverLabels.length > 0 ? (
                <p className="mt-1.5 text-[13px] leading-snug text-[#9FB0A6] text-pretty">
                  Volgt uit je {formatDriverLabels(presentation.driverLabels)}.
                </p>
              ) : null}
              {primaryCta ? (
                <button
                  type="button"
                  onClick={() => onOpenDomain(primaryCta.pillarId)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[#5A8F6A]"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Werk aan je {primaryCta.label.toLowerCase()} →
                </button>
              ) : null}
              <p className="mt-1 text-[12px] tabular-nums text-[#7E8C82]">
                Score {model.scores[pillar.id] ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </CockpitTile>
  );
}

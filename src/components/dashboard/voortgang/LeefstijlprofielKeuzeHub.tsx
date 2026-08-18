"use client";

import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import MetingenCard from "@/components/dashboard/MetingenCard";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { PILLAR } from "@/data/dashboard";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type LeefstijlprofielKeuzeHubProps = {
  model: DashboardModel;
  onBack: () => void;
  onOpenDomain: (domain: PillarId) => void;
};

function VoortgangSubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Terug"
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--panel-border)",
          color: "var(--text-muted)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
      </button>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text)",
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default function LeefstijlprofielKeuzeHub({
  model,
  onBack,
  onOpenDomain,
}: LeefstijlprofielKeuzeHubProps) {
  const { items } = useVoortgangFavorites();

  return (
    <section aria-label="Leefstijlprofiel" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Leefstijlprofiel" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <VoortgangSectionHeader
            eyebrow="Leefstijlkeuze"
            title="Wat past bij je check"
            body="Per domein zie je wat wij afleiden en wat jij zelf kiest — met supplementen, producten en diensten waar dat past."
          />
          <ul className="m-0 mt-3 list-none p-0" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {KOMPAS_RAIL_PILLAR_IDS.map((domain) => {
              const pillar = PILLAR[domain];
              const savedCount = items.filter((item) => item.domain === domain).length;
              const score = model.scores[domain] ?? 0;

              return (
                <li key={domain}>
                  <button
                    type="button"
                    onClick={() => onOpenDomain(domain)}
                    className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
                  >
                    <CockpitTile>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums"
                          style={{
                            background: `${pillar.color}22`,
                            color: pillar.color,
                            border: `1px solid ${pillar.color}44`,
                          }}
                        >
                          {score}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-serif text-[17px] text-[var(--text)]">{pillar.label}</div>
                          <p className="m-0 mt-0.5 text-[13px] text-[var(--text-muted)]">
                            {domain === "beweging"
                              ? "Aanbevolen acties en schap — blauwdruk live"
                              : "Leefstijlkeuze volgt — beweging is de blauwdruk"}
                            {savedCount > 0 ? ` · ${savedCount} opgeslagen` : ""}
                          </p>
                        </div>
                        <Icons.ChevronRight s={18} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                      </div>
                    </CockpitTile>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <MetingenCard scores={model.scores} history={model.history} />
      </div>
    </section>
  );
}

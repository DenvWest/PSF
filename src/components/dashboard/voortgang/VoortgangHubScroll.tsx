"use client";

import MetingenCard from "@/components/dashboard/MetingenCard";
import VoortgangDomeinRing from "@/components/dashboard/voortgang/VoortgangDomeinRing";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import VoortgangLogboekSection from "@/components/dashboard/voortgang/VoortgangLogboekSection";
import VoortgangRichtingBeat from "@/components/dashboard/voortgang/VoortgangRichtingBeat";
import VoortgangRouteList from "@/components/dashboard/voortgang/VoortgangRouteList";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
  onOpenDomain: (domain: PillarId) => void;
  onOpenStatistieken: () => void;
  onOpenFavorieten: () => void;
  onOpenInzichten: () => void;
  onOpenLichaamssamenstelling: () => void;
};

export default function VoortgangHubScroll({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
  onOpenDomain,
  onOpenStatistieken,
  onOpenFavorieten,
  onOpenInzichten,
  onOpenLichaamssamenstelling,
}: VoortgangHubScrollProps) {
  return (
    <>
      <VoortgangHero
        model={model}
        data={data}
        onGoAgenda={onGoAgenda}
        onGoHermeting={onGoHermeting}
      />

      <div className="mt-3.5">
        <VoortgangDomeinRing
          model={model}
          data={data}
          onOpenDomain={onOpenDomain}
        />
      </div>

      <VoortgangRichtingBeat model={model} onOpenInzichten={onOpenInzichten} />

      <div className="mb-5 mt-2">
        <h2
          className="mb-3 font-serif text-[18px] leading-[1.3] text-[var(--text)]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je meetreeks
        </h2>
        <div className="flex flex-col gap-2.5">
          <MetingenCard scores={model.scores} history={model.history} />
          <VoortgangLogboekSection model={model} />
        </div>
      </div>

      <div className="mb-5">
        <VoortgangRouteList
          onOpenStatistieken={onOpenStatistieken}
          onOpenFavorieten={onOpenFavorieten}
          onOpenInzichten={onOpenInzichten}
          onOpenLichaamssamenstelling={onOpenLichaamssamenstelling}
        />
      </div>
    </>
  );
}

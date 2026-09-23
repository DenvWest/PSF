"use client";

import PatroonScherm from "@/components/dashboard/patroon/PatroonScherm";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

export default function VoortgangHubScroll({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
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
        <PatroonScherm />
      </div>
    </>
  );
}

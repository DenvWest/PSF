"use client";

import { useRouter } from "next/navigation";
import KompasOndersteuningTile from "@/components/dashboard/kompas/KompasOndersteuningTile";
import KompasReadoutSection from "@/components/dashboard/kompas/KompasReadoutSection";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangKompasPanelsProps = {
  model: DashboardModel;
  data?: DashboardData;
};

export default function VoortgangKompasPanels({
  model,
  data,
}: VoortgangKompasPanelsProps) {
  const router = useRouter();

  const openDomain = (domain: PillarId) => {
    router.push(buildDashboardVandaagHref(domain));
  };

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <KompasReadoutSection model={model} onOpenDomain={openDomain} surface="voortgang" />
      <KompasOndersteuningTile model={model} data={data} surface="voortgang" />
    </div>
  );
}

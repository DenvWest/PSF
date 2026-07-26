"use client";

import { useRouter } from "next/navigation";
import KompasOndersteuningTile from "@/components/dashboard/kompas/KompasOndersteuningTile";
import KompasReadoutSection from "@/components/dashboard/kompas/KompasReadoutSection";
import KompasVoortgangFocusBlock from "@/components/dashboard/kompas/KompasVoortgangFocusBlock";
import {
  buildDashboardBewegingStappenplanHref,
  buildDashboardVandaagHref,
  supportsKompasDeepView,
} from "@/lib/dashboard-url";
import type { AccountPriorityPrefData, DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangKompasPanelsProps = {
  model: DashboardModel;
  data?: DashboardData;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
};

export default function VoortgangKompasPanels({
  model,
  data,
  onPrefUpdated,
}: VoortgangKompasPanelsProps) {
  const router = useRouter();

  const openDomain = (domain: PillarId) => {
    if (supportsKompasDeepView(domain)) {
      router.push(buildDashboardBewegingStappenplanHref());
      return;
    }
    router.push(buildDashboardVandaagHref(domain));
  };

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <KompasVoortgangFocusBlock
        model={model}
        onPrefUpdated={onPrefUpdated}
        onOpenPriority={openDomain}
        surface="kompas_voortgang_tab"
        showHeader={false}
      />
      <KompasReadoutSection model={model} onOpenDomain={openDomain} surface="voortgang" />
      <KompasOndersteuningTile model={model} data={data} surface="voortgang" />
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import type {
  DashboardData,
  DashboardModel,
  DashboardTabId,
  VoortgangScreen,
} from "@/types/dashboard";

export type { VoortgangScreen };

type VoortgangHubProps = {
  model: DashboardModel | null;
  data?: DashboardData;
  tab: DashboardTabId;
  screen: VoortgangScreen;
  /**
   * Het hermeting-scherm. Komt als slot binnen omdat de secties (`retest`,
   * `future`) in `Dashboard.tsx` wonen en daar hun data al krijgen — tot 27
   * augustus als eigen tabblad, sindsdien als scherm binnen Voortgang.
   */
  hermetingSlot: ReactNode;
  onScreenChange: (screen: VoortgangScreen) => void;
  onGoAgenda: () => void;
};

function VoortgangHubInner({
  model,
  data,
  tab,
  screen,
  hermetingSlot,
  onScreenChange,
  onGoAgenda,
}: Omit<VoortgangHubProps, "onPrefUpdated">) {
  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const goBack = () => {
    onScreenChange("hub");
  };

  let content: ReactNode;

  if (screen === "hermeting") {
    content = (
      <section aria-label="Hermeting" className="pt-4">
        <VoortgangTerugLink onBack={goBack} />
        <VoortgangSectionHeader eyebrow="Hermeting" title="Meet of het werkt." />
        {hermetingSlot}
      </section>
    );
  } else {
    content = (
      <section aria-label="Je patroon">
        <VoortgangHubScroll
          model={model!}
          data={data}
          onGoAgenda={onGoAgenda}
          onGoHermeting={() => onScreenChange("hermeting")}
        />
      </section>
    );
  }

  // De navigatie zelf woont buiten dit scherm: op md+ in de linker rail, en
  // onder md als inklapbare balk in de sticky header (VoortgangTopNav).
  return <div className="flex min-h-full flex-col">{content}</div>;
}

export default function VoortgangHub(props: VoortgangHubProps) {
  if (!props.model) {
    return null;
  }

  return <VoortgangHubInner {...props} />;
}

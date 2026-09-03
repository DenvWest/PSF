"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import LeefstijlprofielDomeinScherm from "@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import { clarityTag } from "@/lib/clarity";
import {
  type SyncDashboardVoortgangOptions,
  type VoedingLaagSlug,
  voedingLaagIdFromSlug,
  voedingLaagSlugFromId,
} from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type {
  AccountPriorityPrefData,
  DashboardData,
  DashboardModel,
  DashboardTabId,
  PillarId,
  VoortgangScreen,
} from "@/types/dashboard";

export type { VoortgangScreen };

type VoortgangHubProps = {
  model: DashboardModel | null;
  data?: DashboardData;
  tab: DashboardTabId;
  screen: VoortgangScreen;
  leefstijlprofielDomein: PillarId | null;
  voedingLaag?: VoedingLaagSlug | null;
  /**
   * Het hermeting-scherm. Komt als slot binnen omdat de secties (`retest`,
   * `future`) in `Dashboard.tsx` wonen en daar hun data al krijgen — tot 27
   * augustus als eigen tabblad, sindsdien als scherm binnen Voortgang.
   */
  hermetingSlot: ReactNode;
  onScreenChange: (screen: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoAgenda: () => void;
  /** Naar de Keuze-tab: het aanbod van dít domein. */
  onGoKeuze: (domain: PillarId) => void;
};

function VoortgangHubInner({
  model,
  data,
  tab,
  screen,
  leefstijlprofielDomein,
  voedingLaag = null,
  hermetingSlot,
  onScreenChange,
  onGoAgenda,
  onGoKeuze,
}: Omit<VoortgangHubProps, "onPrefUpdated">) {
  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const navigate = (next: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => {
    onScreenChange(next, options);
  };

  const goBack = () => {
    trackEvent("dashboard_voortgang_terug", { from: screen });
    navigate("hub");
  };

  const openLeefstijlprofielDomein = (domain: PillarId) => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "leefstijlprofiel",
      domain,
    });
    clarityTag("dashboard_voortgang", `leefstijlprofiel_${domain}`);
    navigate("leefstijlprofiel", { fav: domain, laag: null });
  };

  let content: ReactNode;

  if ((screen === "leefstijlprofiel" || screen === "domein") && leefstijlprofielDomein) {
    // Het echte scherm, niet de prebuild (19 aug). Aanbeveling en Mijn keuze
    // zitten sinds deze slice ín de ladder, per laag, en die draait op
    // `account_favorites` — dat kan een same-origin iframe niet leveren.
    // Bestand A (leefstijlprofiel-domein-keuze-prebuild-v3) blijft de bron
    // voor de vorm; docs/design is waar je hem leest.
    content = (
      <LeefstijlprofielDomeinScherm
        model={model!}
        data={data}
        domain={leefstijlprofielDomein}
        urlLayer={
          leefstijlprofielDomein === "voeding" && voedingLaag
            ? voedingLaagIdFromSlug(voedingLaag)
            : null
        }
        onUrlLayerChange={
          leefstijlprofielDomein === "voeding"
            ? (layer) => {
                navigate("leefstijlprofiel", {
                  fav: "voeding",
                  laag: layer == null ? null : voedingLaagSlugFromId(layer),
                });
              }
            : undefined
        }
        onBack={goBack}
        onOpenSchap={onGoKeuze}
      />
    );
  } else if (screen === "leefstijlprofiel" || screen === "inzichten") {
    content = (
      <LeefstijlprofielKeuzeHub
        data={data}
        onBack={goBack}
        onOpenDomain={openLeefstijlprofielDomein}
      />
    );
  } else if (screen === "hermeting") {
    content = (
      <section aria-label="Hermeting" className="pt-4">
        <VoortgangTerugLink onBack={goBack} />
        <VoortgangSectionHeader eyebrow="Hermeting" title="Meet of het werkt." />
        {hermetingSlot}
      </section>
    );
  } else {
    content = (
      <section aria-label="Voortgang navigatie">
        <VoortgangHubScroll
          model={model!}
          data={data}
          onGoAgenda={onGoAgenda}
          onGoHermeting={() => navigate("hermeting")}
          onOpenDomain={(domain: PillarId) => {
            openLeefstijlprofielDomein(domain);
          }}
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

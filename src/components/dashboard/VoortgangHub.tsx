"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import LeefstijlprofielDomeinView from "@/components/dashboard/voortgang/LeefstijlprofielDomeinView";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import FavorietenView from "@/components/dashboard/voortgang/FavorietenView";
import VoortgangMobileNav from "@/components/dashboard/voortgang/VoortgangMobileNav";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { buildDashboardVandaagHref, type SyncDashboardVoortgangOptions } from "@/lib/dashboard-url";
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
  favorietenDomein: PillarId | null;
  leefstijlprofielAdviesExtra: ReactNode;
  overTijdExtra: ReactNode;
  onScreenChange: (screen: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

function VoortgangHubInner({
  model,
  data,
  tab,
  screen,
  leefstijlprofielDomein,
  leefstijlprofielAdviesExtra,
  overTijdExtra,
  onScreenChange,
  onGoAgenda,
  onGoHermeting,
}: Omit<VoortgangHubProps, "onPrefUpdated" | "favorietenDomein">) {
  const router = useRouter();
  const { items: favorietenItems } = useVoortgangFavorites();

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
    if (
      screen === "leefstijlprofiel" ||
      screen === "favorieten" ||
      screen === "inzichten" ||
      screen === "domein"
    ) {
      navigate("hub");
    }
  };

  const openLeefstijlprofielRoot = () => {
    trackEvent("dashboard_voortgang_hub_click", { destination: "leefstijlprofiel" });
    clarityTag("dashboard_voortgang", "leefstijlprofiel");
    navigate("leefstijlprofiel", { fav: null });
  };

  const openLeefstijlprofielDomein = (domain: PillarId) => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "leefstijlprofiel",
      domain,
    });
    clarityTag("dashboard_voortgang", `leefstijlprofiel_${domain}`);
    navigate("leefstijlprofiel", { fav: domain });
  };

  const openFavorieten = () => {
    trackEvent("dashboard_voortgang_hub_click", { destination: "favorieten" });
    clarityTag("dashboard_voortgang", "favorieten");
    navigate("favorieten", { fav: null });
  };

  const mobileActiveDomein = screen === "leefstijlprofiel" ? leefstijlprofielDomein : null;

  let content: ReactNode;

  if (screen === "leefstijlprofiel" && leefstijlprofielDomein) {
    content = (
      <LeefstijlprofielDomeinView
        model={model!}
        data={data}
        domain={leefstijlprofielDomein}
        adviesExtra={leefstijlprofielAdviesExtra}
        onBack={goBack}
        onGoVandaag={() => router.push(buildDashboardVandaagHref(leefstijlprofielDomein))}
      />
    );
  } else if (screen === "leefstijlprofiel" || screen === "inzichten") {
    content = (
      <LeefstijlprofielKeuzeHub
        model={model!}
        onBack={goBack}
        onOpenDomain={openLeefstijlprofielDomein}
      />
    );
  } else if (screen === "favorieten") {
    content = <FavorietenView onBack={goBack} />;
  } else if (screen === "domein" && leefstijlprofielDomein) {
    content = (
      <LeefstijlprofielDomeinView
        model={model!}
        data={data}
        domain={leefstijlprofielDomein}
        adviesExtra={leefstijlprofielAdviesExtra}
        onBack={goBack}
        onGoVandaag={() => router.push(buildDashboardVandaagHref(leefstijlprofielDomein))}
      />
    );
  } else {
    content = (
      <section aria-label="Voortgang navigatie">
        <VoortgangHubScroll
          model={model!}
          data={data}
          overTijdExtra={overTijdExtra}
          onGoAgenda={onGoAgenda}
          onGoHermeting={onGoHermeting}
          onOpenDomain={(domain: PillarId) => {
            openLeefstijlprofielDomein(domain);
          }}
          onScrollToOverTijd={() => {
            document.getElementById("voortgang-over-tijd")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />
      </section>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {screen !== "hub" ? (
        <VoortgangMobileNav
          screen={screen}
          activeDomein={mobileActiveDomein}
          favorietenCount={favorietenItems.length}
          onOpenLeefstijlprofiel={openLeefstijlprofielRoot}
          onOpenFavorieten={openFavorieten}
          onOpenDomein={openLeefstijlprofielDomein}
        />
      ) : (
        <VoortgangMobileNav
          screen={screen}
          activeDomein={null}
          favorietenCount={favorietenItems.length}
          onOpenLeefstijlprofiel={openLeefstijlprofielRoot}
          onOpenFavorieten={openFavorieten}
          onOpenDomein={openLeefstijlprofielDomein}
        />
      )}
      <div className="flex-1">{content}</div>
    </div>
  );
}

export default function VoortgangHub(props: VoortgangHubProps) {
  if (!props.model) {
    return null;
  }

  return <VoortgangHubInner {...props} />;
}

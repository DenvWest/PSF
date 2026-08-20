"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import PrebuildFrame from "@/components/dashboard/PrebuildFrame";
import LeefstijlprofielDomeinScherm from "@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import FavorietenView from "@/components/dashboard/voortgang/FavorietenView";
import VoortgangMobileNav from "@/components/dashboard/voortgang/VoortgangMobileNav";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { clarityTag } from "@/lib/clarity";
import { hasSchap, resolveSchapDomain } from "@/lib/schap-availability";
import { trackEvent } from "@/lib/ga4";
import { buildDashboardVandaagHref, type SyncDashboardVoortgangOptions } from "@/lib/dashboard-url";
import type {
  AccountPriorityPrefData,
  DashboardData,
  DashboardModel,
  DashboardTabId,
  PillarId,
  SchapTabId,
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
  /** Actieve sub-tab op het schap — alleen betekenisvol op screen=favorieten met domain="beweging". */
  favorietenSchapTab: SchapTabId | null;
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
  favorietenDomein,
  favorietenSchapTab,
  leefstijlprofielAdviesExtra,
  overTijdExtra,
  onScreenChange,
  onGoAgenda,
  onGoHermeting,
}: Omit<VoortgangHubProps, "onPrefUpdated">) {
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

  // Eén Favorieten (19 aug). De rail landde hier op `fav: null` en dus op
  // FavorietenView; beide entry points draaien nu op `resolveSchapDomain`.
  const openFavorieten = () => {
    const target =
      resolveSchapDomain(favorietenDomein) ?? resolveSchapDomain(model?.priority.id);
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "favorieten",
      ...(target ? { domain: target } : {}),
    });
    clarityTag("dashboard_voortgang", target ? `favorieten_${target}` : "favorieten");
    navigate("favorieten", { fav: target });
  };

  const mobileActiveDomein =
    screen === "leefstijlprofiel" || screen === "domein" ? leefstijlprofielDomein : null;

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
        adviesExtra={leefstijlprofielAdviesExtra}
        onBack={goBack}
        onGoVandaag={() => router.push(buildDashboardVandaagHref(leefstijlprofielDomein))}
        onOpenSchap={(target) => {
          navigate("favorieten", { fav: resolveSchapDomain(target) });
        }}
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
  } else if (screen === "favorieten" && favorietenDomein && hasSchap(favorietenDomein)) {
    // Bestand B letterlijk (favorieten-schap-prebuild-v3): vier
    // sub-oppervlakken, nooit tegelijk zichtbaar.
    content = (
      <PrebuildFrame
        src={`favorieten-schap-v3.html?schaptab=${favorietenSchapTab ?? "producten"}&domein=${favorietenDomein}`}
        title="Favorieten — het schap"
      />
    );
  } else if (screen === "favorieten") {
    content = <FavorietenView onBack={goBack} />;
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
      <VoortgangMobileNav
        screen={screen}
        activeDomein={mobileActiveDomein}
        favorietenCount={favorietenItems.length}
        onOpenLeefstijlprofiel={openLeefstijlprofielRoot}
        onOpenFavorieten={openFavorieten}
        onOpenDomein={openLeefstijlprofielDomein}
      />
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

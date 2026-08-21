"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import LeefstijlprofielDomeinScherm from "@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import FavorietenView from "@/components/dashboard/voortgang/FavorietenView";
import SchapView from "@/components/dashboard/voortgang/SchapView";
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
  /** Het domein waarvan het schap open staat — alleen betekenisvol op screen=schap. */
  schapDomein: PillarId | null;
  /** Actieve sub-tab op het schap — alleen betekenisvol op screen=schap. */
  schapTab: SchapTabId | null;
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
  schapDomein,
  schapTab,
  leefstijlprofielAdviesExtra,
  overTijdExtra,
  onScreenChange,
  onGoAgenda,
  onGoHermeting,
}: Omit<VoortgangHubProps, "onPrefUpdated">) {
  const router = useRouter();
  const { items: favorietenItems } = useVoortgangFavorites();
  const [schapTabOverride, setSchapTabOverride] = useState<
    { domain: PillarId | null; tab: SchapTabId } | null
  >(null);

  useEffect(() => {
    if (tab !== "voortgang") {
      onScreenChange("hub");
    }
  }, [tab, onScreenChange]);

  const navigate = (next: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => {
    onScreenChange(next, options);
  };

  // De URL is de bron bij binnenkomst; daarna wint de klik. `pushState` uit
  // het sync-pad werkt `useSearchParams` niet bij, dus de gekozen tab leeft
  // hier — met zijn domein erbij, zodat hij bij een domeinwissel vanzelf
  // vervalt in plaats van mee te reizen.
  const activeSchapTab =
    schapTabOverride && schapTabOverride.domain === schapDomein
      ? schapTabOverride.tab
      : schapTab;

  const handleSchapTabChange = (next: SchapTabId) => {
    setSchapTabOverride({ domain: schapDomein, tab: next });
    navigate("schap", { fav: schapDomein, schap: next });
  };

  const goBack = () => {
    trackEvent("dashboard_voortgang_terug", { from: screen });
    if (
      screen === "leefstijlprofiel" ||
      screen === "favorieten" ||
      screen === "schap" ||
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

  /**
   * Favorieten is wat jij bewaarde — één scherm, domein-overstijgend, altijd
   * hetzelfde. Tot 20 augustus leidde deze knop naar het schap zodra er
   * toevallig een domein in de URL stond, waardoor het telbadge ernaast een
   * lijst beloofde die je nooit te zien kreeg. Het domein hoort hier niet:
   * daarvoor is `openSchap`.
   */
  const openFavorieten = () => {
    trackEvent("dashboard_voortgang_hub_click", { destination: "favorieten" });
    clarityTag("dashboard_voortgang", "favorieten");
    navigate("favorieten", { fav: null });
  };

  /** Het aanbod van één domein. Bestaat niet zonder domein mét schap. */
  const openSchap = (domain: PillarId | null) => {
    const target = resolveSchapDomain(domain) ?? resolveSchapDomain(model?.priority.id);
    if (!target) {
      return;
    }
    trackEvent("dashboard_voortgang_hub_click", { destination: "schap", domain: target });
    clarityTag("dashboard_voortgang", `schap_${target}`);
    navigate("schap", { fav: target });
  };

  const mobileActiveDomein =
    screen === "leefstijlprofiel" || screen === "domein" ? leefstijlprofielDomein : null;

  /**
   * Welk schap de navigatie aanbiedt: het domein dat al open staat, anders dat
   * van je prioriteit. `null` betekent dat dit domein geen schap heeft — dan
   * staat het item er niet, in plaats van dat het ergens anders op uitkomt.
   */
  const railSchapDomein =
    resolveSchapDomain(schapDomein) ??
    resolveSchapDomain(leefstijlprofielDomein) ??
    resolveSchapDomain(model?.priority.id);

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
        onOpenSchap={openSchap}
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
  } else if (screen === "schap" && schapDomein && hasSchap(schapDomein)) {
    // Het schap in React (P3). De prebuild droeg beweeg-inhoud onder elke
    // domeinkop; `SchapView` volgt het domein en leest `account_favorites` —
    // dat kan een iframe niet. Bestand B (favorieten-schap-prebuild-v3)
    // blijft de bron voor de vorm.
    content = (
      <SchapView
        model={model!}
        data={data}
        domain={schapDomein}
        activeTab={activeSchapTab}
        onTabChange={handleSchapTabChange}
        onBack={goBack}
        onOpenLeefstijlprofiel={openLeefstijlprofielDomein}
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
        schapDomein={railSchapDomein}
        favorietenCount={favorietenItems.length}
        onOpenLeefstijlprofiel={openLeefstijlprofielRoot}
        onOpenSchap={() => openSchap(railSchapDomein)}
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

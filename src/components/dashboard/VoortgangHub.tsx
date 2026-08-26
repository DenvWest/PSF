"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import LeefstijlprofielDomeinScherm from "@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import SchapView from "@/components/dashboard/voortgang/SchapView";
import { clarityTag } from "@/lib/clarity";
import { hasSchap, resolveSchapDomain } from "@/lib/schap-availability";
import { resolveSchapTabForDomain } from "@/lib/schap-tabs";
import { trackEvent } from "@/lib/ga4";
import type { SyncDashboardVoortgangOptions } from "@/lib/dashboard-url";
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
  onScreenChange,
  onGoAgenda,
  onGoHermeting,
}: Omit<VoortgangHubProps, "onPrefUpdated">) {
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
      screen === "schap" ||
      screen === "inzichten" ||
      screen === "domein"
    ) {
      navigate("hub");
    }
  };

  const openLeefstijlprofielDomein = (domain: PillarId) => {
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "leefstijlprofiel",
      domain,
    });
    clarityTag("dashboard_voortgang", `leefstijlprofiel_${domain}`);
    navigate("leefstijlprofiel", { fav: domain });
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

  /**
   * Van schap naar schap, met je onderdeel mee. Anders wisselt de
   * domeinschakelaar stilletjes ook je tab, en dat leest als een fout: je
   * klikte op een domein, niet op Producten.
   */
  const switchSchapDomain = (target: PillarId) => {
    if (!hasSchap(target)) {
      return;
    }
    trackEvent("dashboard_voortgang_hub_click", {
      destination: "schap",
      domain: target,
      from: "schap",
    });
    const tab = resolveSchapTabForDomain(target, activeSchapTab);
    setSchapTabOverride({ domain: target, tab });
    navigate("schap", { fav: target, schap: tab });
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
        adviesExtra={
          leefstijlprofielDomein === "voeding" ? leefstijlprofielAdviesExtra : null
        }
        onBack={goBack}
        onOpenSchap={openSchap}
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
        onSwitchDomain={switchSchapDomain}
        onOpenLeefstijlprofiel={openLeefstijlprofielDomein}
      />
    );
  } else {
    content = (
      <section aria-label="Voortgang navigatie">
        <VoortgangHubScroll
          model={model!}
          data={data}
          onGoAgenda={onGoAgenda}
          onGoHermeting={onGoHermeting}
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

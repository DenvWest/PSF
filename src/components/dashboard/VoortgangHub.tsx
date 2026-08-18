"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import MetingenCard from "@/components/dashboard/MetingenCard";
import RecommendedInsights from "@/components/dashboard/RecommendedInsights";
import VoortgangHubScroll from "@/components/dashboard/voortgang/VoortgangHubScroll";
import VoortgangDomeinScreen from "@/components/dashboard/voortgang/VoortgangDomeinScreen";
import LeefstijlprofielView from "@/components/dashboard/voortgang/LeefstijlprofielView";
import VoortgangFavorietenFooter from "@/components/dashboard/voortgang/VoortgangFavorietenFooter";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import VitalityGauge from "@/components/app/VitalityGauge";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { getVitalityExplainer } from "@/lib/vitality-explainer";
import { getVitalityScoreCardCopy } from "@/lib/vitality-score-copy";
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
  voortgangDomein: PillarId | null;
  leefstijlprofielDomein: PillarId | null;
  leefstijlprofielAdviesExtra: ReactNode;
  overTijdExtra: ReactNode;
  onScreenChange: (screen: VoortgangScreen, options?: SyncDashboardVoortgangOptions) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
};

function VoortgangSubHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Terug"
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--panel-border)",
          color: "var(--text-muted)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
      </button>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text)",
        }}
      >
        {title}
      </div>
    </div>
  );
}

function InsightTips({ tips }: { tips: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {tips.map((tip) => (
        <CockpitTile key={tip}>
          <div
            style={{
              fontSize: 14,
              color: "var(--text)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {tip}
          </div>
        </CockpitTile>
      ))}
    </div>
  );
}

function VitaalscoreInzichtenView({
  model,
  firstName,
  onBack,
}: {
  model: DashboardModel;
  firstName: string | null;
  onBack: () => void;
}) {
  const cardCopy = getVitalityScoreCardCopy({
    firstName,
    vitality: model.vitality,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id],
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const explainer = getVitalityExplainer({
    vitality: model.vitality,
    vitalityDelta: model.vitalityDelta,
    vitalityDeltaComparable: model.vitalityDeltaNote == null,
    priorityId: model.priority.id,
    priorityScore: model.scores[model.priority.id],
    answers: model.answers,
    domainScores: model.domainScores,
  });
  const tipLines = [explainer[1], explainer[2]].filter(Boolean);

  return (
    <section aria-label="Jouw inzichten" style={{ paddingTop: 16 }}>
      <VoortgangSubHeader title="Jouw inzichten" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="vitaalscore-card__gauge-zone" style={{ marginInline: -8 }}>
          <VitalityGauge
            value={model.vitality}
            size={300}
            stroke={18}
            variant="hero"
            theme="light"
            tone="light"
            showBandLabel={false}
          />
        </div>

        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--f-serif)",
              fontSize: 24,
              fontWeight: 400,
              color: "var(--text)",
              lineHeight: 1.2,
            }}
          >
            {cardCopy.heading}
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {cardCopy.body}
          </p>
        </div>

        <InsightTips tips={tipLines} />

        <RecommendedInsights pillarId={model.priority.id} />

        <MetingenCard scores={model.scores} history={model.history} />
      </div>
    </section>
  );
}

export default function VoortgangHub({
  model,
  data,
  tab,
  screen,
  voortgangDomein,
  leefstijlprofielDomein,
  leefstijlprofielAdviesExtra,
  overTijdExtra,
  onScreenChange,
  onPrefUpdated: _onPrefUpdated,
  onGoAgenda,
  onGoHermeting,
}: VoortgangHubProps) {
  const router = useRouter();

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
    if (screen === "leefstijlprofiel" || screen === "inzichten" || screen === "domein") {
      navigate("hub");
    }
  };

  const openLeefstijlprofiel = (fav?: PillarId) => {
    trackEvent("dashboard_voortgang_hub_click", { destination: "leefstijlprofiel" });
    clarityTag("dashboard_voortgang", "leefstijlprofiel");
    navigate("leefstijlprofiel", fav ? { fav } : undefined);
  };

  if (!model) {
    return null;
  }

  let content: ReactNode;

  if (screen === "inzichten") {
    content = (
      <VitaalscoreInzichtenView
        model={model}
        firstName={data?.firstName ?? null}
        onBack={goBack}
      />
    );
  } else if (screen === "leefstijlprofiel") {
    content = (
      <LeefstijlprofielView
        model={model}
        data={data}
        scopedDomein={leefstijlprofielDomein}
        adviesExtra={leefstijlprofielAdviesExtra}
        onBack={goBack}
      />
    );
  } else if (screen === "domein" && voortgangDomein) {
    content = (
      <VoortgangDomeinScreen
        model={model}
        data={data}
        domain={voortgangDomein}
        onBack={goBack}
        onGoVandaag={() => router.push(buildDashboardVandaagHref(voortgangDomein))}
        onOpenLeefstijlprofiel={() => openLeefstijlprofiel(voortgangDomein)}
      />
    );
  } else {
    content = (
      <section aria-label="Voortgang navigatie">
        <VoortgangHubScroll
          model={model}
          data={data}
          overTijdExtra={overTijdExtra}
          onGoAgenda={onGoAgenda}
          onGoHermeting={onGoHermeting}
          onOpenDomain={(domain: PillarId) => {
            navigate("domein", { domein: domain });
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
    <VoortgangFavoritesProvider>
      <div className="flex min-h-full flex-col">
        <div className="flex-1">{content}</div>
        <VoortgangFavorietenFooter
          onOpenLeefstijlprofiel={(domain) => {
            openLeefstijlprofiel(domain as PillarId | undefined);
          }}
        />
      </div>
    </VoortgangFavoritesProvider>
  );
}

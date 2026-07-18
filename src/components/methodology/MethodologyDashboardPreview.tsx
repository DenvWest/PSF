"use client";

import { useState, type ReactNode } from "react";
import { DASHBOARD_UNLOCK_LOCKED_FEATURES } from "@/data/dashboard-unlock";
import { DASHBOARD_TABS } from "@/data/dashboard";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

type PreviewTabId = "vandaag" | "agenda" | "voortgang" | "hermeting";

const PREVIEW_TAB_IDS: PreviewTabId[] = ["vandaag", "agenda", "voortgang", "hermeting"];

const PREVIEW_TABS = DASHBOARD_TABS.filter((tab) =>
  PREVIEW_TAB_IDS.includes(tab.id as PreviewTabId),
);

const VOORTGANG_DETAIL = DASHBOARD_UNLOCK_LOCKED_FEATURES.find(
  (feature) => feature.tab === "Voortgang",
)?.detail;

const HERMETING_DETAIL = DASHBOARD_UNLOCK_LOCKED_FEATURES.find(
  (feature) => feature.tab === "Hermeting",
)?.detail;

function VandaagPanel() {
  const tab = PREVIEW_TABS.find((item) => item.id === "vandaag");

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c10] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        Vandaag
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{tab?.subtitle}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-2/5 rounded-full bg-ps-green" />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-stone-400">
        Slaap · Stress · Voeding · Beweging — scores op één scherm
      </p>
    </div>
  );
}

function VoortgangPanel() {
  const tab = PREVIEW_TABS.find((item) => item.id === "voortgang");

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c10] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        Voortgang
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{tab?.subtitle}</p>
      <p className="mt-3 text-xs leading-relaxed text-stone-400">
        Volg trends over tijd en scores per pijler — zodra je check-ins binnenkomen.
      </p>
      {VOORTGANG_DETAIL ? (
        <p className="mt-3 text-xs font-medium text-ps-green">{VOORTGANG_DETAIL}</p>
      ) : null}
    </div>
  );
}

function HermetingPanel() {
  const tab = PREVIEW_TABS.find((item) => item.id === "hermeting");

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c10] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        Hermeting
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{tab?.subtitle}</p>
      <p className="mt-3 text-xs leading-relaxed text-stone-400">
        Meet of patronen echt verschuiven — niet alleen hoe je je vandaag voelt.
      </p>
      {HERMETING_DETAIL ? (
        <p className="mt-3 text-xs font-medium text-ps-green">{HERMETING_DETAIL}</p>
      ) : null}
    </div>
  );
}

function AgendaPanel() {
  const tab = PREVIEW_TABS.find((item) => item.id === "agenda");

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c10] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        Agenda
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{tab?.subtitle}</p>
      <p className="mt-3 text-xs leading-relaxed text-stone-400">
        Weekoverzicht met je stap vandaag — afvinken, onderbouwing lezen, en vooruitkijken.
      </p>
    </div>
  );
}

const PANELS: Record<PreviewTabId, () => ReactNode> = {
  vandaag: VandaagPanel,
  agenda: AgendaPanel,
  voortgang: VoortgangPanel,
  hermeting: HermetingPanel,
};

export default function MethodologyDashboardPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>("vandaag");
  const ActivePanel = PANELS[activeTab];

  function handleTabClick(tabId: PreviewTabId) {
    setActiveTab(tabId);
    trackEvent(GA4_EVENTS.METHODOLOGIE_DASHBOARD_TAB, {
      tab: tabId,
      location: "methodologie",
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-4 overflow-x-auto border-b border-white/10 px-3 pb-3 md:-mx-5 md:px-4">
        <nav aria-label="Dashboard tabbladen" className="flex min-w-max gap-1" role="tablist">
          {PREVIEW_TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`methodologie-dashboard-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`methodologie-dashboard-panel-${tab.id}`}
                onClick={() => handleTabClick(tab.id as PreviewTabId)}
                className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
                  isActive ? "bg-[#0f1c10] text-white" : "text-stone-400 hover:text-stone-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        className="flex flex-1 flex-col pt-4"
        role="tabpanel"
        id={`methodologie-dashboard-panel-${activeTab}`}
        aria-labelledby={`methodologie-dashboard-tab-${activeTab}`}
      >
        <ActivePanel />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import CockpitBottomNav from "@/components/dashboard/cockpit/CockpitBottomNav";
import CockpitHeader from "@/components/dashboard/cockpit/CockpitHeader";
import CockpitInspector from "@/components/dashboard/cockpit/CockpitInspector";
import CockpitProfileRail from "@/components/dashboard/cockpit/CockpitProfileRail";
import type { InspectorCard } from "@/lib/cockpit-inspector";
import type { DashboardTabId, PillarId } from "@/types/dashboard";

type CockpitFrameProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  domain: PillarId | null;
  domainNav?: ReactNode;
  onOpenSettings: () => void;
  onLogout: () => void | Promise<void>;
  firstName?: string | null;
  anchorLabel?: string | null;
  statusDone?: boolean;
  onCheckin?: () => void;
  inspectorCards: InspectorCard[];
  children: ReactNode;
};

/**
 * Cockpit-frame (slice 1): twee-rijige header + drie-zone-layout rond de
 * bestaande domein-screen (children = de midden-zone, ongewijzigd). Rechts een
 * contextpaneel dat onder xl een drawer wordt. Alle domein-logica blijft in de
 * children; dit frame is puur chrome + presentatie.
 */
export default function CockpitFrame({
  activeTab,
  onSelectTab,
  domain,
  domainNav,
  onOpenSettings,
  onLogout,
  firstName,
  anchorLabel,
  statusDone = false,
  onCheckin,
  inspectorCards,
  children,
}: CockpitFrameProps) {
  const [contextOpen, setContextOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1600px] text-[#F1EFE8]">
      <CockpitHeader
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        domain={domain}
        domainNav={domainNav}
        onOpenSettings={onOpenSettings}
        onLogout={onLogout}
        onOpenContext={() => setContextOpen(true)}
      />

      <div className="relative grid grid-cols-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:grid-cols-[240px_minmax(0,1fr)] sm:pb-0 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
        <CockpitProfileRail
          firstName={firstName}
          anchorLabel={anchorLabel}
          statusDone={statusDone}
          onCheckin={onCheckin}
        />

        <main className="min-w-0 p-4 sm:p-6">{children}</main>

        <div
          onClick={() => setContextOpen(false)}
          aria-hidden
          className={`fixed inset-0 z-30 bg-black/45 transition-opacity xl:hidden ${
            contextOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <aside
          aria-label="Contextpaneel"
          className={`fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[20px] border-t border-white/10 bg-[#101a1b] p-4 transition-transform duration-300 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:w-[330px] sm:max-h-none sm:max-w-[86%] sm:rounded-none sm:border-t-0 sm:border-l xl:static xl:z-auto xl:h-auto xl:w-auto xl:max-w-none xl:translate-x-0 xl:translate-y-0 xl:overflow-visible xl:bg-black/[0.12] ${
            contextOpen
              ? "translate-y-0 sm:translate-x-0 sm:translate-y-0"
              : "translate-y-full sm:translate-x-full sm:translate-y-0"
          }`}
        >
          <div
            aria-hidden
            className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden"
          />
          <CockpitInspector cards={inspectorCards} />
        </aside>
      </div>

      <CockpitBottomNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </div>
  );
}

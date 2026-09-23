"use client";

import type { ComponentType, CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import CockpitMoreMenu from "@/components/dashboard/cockpit/CockpitMoreMenu";
import { DASHBOARD_TABS } from "@/data/dashboard";
import type { DashboardTabId } from "@/types/dashboard";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

type CockpitBottomNavProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
};

export default function CockpitBottomNav({
  activeTab,
  onSelectTab,
}: CockpitBottomNavProps) {
  return (
    <nav
      data-cockpit-bottom-nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[rgba(12,19,21,0.92)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md sm:hidden"
    >
      {/*
        Meer staat naast de tablist en niet erin: hij opent een lijst en toont
        geen paneel, dus `role="tab"` zou liegen over wat er gebeurt.
      */}
      <div className="flex">
        <div className="flex flex-1" role="tablist">
        {DASHBOARD_TABS.map((tab) => {
          const Icon = Icons[tab.icon as keyof typeof Icons] as IconComp;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectTab(tab.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] font-medium transition ${
                active ? "text-[#F1EFE8]" : "text-[#9FB0A6]"
              }`}
            >
              <Icon
                s={20}
                style={{ color: active ? "#5A8F6A" : "rgba(159,176,166,0.85)" }}
              />
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          );
        })}
        </div>
        <CockpitMoreMenu variant="bottom" />
      </div>
    </nav>
  );
}

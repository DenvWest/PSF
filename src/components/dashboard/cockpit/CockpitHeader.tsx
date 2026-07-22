"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import Wordmark from "@/components/app/Wordmark";
import { DASHBOARD_TABS, PILLAR } from "@/data/dashboard";
import type { DashboardTabId, PillarId } from "@/types/dashboard";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

type CockpitHeaderProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  domain: PillarId | null;
  domainNav?: ReactNode;
  onOpenSettings: () => void;
  onLogout: () => void | Promise<void>;
  onOpenContext?: () => void;
};

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition hover:text-[#F1EFE8]";

export default function CockpitHeader({
  activeTab,
  onSelectTab,
  domain,
  domainNav,
  onOpenSettings,
  onLogout,
  onOpenContext,
}: CockpitHeaderProps) {
  const domainLabel = domain ? PILLAR[domain].label : null;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(12,19,21,0.86)] backdrop-blur-md">
      {!domainNav ? (
        <nav
          aria-label="Broodkruimel"
          className="hidden items-center gap-1.5 px-4 pt-2.5 text-[11px] text-[#7E8C82] sm:flex sm:px-6"
        >
          <span className="text-[#9FB0A6]">Dashboard</span>
          <span aria-hidden className="opacity-50">
            ›
          </span>
          <span className="text-[#9FB0A6]">Kompas</span>
          {domainLabel ? (
            <>
              <span aria-hidden className="opacity-50">
                ›
              </span>
              <span className="text-[#9FB0A6]">{domainLabel}</span>
            </>
          ) : null}
        </nav>
      ) : null}

      <div className="flex items-center gap-3 px-4 pb-2.5 pt-3 sm:px-6 sm:pb-3">
        <Link
          href="/"
          aria-label="Naar de website"
          className="shrink-0 no-underline [&_svg]:h-6 [&_svg]:w-auto sm:[&_svg]:h-auto"
        >
          <Wordmark />
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
          {onOpenContext ? (
            <button
              type="button"
              onClick={onOpenContext}
              aria-label="Context"
              title="Context"
              className={ICON_BTN}
            >
              <Icons.Target s={16} style={{ color: "#5A8F6A" }} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Instellingen"
            aria-label="Instellingen"
            className={ICON_BTN}
          >
            <Icons.Settings s={16} />
          </button>
        </div>

        <div
          className="ml-1 hidden min-w-0 flex-1 gap-0.5 overflow-x-auto scrollbar-hide sm:flex"
          role="tablist"
          aria-label="Hoofdnavigatie"
        >
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
                className={`relative flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition ${
                  active
                    ? "text-[#F1EFE8] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#5A8F6A]"
                    : "text-[#9FB0A6] hover:bg-white/[0.05] hover:text-[#F1EFE8]"
                }`}
              >
                <span className="flex h-[15px] w-[15px] items-center justify-center">
                  <Icon
                    s={15}
                    style={{ color: active ? "#5A8F6A" : "rgba(159,176,166,0.85)" }}
                  />
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {onOpenContext ? (
            <button
              type="button"
              onClick={onOpenContext}
              className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#F1EFE8] xl:hidden"
            >
              <Icons.Target s={15} style={{ color: "#5A8F6A" }} /> Context
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Instellingen"
            aria-label="Instellingen"
            className={ICON_BTN}
          >
            <Icons.Settings s={17} />
          </button>
          <button
            type="button"
            onClick={() => void onLogout()}
            title="Uitloggen"
            aria-label="Uitloggen"
            className={ICON_BTN}
          >
            <Icons.LogOut s={17} />
          </button>
        </div>
      </div>

      {domainNav ? <div className="px-4 pb-3 sm:px-6">{domainNav}</div> : null}
    </header>
  );
}

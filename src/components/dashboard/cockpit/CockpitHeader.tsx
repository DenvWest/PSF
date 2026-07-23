"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import Wordmark from "@/components/app/Wordmark";
import CockpitProfileMenu from "@/components/dashboard/cockpit/CockpitProfileMenu";
import { DASHBOARD_TABS } from "@/data/dashboard";
import type { CockpitContextPresentation } from "@/lib/cockpit-context-layout";
import type { DashboardTabId } from "@/types/dashboard";

type IconComp = ComponentType<{ s?: number; sw?: number; style?: CSSProperties }>;

type CockpitHeaderProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  domainNav?: ReactNode;
  onOpenSettings: () => void;
  onLogout: () => void | Promise<void>;
  onOpenContext?: () => void;
  contextCount?: number;
  contextPresentation?: CockpitContextPresentation;
  firstName?: string | null;
};

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition hover:text-[#F1EFE8]";

function contextAriaLabel(count: number): string {
  return count > 0 ? `Context bij vandaag (${count})` : "Context bij vandaag";
}

function ContextBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }
  return (
    <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#C8956C] px-1 text-[10px] font-bold leading-none text-[#0f1c10]">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function ContextBellButton({
  count,
  onClick,
  variant,
}: {
  count: number;
  onClick: () => void;
  variant: "icon" | "labeled";
}) {
  const label = contextAriaLabel(count);

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#F1EFE8]"
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <Icons.Bell s={15} />
          <ContextBadge count={count} />
        </span>
        Context
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${ICON_BTN} relative`}
    >
      <Icons.Bell s={16} />
      <ContextBadge count={count} />
    </button>
  );
}

function resolveBellVariant(
  presentation: CockpitContextPresentation,
): "icon" | "labeled" {
  return presentation === "sheet" ? "icon" : "labeled";
}

export default function CockpitHeader({
  activeTab,
  onSelectTab,
  domainNav,
  onOpenSettings,
  onLogout,
  onOpenContext,
  contextCount = 0,
  contextPresentation = "sidebar",
  firstName,
}: CockpitHeaderProps) {
  const mobileBellVariant = resolveBellVariant(contextPresentation);
  const desktopBellVariant = resolveBellVariant(
    contextPresentation === "sheet" ? "drawer" : contextPresentation,
  );

  const mobileContextBell = onOpenContext ? (
    <ContextBellButton
      count={contextCount}
      onClick={onOpenContext}
      variant={mobileBellVariant}
    />
  ) : null;

  const desktopContextBell = onOpenContext ? (
    <ContextBellButton
      count={contextCount}
      onClick={onOpenContext}
      variant={desktopBellVariant}
    />
  ) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(12,19,21,0.86)] backdrop-blur-md">
      {/* Kolom 1 = rail-breedte (240/260/280px) min de eigen px-6 (24px), zodat
          de tabs in kolom 2 exact boven de main-inhoud beginnen i.p.v.
          gecentreerd over de volle breedte. */}
      <div className="flex items-center gap-3 px-4 pb-2.5 pt-3 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3 sm:px-6 sm:pb-3 md:grid-cols-[216px_minmax(0,1fr)_auto] min-[1440px]:grid-cols-[236px_minmax(0,1fr)_auto] min-[1680px]:grid-cols-[256px_minmax(0,1fr)_auto]">
        <button
          type="button"
          onClick={() => onSelectTab("vandaag")}
          aria-label="Naar je dashboard-home"
          className="shrink-0 cursor-pointer border-none bg-transparent p-0 [&_svg]:h-6 [&_svg]:w-auto sm:[&_svg]:h-auto"
        >
          <Wordmark />
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:hidden">
          {mobileContextBell}
          <CockpitProfileMenu
            firstName={firstName}
            onOpenSettings={onOpenSettings}
            onLogout={onLogout}
          />
        </div>

        <div
          className="hidden min-w-0 gap-0.5 overflow-x-auto scrollbar-hide sm:flex sm:justify-self-center md:justify-self-start"
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

        <div className="hidden items-center gap-2 sm:flex">
          {desktopContextBell}
          <CockpitProfileMenu
            firstName={firstName}
            onOpenSettings={onOpenSettings}
            onLogout={onLogout}
          />
        </div>
      </div>

      {domainNav ? <div className="px-4 pb-3 sm:px-6">{domainNav}</div> : null}
    </header>
  );
}

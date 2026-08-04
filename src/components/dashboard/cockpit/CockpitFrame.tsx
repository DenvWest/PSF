"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import CockpitBottomNav from "@/components/dashboard/cockpit/CockpitBottomNav";
import CockpitHeader from "@/components/dashboard/cockpit/CockpitHeader";
import CockpitInspector from "@/components/dashboard/cockpit/CockpitInspector";
import CockpitContextRail from "@/components/dashboard/cockpit/CockpitContextRail";
import { clarityTag } from "@/lib/clarity";
import type { InspectorCard } from "@/lib/cockpit-inspector";
import { trackEvent } from "@/lib/ga4";
import { resolveCockpitContextTriggerAction } from "@/lib/cockpit-context-layout";
import { useCockpitContextLayout } from "@/lib/use-cockpit-context-layout";
import type {
  ContextRailDomainItem,
  ContextRailMode,
  ContextRailTool,
  ContextRailToolId,
} from "@/lib/context-rail";
import type { DashboardTabId, PillarId } from "@/types/dashboard";

type CockpitFrameProps = {
  activeTab: DashboardTabId;
  onSelectTab: (tab: DashboardTabId) => void;
  domainNav?: ReactNode;
  onOpenSettings: () => void;
  onLogout: () => void | Promise<void>;
  firstName?: string | null;
  anchorLabel?: string | null;
  statusDone?: boolean;
  onCheckin?: () => void;
  railMode: ContextRailMode;
  railDomains?: ContextRailDomainItem[];
  railActiveDomain?: PillarId | null;
  railTools?: ContextRailTool[];
  railDomainLabel?: string | null;
  onOpenDomain?: (id: PillarId) => void;
  onToolClick?: (id: ContextRailToolId) => void;
  onBackToKompas?: () => void;
  inspectorCards: InspectorCard[];
  remeasureAction?: { due: boolean; onClick: () => void };
  inspectorDoelFooter?: ReactNode;
  inspectorExtra?: ReactNode;
  /** Verberg de linker rail (bijv. Mijn Dag: profiel zit al in de header). */
  hideRail?: boolean;
  /** Mijn Dag: Context als drawer tot xl; vaste sidebar pas vanaf 1280px. */
  contextOverlayUntilXl?: boolean;
  children: ReactNode;
};

const CONTEXT_HIGHLIGHT_MS = 1200;

/** Rail + midden; de contextkolom komt er pas vanaf lg bij als hij openstaat. */
const GRID_TWO_COLUMNS =
  "md:grid-cols-[208px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] min-[1440px]:grid-cols-[260px_minmax(0,1fr)] min-[1680px]:grid-cols-[280px_minmax(0,1fr)]";

const GRID_THREE_COLUMNS =
  "md:grid-cols-[208px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)_288px] xl:grid-cols-[240px_minmax(0,1fr)_320px] min-[1440px]:grid-cols-[260px_minmax(0,1fr)_340px] min-[1680px]:grid-cols-[280px_minmax(0,1fr)_360px]";

/** Midden + context zonder linker rail; sidebar pas vanaf xl (Mijn Dag / iPad landscape). */
const GRID_TWO_COLUMNS_NO_RAIL_XL =
  "xl:grid-cols-[minmax(0,1fr)_320px] min-[1440px]:grid-cols-[minmax(0,1fr)_340px] min-[1680px]:grid-cols-[minmax(0,1fr)_360px]";

/** Alleen midden, zonder linker rail en met context ingeklapt (base grid-cols-1). */
const GRID_ONE_COLUMN_NO_RAIL = "";

/**
 * Cockpit-frame (slice 1): twee-rijige header + drie-zone-layout rond de
 * bestaande domein-screen (children = de midden-zone, ongewijzigd). Rechts een
 * contextpaneel: sheet (< sm), drawer (tablet), sidebar (lg+ / iPad landscape).
 * De sidebar is inklapbaar — dan valt de derde kolom weg en krijgt de
 * midden-zone de ruimte; de context-knop in de header klapt hem weer uit.
 * CSS lg:-fallback zorgt dat de sidebar op web direct zichtbaar is vóór hydration.
 */
export default function CockpitFrame({
  activeTab,
  onSelectTab,
  domainNav,
  onOpenSettings,
  onLogout,
  firstName,
  anchorLabel,
  statusDone = false,
  onCheckin,
  railMode,
  railDomains,
  railActiveDomain = null,
  railTools,
  railDomainLabel,
  onOpenDomain,
  onToolClick,
  onBackToKompas,
  inspectorCards,
  remeasureAction,
  inspectorDoelFooter,
  inspectorExtra,
  hideRail = false,
  contextOverlayUntilXl = false,
  children,
}: CockpitFrameProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [contextHighlighted, setContextHighlighted] = useState(false);
  const contextTitleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextCount = inspectorCards.length + (inspectorExtra ? 1 : 0);
  const presentation = useCockpitContextLayout({ overlayUntilXl: contextOverlayUntilXl });
  const isDrawerMode = presentation !== "sidebar";
  const isSheet = presentation === "sheet";
  const isDialogOpen = contextOpen && isDrawerMode;
  const contextGridWhenOpen = hideRail ? GRID_TWO_COLUMNS_NO_RAIL_XL : GRID_THREE_COLUMNS;
  const contextAsideSidebarClasses = contextOverlayUntilXl
    ? "xl:static xl:z-auto xl:h-auto xl:w-auto xl:max-w-none xl:translate-x-0 xl:translate-y-0 xl:overflow-visible xl:border-l xl:border-white/10 xl:bg-black/[0.12] xl:px-4 xl:py-4 min-[1440px]:px-6"
    : "lg:static lg:z-auto lg:h-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:translate-y-0 lg:overflow-visible lg:border-l lg:border-white/10 lg:bg-black/[0.12] lg:px-4 lg:py-4 xl:px-6";
  const contextAsideOverlayClasses = contextOverlayUntilXl
    ? "max-xl:fixed max-xl:z-40 max-xl:overflow-y-auto max-xl:bg-[#101a1b] max-xl:transition-transform max-xl:duration-300"
    : "max-lg:fixed max-lg:z-40 max-lg:overflow-y-auto max-lg:bg-[#101a1b] max-lg:transition-transform max-lg:duration-300";
  const contextAsideCollapsedClass = contextOverlayUntilXl
    ? "xl:hidden"
    : "lg:hidden";
  const contextAsideOverlayHiddenClass = contextOverlayUntilXl
    ? "max-xl:hidden"
    : "max-lg:hidden";
  const contextSheetOverlayClasses = contextOverlayUntilXl
    ? "max-xl:inset-x-0 max-xl:bottom-0 max-xl:max-h-[min(85vh,720px)] max-xl:rounded-t-[20px] max-xl:border-t max-xl:border-white/10 max-xl:p-3 max-xl:pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
    : "max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[min(85vh,720px)] max-lg:rounded-t-[20px] max-lg:border-t max-lg:border-white/10 max-lg:p-3 max-lg:pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]";
  const contextDrawerOverlayClasses = contextOverlayUntilXl
    ? "max-xl:inset-y-0 max-xl:right-0 max-xl:h-dvh max-xl:w-[min(360px,86vw)] max-xl:border-l max-xl:border-white/10 max-xl:p-4"
    : "max-lg:inset-y-0 max-lg:right-0 max-lg:h-dvh max-lg:w-[min(360px,86vw)] max-lg:border-l max-lg:border-white/10 max-lg:p-4";
  const contextAsideOpenTranslateClasses = contextOverlayUntilXl
    ? "max-xl:translate-x-0 max-xl:translate-y-0"
    : "max-lg:translate-x-0 max-lg:translate-y-0";
  const contextAsideClosedSheetTranslateClasses = contextOverlayUntilXl
    ? "max-xl:translate-y-full"
    : "max-lg:translate-y-full";
  const contextAsideClosedDrawerTranslateClasses = contextOverlayUntilXl
    ? "max-xl:translate-x-full"
    : "max-lg:translate-x-full";

  // De domeinrail is een switcher, geen actiebalk: de hermeting-actie leeft nog
  // in de inspector-"meet"-kaart. Surface blijft in het event zodat de reeks
  // vergelijkbaar blijft met eerdere weken.
  const trackRemeasureClick = useCallback(
    (surface: "inspector_meet", due: boolean) => {
      trackEvent("dashboard_hermeting_reminder_click", { surface, due });
      clarityTag("dashboard_hermeting_reminder_click", surface);
    },
    [],
  );
  const inspectorRemeasureAction = remeasureAction
    ? {
        due: remeasureAction.due,
        onClick: () => {
          trackRemeasureClick("inspector_meet", remeasureAction.due);
          remeasureAction.onClick();
        },
      }
    : undefined;

  const openContext = useCallback(() => {
    setContextOpen(true);
    trackEvent("dashboard_context_opened", {
      card_count: contextCount,
      presentation,
    });
    clarityTag("dashboard_context", `open_${presentation}`);
  }, [contextCount, presentation]);

  const closeContext = useCallback(() => {
    setContextOpen(false);
    trackEvent("dashboard_context_closed", {
      card_count: contextCount,
      presentation,
    });
    clarityTag("dashboard_context", "close");
  }, [contextCount, presentation]);

  const collapseContext = useCallback(() => {
    setContextCollapsed(true);
    trackEvent("dashboard_context_collapsed", { card_count: contextCount });
    clarityTag("dashboard_context", "collapse_sidebar");
  }, [contextCount]);

  const highlightContext = useCallback(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setContextHighlighted(true);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setContextHighlighted(false);
      highlightTimeoutRef.current = null;
    }, CONTEXT_HIGHLIGHT_MS);
  }, []);

  const handleContextBellClick = useCallback(() => {
    const action = resolveCockpitContextTriggerAction(
      presentation,
      contextCollapsed,
    );

    if (action === "open") {
      openContext();
      return;
    }

    if (action === "expand") {
      setContextCollapsed(false);
      trackEvent("dashboard_context_expanded", { card_count: contextCount });
      clarityTag("dashboard_context", "expand_sidebar");
    } else {
      trackEvent("dashboard_context_focused", { card_count: contextCount });
      clarityTag("dashboard_context", "focus_sidebar");
    }

    highlightContext();
  }, [
    presentation,
    contextCollapsed,
    openContext,
    contextCount,
    highlightContext,
  ]);

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeContext();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDialogOpen, closeContext]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[2200px] text-[#F1EFE8]">
      <CockpitHeader
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        domainNav={domainNav}
        onOpenSettings={onOpenSettings}
        onLogout={onLogout}
        onOpenContext={handleContextBellClick}
        contextCount={contextCount}
        contextPresentation={presentation}
        firstName={firstName}
      />

      <div
        className={`relative grid grid-cols-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0 ${
          hideRail
            ? contextCollapsed
              ? GRID_ONE_COLUMN_NO_RAIL
              : contextGridWhenOpen
            : contextCollapsed
              ? GRID_TWO_COLUMNS
              : GRID_THREE_COLUMNS
        }`}
      >
        {hideRail ? null : (
          <CockpitContextRail
            mode={railMode}
            firstName={firstName}
            anchorLabel={anchorLabel}
            statusDone={statusDone}
            onCheckin={onCheckin}
            domains={railDomains}
            activeDomain={railActiveDomain}
            onOpenDomain={onOpenDomain}
            tools={railTools}
            onToolClick={onToolClick}
            onBackToKompas={onBackToKompas}
            domainLabel={railDomainLabel}
          />
        )}

        <main className="min-w-0 px-3 py-3 sm:px-4 sm:py-4 min-[1440px]:px-6">
          {children}
        </main>

        {isDrawerMode && isDialogOpen ? (
          <div
            onClick={closeContext}
            aria-hidden
            className={`fixed inset-0 z-30 bg-black/45 opacity-100 ${contextAsideOverlayHiddenClass}`}
          />
        ) : null}
        <aside
          ref={panelRef}
          tabIndex={isDialogOpen ? -1 : undefined}
          role={isDialogOpen ? "dialog" : undefined}
          aria-modal={isDialogOpen ? true : undefined}
          aria-labelledby={isDialogOpen ? contextTitleId : undefined}
          aria-label={isDialogOpen ? undefined : "Contextpaneel"}
          className={`min-w-0 outline-none transition-shadow duration-300 ${contextAsideSidebarClasses} ${contextAsideOverlayClasses} ${
            contextCollapsed ? contextAsideCollapsedClass : ""
          } ${
            isSheet ? contextSheetOverlayClasses : contextDrawerOverlayClasses
          } ${
            isDialogOpen
              ? contextAsideOpenTranslateClasses
              : isSheet
                ? contextAsideClosedSheetTranslateClasses
                : contextAsideClosedDrawerTranslateClasses
          } ${contextHighlighted ? "ring-2 ring-[#5A8F6A]/50" : ""}`}
        >
          {isSheet && isDrawerMode ? (
            <div
              aria-hidden
              className={`mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20 ${contextAsideOverlayHiddenClass}`}
            />
          ) : null}
          <CockpitInspector
            cards={inspectorCards}
            remeasureAction={inspectorRemeasureAction}
            doelFooter={inspectorDoelFooter}
            extra={inspectorExtra}
            titleId={contextTitleId}
            onClose={isDrawerMode ? closeContext : undefined}
            onCollapse={isDrawerMode ? undefined : collapseContext}
            compact={isSheet}
          />
        </aside>
      </div>

      <CockpitBottomNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </div>
  );
}

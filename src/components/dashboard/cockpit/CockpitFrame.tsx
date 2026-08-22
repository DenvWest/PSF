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
import { useLadderContextOpenRequest } from "@/lib/domain-ladder-focus-context";
import { useCockpitContextLayout } from "@/lib/use-cockpit-context-layout";
import type {
  ContextRailDomainItem,
  ContextRailMode,
  ContextRailTool,
  ContextRailToolId,
  VoortgangRailItemId,
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
  railVoortgangActiveItem?: VoortgangRailItemId | null;
  railVoortgangLeefstijlprofielDomein?: PillarId | null;
  railVoortgangDomains?: ContextRailDomainItem[];
  railVoortgangSchapDomein?: PillarId | null;
  railFavorietenCount?: number;
  onOpenVoortgangItem?: (item: VoortgangRailItemId) => void;
  onOpenLeefstijlprofielDomein?: (id: PillarId) => void;
  onOpenVoortgangAanbouw?: () => void;
  inspectorCards: InspectorCard[];
  /** Kop van het contextpaneel; default in CockpitInspector. */
  inspectorTitle?: string;
  /** Optielaag van de aangeklikte prioriteit — boven de kaarten. */
  inspectorLead?: ReactNode;
  remeasureAction?: { due: boolean; onClick: () => void };
  inspectorDoelFooter?: ReactNode;
  inspectorExtra?: ReactNode;
  /** Verberg de linker rail (bijv. Mijn Dag: profiel zit al in de header). */
  hideRail?: boolean;
  /** Startstand van de contextrail — alleen de eerste render, de gebruiker
      kan hem daarna zelf weer openklappen. Voor surfaces die de volle
      breedte nodig hebben (bijv. de Beweging-prebuild). */
  defaultContextCollapsed?: boolean;
  children: ReactNode;
};

const CONTEXT_HIGHLIGHT_MS = 1200;

/** Rail + midden; contextkolom pas vanaf xl (daaronder drawer over canvas). */
const GRID_TWO_COLUMNS =
  "md:grid-cols-[208px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] min-[1440px]:grid-cols-[260px_minmax(0,1fr)] min-[1680px]:grid-cols-[280px_minmax(0,1fr)]";

const GRID_THREE_COLUMNS =
  "md:grid-cols-[208px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px] min-[1440px]:grid-cols-[260px_minmax(0,1fr)_340px] min-[1680px]:grid-cols-[280px_minmax(0,1fr)_360px]";

/** Midden + context zonder linker rail; sidebar pas vanaf xl. */
const GRID_TWO_COLUMNS_NO_RAIL =
  "xl:grid-cols-[minmax(0,1fr)_320px] min-[1440px]:grid-cols-[minmax(0,1fr)_340px] min-[1680px]:grid-cols-[minmax(0,1fr)_360px]";

/** Alleen midden, zonder linker rail en met context ingeklapt (base grid-cols-1). */
const GRID_ONE_COLUMN_NO_RAIL = "";

const CONTEXT_ASIDE_SIDEBAR_CLASSES =
  "xl:static xl:z-auto xl:h-auto xl:w-auto xl:max-w-none xl:translate-x-0 xl:translate-y-0 xl:overflow-visible xl:border-l xl:border-white/10 xl:bg-black/[0.12] xl:px-4 xl:py-4 min-[1440px]:px-6";

const CONTEXT_ASIDE_OVERLAY_CLASSES =
  "max-xl:fixed max-xl:z-40 max-xl:overflow-y-auto max-xl:bg-[#101a1b] max-xl:transition-transform max-xl:duration-300";

const CONTEXT_ASIDE_SHEET_OVERLAY_CLASSES =
  "max-xl:inset-x-0 max-xl:bottom-0 max-xl:max-h-[min(85vh,720px)] max-xl:rounded-t-[20px] max-xl:border-t max-xl:border-white/10 max-xl:p-3 max-xl:pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]";

const CONTEXT_ASIDE_DRAWER_OVERLAY_CLASSES =
  "max-xl:inset-y-0 max-xl:right-0 max-xl:h-dvh max-xl:w-[min(360px,86vw)] max-xl:border-l max-xl:border-white/10 max-xl:p-4";

/**
 * Cockpit-frame (slice 1): twee-rijige header + drie-zone-layout rond de
 * bestaande domein-screen (children = de midden-zone, ongewijzigd). Rechts een
 * contextpaneel: sheet (< sm), drawer (tablet/iPad), sidebar (xl+).
 * De sidebar is inklapbaar — dan valt de derde kolom weg en krijgt de
 * midden-zone de ruimte; de context-knop in de header klapt hem weer uit.
 * CSS xl:-fallback zorgt dat de sidebar op web direct zichtbaar is vóór hydration.
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
  railVoortgangActiveItem = null,
  railVoortgangLeefstijlprofielDomein = null,
  railVoortgangDomains,
  railVoortgangSchapDomein = null,
  railFavorietenCount = 0,
  onOpenVoortgangItem,
  onOpenLeefstijlprofielDomein,
  onOpenVoortgangAanbouw,
  inspectorCards,
  inspectorTitle,
  inspectorLead,
  remeasureAction,
  inspectorDoelFooter,
  inspectorExtra,
  hideRail = false,
  defaultContextCollapsed = false,
  children,
}: CockpitFrameProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(defaultContextCollapsed);
  const [contextHighlighted, setContextHighlighted] = useState(false);
  const contextTitleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextCount =
    inspectorCards.length + (inspectorExtra ? 1 : 0) + (inspectorLead ? 1 : 0);
  const presentation = useCockpitContextLayout();
  const isDrawerMode = presentation !== "sidebar";
  const isSheet = presentation === "sheet";
  const isDialogOpen = contextOpen && isDrawerMode;
  const contextGridWhenOpen = hideRail ? GRID_TWO_COLUMNS_NO_RAIL : GRID_THREE_COLUMNS;

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

  const openContext = useCallback(
    (source: "bell" | "ladder" = "bell") => {
      setContextOpen(true);
      trackEvent("dashboard_context_opened", {
        card_count: contextCount,
        presentation,
        source,
      });
      clarityTag("dashboard_context", `open_${presentation}`);
    },
    [contextCount, presentation],
  );

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

  const handleLadderOpenRequest = useCallback(() => {
    const action = resolveCockpitContextTriggerAction(
      presentation,
      contextCollapsed,
    );

    if (action === "open") {
      openContext("ladder");
      return;
    }

    if (action === "expand") {
      setContextCollapsed(false);
      trackEvent("dashboard_context_expanded", {
        card_count: contextCount,
        source: "ladder",
      });
      clarityTag("dashboard_context", "expand_sidebar");
    } else {
      trackEvent("dashboard_context_focused", {
        card_count: contextCount,
        source: "ladder",
      });
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

  useLadderContextOpenRequest(handleLadderOpenRequest);

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
            voortgangActiveItem={railVoortgangActiveItem}
            voortgangLeefstijlprofielDomein={railVoortgangLeefstijlprofielDomein}
            voortgangDomains={railVoortgangDomains}
            voortgangSchapDomein={railVoortgangSchapDomein}
            favorietenCount={railFavorietenCount}
            onOpenVoortgangItem={onOpenVoortgangItem}
            onOpenLeefstijlprofielDomein={onOpenLeefstijlprofielDomein}
            onOpenVoortgangAanbouw={onOpenVoortgangAanbouw}
          />
        )}

        <main className="min-w-0 px-3 py-3 sm:px-4 sm:py-4 min-[1440px]:px-6">
          {children}
        </main>

        {isDrawerMode && isDialogOpen ? (
          <div
            onClick={closeContext}
            aria-hidden
            className="fixed inset-0 z-30 bg-black/45 opacity-100 max-xl:hidden"
          />
        ) : null}
        <aside
          ref={panelRef}
          tabIndex={isDialogOpen ? -1 : undefined}
          role={isDialogOpen ? "dialog" : undefined}
          aria-modal={isDialogOpen ? true : undefined}
          aria-labelledby={isDialogOpen ? contextTitleId : undefined}
          aria-label={isDialogOpen ? undefined : "Contextpaneel"}
          className={`min-w-0 outline-none transition-shadow duration-300 ${CONTEXT_ASIDE_SIDEBAR_CLASSES} ${CONTEXT_ASIDE_OVERLAY_CLASSES} ${
            contextCollapsed ? "xl:hidden" : ""
          } ${
            isSheet
              ? CONTEXT_ASIDE_SHEET_OVERLAY_CLASSES
              : CONTEXT_ASIDE_DRAWER_OVERLAY_CLASSES
          } ${
            isDialogOpen
              ? "max-xl:translate-x-0 max-xl:translate-y-0"
              : isSheet
                ? "max-xl:translate-y-full"
                : "max-xl:translate-x-full"
          } ${contextHighlighted ? "ring-2 ring-[#5A8F6A]/50" : ""}`}
        >
          {isSheet && isDrawerMode ? (
            <div
              aria-hidden
              className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20 max-xl:hidden"
            />
          ) : null}
          <CockpitInspector
            cards={inspectorCards}
            title={inspectorTitle}
            lead={inspectorLead}
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

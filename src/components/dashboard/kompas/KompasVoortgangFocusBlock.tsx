"use client";

import { useFocusPickerControl } from "@/components/dashboard/focus/useFocusPickerControl";
import FocusVoortgangPanel from "@/components/dashboard/kompas/FocusVoortgangPanel";
import { clarityTag } from "@/lib/clarity";
import type { PrioritySelectionSurface } from "@/lib/dashboard-priority-selection";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

type KompasVoortgangFocusBlockProps = {
  model: DashboardModel;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onOpenPriority: (domain: PillarId) => void;
  surface: Extract<PrioritySelectionSurface, "kompas_voortgang" | "kompas_voortgang_tab">;
  showHeader?: boolean;
};

export default function KompasVoortgangFocusBlock({
  model,
  onPrefUpdated,
  onOpenPriority,
  surface,
  showHeader = true,
}: KompasVoortgangFocusBlockProps) {
  const {
    focusExpanded,
    busy,
    toggleFocus,
    selectPillar,
    acceptEngine,
    resetFocus,
  } = useFocusPickerControl({
    model,
    onPrefUpdated,
    surface,
    onPickerOpen: () => {
      if (surface === "kompas_voortgang") {
        clarityTag("dashboard_kompas_home", "focus_picker_open");
        return;
      }
      clarityTag("dashboard_voortgang", "focus_picker_open");
    },
  });

  const claritySurface = surface === "kompas_voortgang_tab" ? "voortgang_tab" : "kompas_home";

  return (
    <div>
      {showHeader ? (
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Voortgang
        </p>
      ) : null}

      <div className={showHeader ? "mt-3" : undefined}>
        <FocusVoortgangPanel
          model={model}
          onOpenPriority={onOpenPriority}
          claritySurface={claritySurface}
          focusControl={{
            busy,
            expanded: focusExpanded,
            onToggle: toggleFocus,
            onSelectPillar: (pillarId) => void selectPillar(pillarId),
            onAcceptEngine: () => void acceptEngine(),
            onReset: () => void resetFocus(),
          }}
        />
      </div>
    </div>
  );
}

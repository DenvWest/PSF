"use client";

import type { FocusPickerControl } from "@/components/dashboard/focus/useFocusPickerControl";
import FocusVoortgangPanel from "@/components/dashboard/kompas/FocusVoortgangPanel";
import type { PrioritySelectionSurface } from "@/lib/dashboard-priority-selection";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type KompasVoortgangFocusBlockProps = {
  model: DashboardModel;
  onOpenPriority: (domain: PillarId) => void;
  surface: Extract<PrioritySelectionSurface, "kompas_voortgang" | "kompas_voortgang_tab">;
  /**
   * De focus-control hoort bij de héle Kompas-home, niet bij dit blok: de
   * nudge in de Aanbevolen-tab schrijft naar dezelfde voorkeur als de picker
   * hier. Eén eigenaar (`KompasHomeCard`) voorkomt twee busy-standen die van
   * elkaar niet weten.
   */
  control: FocusPickerControl;
  showHeader?: boolean;
};

export default function KompasVoortgangFocusBlock({
  model,
  onOpenPriority,
  surface,
  control,
  showHeader = true,
}: KompasVoortgangFocusBlockProps) {
  const { focusExpanded, busy, toggleFocus, selectPillar, acceptEngine, resetFocus } = control;

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

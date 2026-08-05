"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import AgendaViewSwitcher from "@/components/dashboard/agenda/AgendaViewSwitcher";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { AgendaViewId } from "@/lib/dashboard-url";

const PERIOD_NAV_BUTTON =
  "inline-flex min-h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[#9FB0A6] transition-colors hover:bg-white/[0.06] hover:text-[#F1EFE8] sm:min-h-10 sm:min-w-10";

const MENU_ITEM =
  "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-[#CDD7D0] no-underline transition hover:bg-white/[0.06] hover:text-[#F1EFE8] disabled:cursor-not-allowed disabled:opacity-60";

export type AgendaToolbarActions = {
  planHref?: string | null;
  showFocus?: boolean;
  focusLabel?: string;
  focusExpanded?: boolean;
  priorityColor?: string;
  prefBusy?: boolean;
  onToggleFocus?: () => void;
  onPlanClick?: () => void;
};

type AgendaToolbarProps = {
  view: AgendaViewId;
  onViewChange: (view: AgendaViewId) => void;
  periodLabel: string;
  onPeriodPrev: () => void;
  onPeriodNext: () => void;
  showGoToday: boolean;
  onGoToday: () => void;
  /** Datum-label is de enige kalender-ingang, op elke view — vervangt de
   * losse "Kalender"-actie die er voorheen alleen op dag-view stond. */
  onOpenCalendar: () => void;
  stickyTop: number;
  actions?: AgendaToolbarActions;
};

/**
 * Vandaag-knop staat in een eigen, altijd gerenderde slot buiten de
 * periode-pil — verborgen met `invisible` i.p.v. conditioneel gemount. Stond
 * hij ín de pil, dan verschoven de chevrons zelf bij elke wissel over de
 * vandaag-grens (precies wanneer je aan het doortikken bent): de knop
 * verscheen onder je vinger en een tik landde per ongeluk op de datum
 * ernaast, die de kalender opent.
 */
function TodayButton({
  visible,
  onGoToday,
}: {
  visible: boolean;
  onGoToday: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onGoToday}
      aria-hidden={!visible}
      aria-label="Naar vandaag"
      tabIndex={visible ? 0 : -1}
      className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[12px] font-semibold text-[var(--sage)] transition-colors sm:min-h-10 sm:px-3 sm:text-[12.5px] ${
        visible
          ? "cursor-pointer hover:border-white/25 hover:text-[#F1EFE8]"
          : "invisible"
      }`}
      style={{ fontFamily: "var(--f-sans)" }}
    >
      {/* "Nu" is hetzelfde label als WeekDayHeader/AgendaWeekOverview al voor
          vandaag gebruiken — geen nieuwe term, en op 375px scheelt het genoeg
          breedte om de datum en de volgende-chevron zichtbaar te houden. */}
      <span className="sm:hidden">Nu</span>
      <span className="hidden sm:inline">Vandaag</span>
    </button>
  );
}

/**
 * Eén pil voor vorige · datum (altijd zichtbaar, tikbaar → kalender-sheet) ·
 * volgende. Drie vaste kinderen, altijd in dezelfde volgorde — niets in deze
 * pil verandert van aantal, dus de chevrons blijven op een stabiele positie.
 */
function PeriodStepper({
  periodLabel,
  onPeriodPrev,
  onPeriodNext,
  onOpenCalendar,
}: {
  periodLabel: string;
  onPeriodPrev: () => void;
  onPeriodNext: () => void;
  onOpenCalendar: () => void;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-0.5 rounded-xl border border-white/10 bg-black/20 p-0.5 sm:gap-1 sm:p-1"
      role="group"
      aria-label="Periode"
    >
      <button
        type="button"
        onClick={onPeriodPrev}
        aria-label="Vorige periode"
        className={PERIOD_NAV_BUTTON}
      >
        <Icons.ChevronLeft s={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          trackEvent("agenda_period_picker_open", { surface: "agenda_toolbar" });
          clarityTag("dashboard_agenda", "period_picker_open");
          onOpenCalendar();
        }}
        aria-haspopup="dialog"
        aria-label="Kies een dag"
        className="m-0 min-w-0 flex-1 cursor-pointer truncate rounded-lg border-none bg-transparent px-1 py-1 text-center text-[12.5px] font-medium capitalize text-[#F1EFE8] transition-colors hover:bg-white/[0.06] sm:px-2 sm:text-[13px]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        <span aria-live="polite">{periodLabel}</span>
      </button>
      <button
        type="button"
        onClick={onPeriodNext}
        aria-label="Volgende periode"
        className={PERIOD_NAV_BUTTON}
      >
        <Icons.ChevronRight s={16} />
      </button>
    </div>
  );
}

/**
 * Plan en Focus staan achter één vast-brede knop i.p.v. een los blok dat
 * alleen op dag-view verscheen — dat liet de balk vroeger van hoogte
 * verspringen bij het wisselen van view.
 */
function AgendaOverflowMenu({ actions }: { actions: AgendaToolbarActions }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasPlan = Boolean(actions.planHref);
  const hasFocus = Boolean(actions.showFocus);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!hasPlan && !hasFocus) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Meer acties"
        className="inline-flex min-h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8] sm:min-h-10 sm:min-w-10"
      >
        <Icons.MoreHorizontal s={16} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-[14px] border border-white/10 bg-[#101a1b] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        >
          {hasFocus ? (
            <button
              type="button"
              role="menuitem"
              disabled={actions.prefBusy}
              aria-expanded={actions.focusExpanded}
              onClick={() => {
                setOpen(false);
                actions.onToggleFocus?.();
              }}
              className={MENU_ITEM}
              style={{
                color: actions.focusExpanded ? actions.priorityColor : undefined,
              }}
            >
              <span className="truncate">{actions.focusLabel ?? "Focus"}</span>
            </button>
          ) : null}
          {hasPlan && actions.planHref ? (
            <Link
              role="menuitem"
              href={actions.planHref}
              onClick={() => {
                setOpen(false);
                actions.onPlanClick?.();
              }}
              className={MENU_ITEM}
            >
              Plan
              <Icons.ArrowRight s={12} />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function AgendaToolbar({
  view,
  onViewChange,
  periodLabel,
  onPeriodPrev,
  onPeriodNext,
  showGoToday,
  onGoToday,
  onOpenCalendar,
  stickyTop,
  actions,
}: AgendaToolbarProps) {
  return (
    <header
      className="sticky z-10 -mx-3 mb-4 border-b border-white/10 bg-[rgba(26,46,26,0.94)] px-3 py-2 backdrop-blur-md sm:-mx-4 sm:px-4 min-[1440px]:-mx-6 min-[1440px]:px-6"
      style={{ top: stickyTop }}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <TodayButton visible={showGoToday} onGoToday={onGoToday} />
        <PeriodStepper
          periodLabel={periodLabel}
          onPeriodPrev={onPeriodPrev}
          onPeriodNext={onPeriodNext}
          onOpenCalendar={onOpenCalendar}
        />
        <AgendaViewSwitcher value={view} onChange={onViewChange} embedded />
        {actions ? <AgendaOverflowMenu actions={actions} /> : null}
      </div>
    </header>
  );
}

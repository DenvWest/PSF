"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PillarId } from "@/types/dashboard";

/**
 * Welke ladderlaag het domeinscherm nu uitlegt.
 *
 * De ladder staat in de midden-kolom, de contextkolom staat ernaast, en ze
 * worden op verschillende hoogtes in de boom gerenderd (CockpitFrame bouwt de
 * inspector, KompasHome het scherm). Dit is het smalste ding dat ze allebei
 * kunnen lezen: één domein, één laag-id. Geen kaartinhoud, geen keuzes — die
 * bouwt elke kant zelf uit dezelfde bron.
 *
 * Twee waarden, met opzet gescheiden (roadmap §7.2, voorwaarde 1):
 *
 * - `selected` is de **keuze**: null zolang niemand een laag aanwees, daarna de
 *   laag die iemand aanklikte — in het midden of in de zijbalk, dat maakt niet
 *   uit. Dit is het schrijfkanaal, en het is er maar één.
 * - `focus` is de **uitkomst**: wat het domeinscherm feitelijk uitlegt, dus de
 *   keuze als die er is en anders de winst-laag uit de check. Het scherm
 *   publiceert die; de zijbalk leest hem.
 *
 * Tot 22 augustus woonde de keuze in een `useState` op het domeinscherm en werd
 * `focus` er eenrichting uit gepusht. Een zijbalk die zelf `setFocus` riep,
 * bereikte het midden daardoor nooit terug: de ladder bleef op de oude laag
 * staan terwijl de contextkolom een andere toonde — twee open lagen tegelijk,
 * zonder foutmelding.
 */

export type DomainLadderFocus = { domain: PillarId; layerId: number } | null;

type DomainLadderFocusContextValue = {
  focus: DomainLadderFocus;
  setFocus: (focus: DomainLadderFocus) => void;
  /** De aangeklikte laag, of null zolang de aanbeveling nog leidend is. */
  selected: DomainLadderFocus;
  /** Het enige schrijfkanaal voor "ik wil een andere laag lezen". */
  selectLayer: (selection: DomainLadderFocus) => void;
};

const DomainLadderFocusContext = createContext<DomainLadderFocusContextValue | null>(null);

function sameFocus(a: DomainLadderFocus, b: DomainLadderFocus): boolean {
  if (a === b) {
    return true;
  }
  return a != null && b != null && a.domain === b.domain && a.layerId === b.layerId;
}

export function DomainLadderFocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<DomainLadderFocus>(null);
  const [selected, setSelectedState] = useState<DomainLadderFocus>(null);

  const setFocus = useCallback((next: DomainLadderFocus) => {
    setFocusState((current) => (sameFocus(current, next) ? current : next));
  }, []);

  const selectLayer = useCallback((next: DomainLadderFocus) => {
    setSelectedState((current) => (sameFocus(current, next) ? current : next));
  }, []);

  const value = useMemo(
    () => ({ focus, setFocus, selected, selectLayer }),
    [focus, setFocus, selected, selectLayer],
  );

  return (
    <DomainLadderFocusContext.Provider value={value}>
      {children}
    </DomainLadderFocusContext.Provider>
  );
}

export function useDomainLadderFocus(): DomainLadderFocusContextValue {
  return (
    useContext(DomainLadderFocusContext) ?? {
      focus: null,
      setFocus: () => {},
      selected: null,
      selectLayer: () => {},
    }
  );
}

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
 */

export type DomainLadderFocus = { domain: PillarId; layerId: number } | null;

type DomainLadderFocusContextValue = {
  focus: DomainLadderFocus;
  setFocus: (focus: DomainLadderFocus) => void;
};

const DomainLadderFocusContext = createContext<DomainLadderFocusContextValue | null>(null);

export function DomainLadderFocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<DomainLadderFocus>(null);

  const setFocus = useCallback((next: DomainLadderFocus) => {
    setFocusState((current) => {
      if (current === next) {
        return current;
      }
      if (
        current &&
        next &&
        current.domain === next.domain &&
        current.layerId === next.layerId
      ) {
        return current;
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ focus, setFocus }), [focus, setFocus]);

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
    }
  );
}

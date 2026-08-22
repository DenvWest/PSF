"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
 * `openNonce` is een los signaal: de gebruiker tikte een laag aan, dus de
 * sheet/drawer mag omhoog. Mounten van het scherm zet wel `focus` (de
 * contextkolom op desktop toont dan al de opties) maar telt niet als tik.
 */

export type DomainLadderFocus = { domain: PillarId; layerId: number } | null;

type DomainLadderFocusContextValue = {
  focus: DomainLadderFocus;
  setFocus: (focus: DomainLadderFocus) => void;
  openNonce: number;
  requestOpen: () => void;
};

const DomainLadderFocusContext = createContext<DomainLadderFocusContextValue | null>(null);

const IDLE_FOCUS: DomainLadderFocusContextValue = {
  focus: null,
  setFocus: () => {},
  openNonce: 0,
  requestOpen: () => {},
};

export function DomainLadderFocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<DomainLadderFocus>(null);
  const [openNonce, setOpenNonce] = useState(0);

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

  const requestOpen = useCallback(() => {
    setOpenNonce((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ focus, setFocus, openNonce, requestOpen }),
    [focus, setFocus, openNonce, requestOpen],
  );

  return (
    <DomainLadderFocusContext.Provider value={value}>
      {children}
    </DomainLadderFocusContext.Provider>
  );
}

export function useDomainLadderFocus(): DomainLadderFocusContextValue {
  return useContext(DomainLadderFocusContext) ?? IDLE_FOCUS;
}

/**
 * Roept `onRequest` alleen wanneer de gebruiker een laag aantikte
 * (`requestOpen`), niet wanneer het domeinscherm bij mount zijn focus zet.
 */
export function useLadderContextOpenRequest(onRequest: () => void): void {
  const { openNonce } = useDomainLadderFocus();
  const seenNonceRef = useRef(0);

  useEffect(() => {
    if (openNonce <= 0 || openNonce === seenNonceRef.current) {
      return;
    }
    seenNonceRef.current = openNonce;
    onRequest();
  }, [openNonce, onRequest]);
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Leest een media query zonder hydration-mismatch: server en eerste render
 * gaan uit van `false`, daarna volgt de echte match via een matchMedia-listener.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

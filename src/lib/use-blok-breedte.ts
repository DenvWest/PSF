"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * De breedte van een blok, niet van het scherm: in de cockpit staat het
 * dagboek naast een contextkolom, dus de viewport zegt weinig. Zelfde reden
 * als `@container` in CSS; dit is de JS-kant voor wat CSS niet kan (een ander
 * onderdeel renderen). Tot de eerste meting: 0, dus de mobiele weergave.
 */
export function useBlokBreedte(ref: RefObject<HTMLElement | null>): number {
  const [breedte, setBreedte] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBreedte(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return breedte;
}

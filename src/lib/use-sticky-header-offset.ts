"use client";

import { useEffect, useState } from "react";

/**
 * Hoogte van de sticky cockpit-header, zodat een tweede sticky laag (de
 * dagkop van Mijn Dag) eronder blijft plakken in plaats van erachter te
 * verdwijnen. De header groeit mee met domein-nav en compliance-regel, dus
 * meten is betrouwbaarder dan een vaste offset.
 */
export function useStickyHeaderOffset(selector = "[data-cockpit-header]"): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = document.querySelector(selector);
    if (!node) {
      return;
    }

    const measure = () => {
      setOffset(Math.round(node.getBoundingClientRect().height));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selector]);

  return offset;
}

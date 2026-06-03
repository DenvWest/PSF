"use client";

import { useEffect, useState } from "react";
import { INBODY_LEEFSTIJLCHECK_CTA_SELECTOR } from "@/lib/leefstijlcheck-inbody-cta";

export function useInBodyLeefstijlcheckCtaVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const intersecting = new Set<Element>();
    const observed = new WeakSet<Element>();

    const sync = () => setVisible(intersecting.size > 0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target);
          } else {
            intersecting.delete(entry.target);
          }
        }
        sync();
      },
      { threshold: 0 },
    );

    function observeTargets() {
      document.querySelectorAll(INBODY_LEEFSTIJLCHECK_CTA_SELECTOR).forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        observer.observe(el);
      });
    }

    observeTargets();

    const mutationObserver = new MutationObserver(observeTargets);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return visible;
}

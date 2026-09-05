"use client";

import { useEffect, useState } from "react";
import type { IntakeGender } from "@/data/intake-questions";
import { getLastSession } from "@/lib/intake-storage";

type GenderAdaptiveTextProps = {
  /** Getoond zolang geslacht onbekend is (geen sessie, of "anders"). */
  neutral: React.ReactNode;
  man: React.ReactNode;
  vrouw: React.ReactNode;
};

/**
 * Rendert content op basis van het geslacht uit de laatst bekende intake-sessie.
 * Zonder sessie (koud verkeer, geen consent, "anders") blijft de neutrale variant staan —
 * nooit een aanname over de bezoeker.
 */
export function GenderAdaptiveText({ neutral, man, vrouw }: GenderAdaptiveTextProps) {
  const [gender, setGender] = useState<IntakeGender | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await getLastSession();
        if (!cancelled && loaded?.session?.gender) {
          setGender(loaded.session.gender);
        }
      } catch {
        /* zonder sessie blijft de neutrale variant staan */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (gender === "man") return <>{man}</>;
  if (gender === "vrouw") return <>{vrouw}</>;
  return <>{neutral}</>;
}

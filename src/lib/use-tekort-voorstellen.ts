"use client";

import { useEffect, useMemo, useState } from "react";
import { bouwTekortVoorstellen } from "@/lib/agenda-tekort-voorstellen";
import type { TekortVoorstel } from "@/lib/agenda-tekort-voorstellen";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bouwTekortsysteem } from "@/lib/nutrition-tekortsysteem";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";

export function useTekortVoorstellen(today: string): {
  dagen: DagboekDag[];
  voorstellen: TekortVoorstel[];
  reeksen: Vensterreeks[];
} {
  const [dagen, setDagen] = useState<DagboekDag[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { days?: DagboekDag[] };
        if (!cancelled) setDagen(body.days ?? []);
      } catch {
        if (!cancelled) setDagen([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reeksen = useMemo(() => bouwTekortsysteem(dagen, today), [dagen, today]);
  const voorstellen = useMemo(() => bouwTekortVoorstellen(reeksen), [reeksen]);

  return { dagen, voorstellen, reeksen };
}

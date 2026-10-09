"use client";

import { useEffect, useState } from "react";
import type { DagboekDag } from "@/lib/nutrition-dagboek";

/**
 * De dagboekdagen van wie ingelogd is, één verzoek per halve minuut voor alle
 * kolomblokken die het nodig hebben. Null zolang er geen antwoord is en bij een
 * fout: dan laten de blokken hun regel weg in plaats van "0 dagen" te beweren.
 */

const TTL_MS = 30_000;

let geladenOp = 0;
let lopend: Promise<DagboekDag[] | null> | null = null;
let laatste: DagboekDag[] | null = null;

function laad(): Promise<DagboekDag[] | null> {
  if (laatste && Date.now() - geladenOp < TTL_MS) return Promise.resolve(laatste);
  lopend ??= fetch("/api/account/nutrition-daybook", { credentials: "include" })
    .then(async (response) => {
      if (!response.ok) return null;
      const body = (await response.json()) as { days?: DagboekDag[] };
      laatste = body.days ?? [];
      geladenOp = Date.now();
      return laatste;
    })
    .catch(() => null)
    .finally(() => {
      lopend = null;
    });
  return lopend;
}

export function useDagboekDagen(): DagboekDag[] | null {
  const [dagen, setDagen] = useState<DagboekDag[] | null>(null);

  useEffect(() => {
    let afgebroken = false;
    void laad().then((resultaat) => {
      if (!afgebroken) setDagen(resultaat);
    });
    return () => {
      afgebroken = true;
    };
  }, []);

  return dagen;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";

/**
 * De voedingsmiddelen die je in het dagboek met ☆ bewaarde ("Mijn producten"),
 * met een wissel. Dezelfde opslag en dezelfde meting als de ster in Je patroon
 * (`PatroonBronZoek`): `/api/account/dagboek-favorieten` en
 * `nutrition.dagboek_favoriet_*`, alleen met een eigen `surface`.
 *
 * Eén keer geladen voor alle stofkaarten samen, niet per kaart. Mislukt het
 * laden, dan werkt de ster nog; alleen de bestaande sterren ontbreken.
 */
export function useDagboekVoedingsfavorieten(surface: string) {
  const [keys, setKeys] = useState<ReadonlySet<string>>(new Set());
  const [bezig, setBezig] = useState<string | null>(null);

  useEffect(() => {
    let afgebroken = false;
    void fetch("/api/account/dagboek-favorieten", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { items?: DagboekFavoriet[] };
        if (afgebroken) return;
        const voeding = (body.items ?? []).filter((f) => f.bron === "voeding").map((f) => f.key);
        setKeys((huidig) => new Set([...huidig, ...voeding]));
      })
      .catch(() => {});
    return () => {
      afgebroken = true;
    };
  }, []);

  const wissel = useCallback(
    async (key: string, nutrient: string) => {
      const bewaard = keys.has(key);
      setBezig(key);
      try {
        const response = await fetch(
          bewaard
            ? `/api/account/dagboek-favorieten?bron=voeding&key=${encodeURIComponent(key)}`
            : "/api/account/dagboek-favorieten",
          bewaard
            ? { method: "DELETE", credentials: "include" }
            : {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bron: "voeding", key }),
              },
        );
        if (!response.ok) return;
        setKeys((huidig) => {
          const volgende = new Set(huidig);
          if (bewaard) volgende.delete(key);
          else volgende.add(key);
          return volgende;
        });
        emitAccountClientEvent(
          bewaard ? "nutrition.dagboek_favoriet_verwijderd" : "nutrition.dagboek_favoriet_toegevoegd",
          { bron: "voeding", surface },
        );
        trackEvent(bewaard ? "nutrition_dagboek_favoriet_verwijderd" : "nutrition_dagboek_favoriet_toegevoegd", {
          bron: "voeding",
          surface,
          nutrient,
        });
      } finally {
        setBezig(null);
      }
    },
    [keys, surface],
  );

  return { isBewaard: (key: string) => keys.has(key), wissel, bezig };
}

export type DagboekVoedingsfavorieten = ReturnType<typeof useDagboekVoedingsfavorieten>;

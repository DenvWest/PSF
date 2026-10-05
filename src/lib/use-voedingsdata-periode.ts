"use client";

import { useEffect, useMemo, useState } from "react";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { sanitizeItems, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import {
  berekenVoedingswaarde,
  nevoCodesVoorItems,
  type Voedingswaarde,
} from "@/lib/nutrition-voedingswaarde";
import { useNevoProducten } from "@/lib/use-nevo-producten";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Alles wat Je patroon nodig heeft om de volledige voedingswaarde van een
 * periode door te rekenen, met één ophaalronde: de etiketproducten van
 * `van` tot `vandaag` in één verzoek (max. 42 dagen, zie de route) en de
 * NEVO-records van alle catalogusregels in die periode.
 *
 * Levert de ruwe items en porties per dag (voor de uitsplitsing per
 * maaltijd) én de doorgerekende voedingswaarde per dag (voor gevolgde
 * stoffen, macro-doelen en trend).
 */
export function useVoedingsdataPeriode(
  dagen: readonly DagboekDag[],
  van: string,
  vandaag: string,
): {
  itemsPerDag: ReadonlyMap<string, readonly DagboekItem[]>;
  etiketPerDag: Readonly<Record<string, readonly SupermarktPortie[]>>;
  nevoProducten: ReadonlyMap<string, SupermarktProduct>;
  perDag: ReadonlyMap<string, Voedingswaarde>;
} {
  const [etiketPerDag, setEtiketPerDag] = useState<Record<string, SupermarktPortie[]>>({});

  useEffect(() => {
    let afgebroken = false;
    void fetch(
      `/api/account/supermarkt-portie-logs?van=${encodeURIComponent(van)}&tot=${encodeURIComponent(vandaag)}`,
      { credentials: "include" },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { perDag?: Record<string, SupermarktPortie[]> };
        if (!afgebroken) setEtiketPerDag(body.perDag ?? {});
      })
      .catch(() => {
        if (!afgebroken) setEtiketPerDag({});
      });
    return () => {
      afgebroken = true;
    };
  }, [van, vandaag]);

  const itemsPerDag = useMemo(
    () =>
      new Map(
        dagen
          .filter((dag) => dag.date >= van && dag.date <= vandaag)
          .map((dag) => [dag.date, sanitizeItems(dag.items ?? [])]),
      ),
    [dagen, van, vandaag],
  );

  const codes = useMemo(() => nevoCodesVoorItems([...itemsPerDag.values()].flat()), [itemsPerDag]);
  const nevoProducten = useNevoProducten(codes);

  const perDag = useMemo(() => {
    const datums = new Set([...itemsPerDag.keys(), ...Object.keys(etiketPerDag)]);
    return new Map(
      [...datums].map((datum) => [
        datum,
        berekenVoedingswaarde({
          items: itemsPerDag.get(datum) ?? [],
          supermarktLogs: etiketPerDag[datum] ?? [],
          nevoProducten,
        }),
      ]),
    );
  }, [itemsPerDag, etiketPerDag, nevoProducten]);

  return { itemsPerDag, etiketPerDag, nevoProducten, perDag };
}

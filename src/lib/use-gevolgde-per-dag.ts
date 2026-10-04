"use client";

import { useEffect, useMemo, useState } from "react";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { sanitizeItems } from "@/lib/nutrition-dagboek-items";
import type { SupermarktPortie, SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import {
  berekenVoedingswaarde,
  nevoCodesVoorItems,
  type Voedingswaarde,
} from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useNevoProducten } from "@/lib/use-nevo-producten";

/**
 * De volledige voedingswaarde per geregistreerde dag van `van` tot `vandaag`,
 * voor de gevolgde stoffen in Je patroon. Vensters (`nutrition-gevolgde-vensters`),
 * weken en trend (`nutrition-gevolgde-weken`) rekenen hier alle drie uit, met
 * één ophaalronde. Haalt pas iets op als er een stof gevolgd wordt: de
 * etiketproducten van de periode in één verzoek (max. 42 dagen, zie de route),
 * de NEVO-records van alle catalogusregels in die periode.
 */
export function useGevolgdePerDag(
  dagen: readonly DagboekDag[],
  van: string,
  vandaag: string,
): { stoffen: readonly SupermarktVeld[]; perDag: ReadonlyMap<string, Voedingswaarde>; stoffenGeladen: boolean } {
  const { stoffen, geladen } = useGevolgdeStoffen();
  const volgtIets = stoffen.length > 0;
  const [etiket, setEtiket] = useState<Record<string, SupermarktPortie[]>>({});

  useEffect(() => {
    if (!volgtIets) return;
    let afgebroken = false;
    void fetch(
      `/api/account/supermarkt-portie-logs?van=${encodeURIComponent(van)}&tot=${encodeURIComponent(vandaag)}`,
      { credentials: "include" },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { perDag?: Record<string, SupermarktPortie[]> };
        if (!afgebroken) setEtiket(body.perDag ?? {});
      })
      .catch(() => {
        if (!afgebroken) setEtiket({});
      });
    return () => {
      afgebroken = true;
    };
  }, [volgtIets, van, vandaag]);

  const itemsPerDag = useMemo(
    () =>
      new Map(
        dagen
          .filter((dag) => dag.date >= van && dag.date <= vandaag)
          .map((dag) => [dag.date, sanitizeItems(dag.items ?? [])]),
      ),
    [dagen, van, vandaag],
  );

  const codes = useMemo(
    () => (volgtIets ? nevoCodesVoorItems([...itemsPerDag.values()].flat()) : []),
    [volgtIets, itemsPerDag],
  );
  const nevoProducten = useNevoProducten(codes);

  const perDag = useMemo(() => {
    if (!volgtIets) return new Map<string, Voedingswaarde>();
    const datums = new Set([...itemsPerDag.keys(), ...Object.keys(etiket)]);
    return new Map(
      [...datums].map((datum) => [
        datum,
        berekenVoedingswaarde({
          items: itemsPerDag.get(datum) ?? [],
          supermarktLogs: etiket[datum] ?? [],
          nevoProducten,
        }),
      ]),
    );
  }, [volgtIets, itemsPerDag, etiket, nevoProducten]);

  return { stoffen, perDag, stoffenGeladen: geladen };
}

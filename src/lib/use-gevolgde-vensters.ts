"use client";

import { useEffect, useMemo, useState } from "react";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { bouwGevolgdeVensters, type GevolgdeReeks } from "@/lib/nutrition-gevolgde-vensters";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import { berekenVoedingswaarde, nevoCodesVoorItems } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useNevoProducten } from "@/lib/use-nevo-producten";

const PERIODE = 30;

function datumTerug(vandaag: string, dagen: number): string {
  const datum = new Date(`${vandaag}T00:00:00Z`);
  datum.setUTCDate(datum.getUTCDate() - dagen);
  return datum.toISOString().slice(0, 10);
}

/**
 * De gevolgde stoffen per venster voor Je patroon. Haalt pas iets op als er
 * een stof gevolgd wordt: de etiketproducten van 30 dagen in één verzoek, de
 * NEVO-records van alle catalogusregels in die periode.
 */
export function useGevolgdeVensters(
  dagen: readonly DagboekDag[],
  vandaag: string,
): { reeksen: GevolgdeReeks[]; stoffenGeladen: boolean } {
  const { stoffen, geladen } = useGevolgdeStoffen();
  const volgtIets = stoffen.length > 0;
  const van = datumTerug(vandaag, PERIODE - 1);
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

  const reeksen = useMemo(() => {
    if (!volgtIets) return [];
    const datums = new Set([...itemsPerDag.keys(), ...Object.keys(etiket)]);
    const perDag = new Map(
      [...datums].map((datum) => [
        datum,
        berekenVoedingswaarde({
          items: itemsPerDag.get(datum) ?? [],
          supermarktLogs: etiket[datum] ?? [],
          nevoProducten,
        }),
      ]),
    );
    return bouwGevolgdeVensters(perDag, stoffen, vandaag);
  }, [volgtIets, itemsPerDag, etiket, nevoProducten, stoffen, vandaag]);

  return { reeksen, stoffenGeladen: geladen };
}

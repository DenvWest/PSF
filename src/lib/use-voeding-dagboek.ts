"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Voedingsmiddel } from "@/data/nutrition/food-items";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  parseDagItems,
  serialiseerDagItems,
  itemsTelling,
  voegItemToe,
  zetItemPorties,
  type DagItems,
} from "@/lib/nutrition-dagboek-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { bouwDagstrip, type DagstripDag } from "@/lib/nutrition-dagstrip";

/**
 * De staat van het voedingsdagboek: één keer laden, door meerdere lagen gelezen.
 *
 * P1 vult de dag in; P2, P3 en P6 lezen dezelfde dag. Als elk paneel zijn eigen
 * fetch deed, zouden ze na een wijziging uit elkaar lopen tot de volgende
 * render — en dan zegt het Kompas op twee plekken iets anders over dezelfde
 * ochtend. Vandaar één haak, één keer aangeroepen op het domeinscherm.
 *
 * ## Waarom lokale bewerkingen naast de serverstand leven
 *
 * `dagen` is wat de server teruggaf; `bewerkt` is wat je in deze sessie
 * veranderde, per datum. De dag die je leest is de tweede over de eerste heen.
 * Het alternatief — één state die bij elke dagwissel uit de serverstand wordt
 * overgeschreven — vraagt om een effect dat setState aanroept, en dat is de
 * cascade die React expliciet afraadt.
 */

export type VoedingDagboekState = {
  /** ISO-datum van de dag die openstaat. */
  datum: string;
  /** Vandaag in de agenda-tijdzone; de rechterrand van de strip. */
  vandaag: string;
  strip: DagstripDag[];
  /** Datums waarvoor al iets geregistreerd is. */
  gevuldeDagen: ReadonlySet<string>;
  items: DagItems;
  waterMl: number | null;
  geladen: boolean;
  busy: boolean;
  fout: string | null;
  kiesDatum: (datum: string) => void;
  voegToe: (moment: EetmomentId, product: Voedingsmiddel) => void;
  zetPorties: (moment: EetmomentId, key: string, porties: number) => void;
  zetWater: (ml: number | null) => void;
};

function itemsVanDag(dag: DagboekDag | undefined): DagItems {
  if (!dag?.items) return {};
  return parseDagItems(
    Object.fromEntries(
      Object.entries(dag.items).map(([moment, regels]) => [
        moment,
        regels.map((regel) => ({ k: regel.key, n: regel.porties })),
      ]),
    ),
  );
}

export function useVoedingDagboek(
  onItemToegevoegd?: (moment: EetmomentId, product: Voedingsmiddel) => void,
): VoedingDagboekState {
  const vandaag = todayInAgendaTimezone();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [datum, setDatum] = useState(vandaag);
  const [bewerkt, setBewerkt] = useState<
    Record<string, { items: DagItems; waterMl: number | null }>
  >({});
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let afgebroken = false;
    fetch("/api/account/nutrition-daybook", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (afgebroken) return;
        setDagen(Array.isArray(payload?.days) ? payload.days : []);
        setGeladen(true);
      })
      // Uitgelogd of nog geen dagboek: dan is er niets te tonen, en dat is een
      // geldig antwoord.
      .catch(() => {
        if (!afgebroken) setGeladen(true);
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  const dagVanDatum = useMemo(
    () => dagen.find((dag) => dag.date === datum),
    [dagen, datum],
  );

  const items = useMemo(
    () => bewerkt[datum]?.items ?? itemsVanDag(dagVanDatum),
    [bewerkt, datum, dagVanDatum],
  );
  const waterMl = bewerkt[datum]?.waterMl ?? dagVanDatum?.waterMl ?? null;

  const strip = useMemo(() => bouwDagstrip(vandaag), [vandaag]);

  const gevuldeDagen = useMemo(() => {
    const gevuld = new Set<string>();
    for (const dag of dagen) {
      if (itemsTelling(itemsVanDag(dag)) > 0 || Object.keys(dag.porties ?? {}).length > 0) {
        gevuld.add(dag.date);
      }
    }
    for (const [date, dag] of Object.entries(bewerkt)) {
      if (itemsTelling(dag.items) > 0) gevuld.add(date);
      else gevuld.delete(date);
    }
    return gevuld;
  }, [bewerkt, dagen]);

  const bewaar = useCallback(
    async (volgendeItems: DagItems, volgendWater: number | null) => {
      setBusy(true);
      setFout(null);
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            date: datum,
            items: serialiseerDagItems(volgendeItems),
            water_ml: volgendWater,
          }),
        });
        if (!response.ok) {
          setFout("Kon je dag niet opslaan. Probeer het zo nog eens.");
        }
      } catch {
        setFout("Kon je dag niet opslaan. Probeer het zo nog eens.");
      } finally {
        setBusy(false);
      }
    },
    [datum],
  );

  const zetDag = useCallback(
    (volgendeItems: DagItems, volgendWater: number | null) => {
      setBewerkt((vorige) => ({
        ...vorige,
        [datum]: { items: volgendeItems, waterMl: volgendWater },
      }));
      void bewaar(volgendeItems, volgendWater);
    },
    [bewaar, datum],
  );

  const voegToe = useCallback(
    (moment: EetmomentId, product: Voedingsmiddel) => {
      zetDag(voegItemToe(items, moment, product.key), waterMl);
      onItemToegevoegd?.(moment, product);
    },
    [items, onItemToegevoegd, waterMl, zetDag],
  );

  const zetPorties = useCallback(
    (moment: EetmomentId, key: string, porties: number) => {
      zetDag(zetItemPorties(items, moment, key, porties), waterMl);
    },
    [items, waterMl, zetDag],
  );

  const zetWater = useCallback(
    (ml: number | null) => {
      zetDag(items, ml);
    },
    [items, zetDag],
  );

  return {
    datum,
    vandaag,
    strip,
    gevuldeDagen,
    items,
    waterMl,
    geladen,
    busy,
    fout,
    kiesDatum: setDatum,
    voegToe,
    zetPorties,
    zetWater,
  };
}

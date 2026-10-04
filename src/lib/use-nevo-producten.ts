"use client";

import { useEffect, useState } from "react";
import { haalNevoProductenViaApi } from "@/lib/supermarkt-producten-client";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const LEEG: ReadonlyMap<string, SupermarktProduct> = new Map();

/**
 * NEVO-records voor een lijst codes, gesleuteld op `nevo:<code>`. Eén verzoek
 * per wijziging van de lijst. Tijdens laden blijven de vorige records staan
 * (een record verandert niet); een code die nog ontbreekt toont `n.o.`, nooit
 * een verzonnen getal.
 */
export function useNevoProducten(codes: readonly string[]): ReadonlyMap<string, SupermarktProduct> {
  const sleutel = codes.join(",");
  const [geladen, setGeladen] = useState<{ sleutel: string; producten: ReadonlyMap<string, SupermarktProduct> }>({
    sleutel: "",
    producten: LEEG,
  });

  useEffect(() => {
    if (sleutel === "") return;
    let afgebroken = false;
    void haalNevoProductenViaApi(sleutel.split(",")).then((producten) => {
      if (afgebroken) return;
      setGeladen((vorige) => {
        const samen = new Map(vorige.producten);
        for (const product of producten) samen.set(product.prodId, product);
        return { sleutel, producten: samen };
      });
    });
    return () => {
      afgebroken = true;
    };
  }, [sleutel]);

  return sleutel === "" ? LEEG : geladen.producten;
}

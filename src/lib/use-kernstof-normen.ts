"use client";

import { useEffect, useState } from "react";
import { STANDAARD_NORMEN, type KernstofNormen } from "@/lib/nutrition-normen";
import { fetchVoedingsdoelen } from "@/lib/voedingsdoelen-client";

let gedeeld: Promise<KernstofNormen> | null = null;

function laadNormen(): Promise<KernstofNormen> {
  gedeeld ??= fetchVoedingsdoelen()
    .then((weergave) => weergave.kernstofNormen ?? STANDAARD_NORMEN)
    .catch(() => {
      gedeeld = null;
      return STANDAARD_NORMEN;
    });
  return gedeeld;
}

/**
 * De normen per kernstof voor wie ingelogd is. Eén verzoek, gedeeld door krans,
 * patroon en agenda. Tot het antwoord er is, en als het mislukt, gelden de
 * {@link STANDAARD_NORMEN}: de hogere waarden, zodat er nooit een vinkje
 * verschijnt dat de persoonlijke norm niet zou geven.
 */
export function useKernstofNormen(): KernstofNormen {
  const [normen, setNormen] = useState<KernstofNormen>(STANDAARD_NORMEN);

  useEffect(() => {
    let actief = true;
    void laadNormen().then((geladen) => {
      if (actief) setNormen(geladen);
    });
    return () => {
      actief = false;
    };
  }, []);

  return normen;
}

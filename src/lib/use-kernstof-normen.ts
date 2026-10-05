"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LEEG_KERNSTOF_PROFIEL,
  type KernstofProfiel,
} from "@/lib/account-kernstof-profiel";
import type { VoedingsdoelenWeergave } from "@/lib/account-voedingsdoelen";
import { STANDAARD_NORMEN, type KernstofNormen } from "@/lib/nutrition-normen";
import { fetchVoedingsdoelen } from "@/lib/voedingsdoelen-client";

/**
 * De normen per kernstof en het eigen kernstofprofiel van wie ingelogd is.
 * Eén verzoek, gedeeld door krans, patroon, agenda en Je doelen. Tot het
 * antwoord er is, en als het mislukt, gelden de {@link STANDAARD_NORMEN}: de
 * hogere waarden, zodat er nooit een vinkje verschijnt dat de persoonlijke
 * norm niet zou geven.
 *
 * Past iemand zijn profiel aan (geslacht, 70+, streefwaarde), dan zet
 * {@link zetKernstofWeergave} het nieuwe antwoord hier neer en werkt elk
 * scherm dat deze hooks gebruikt meteen bij.
 */

type Toestand = { normen: KernstofNormen; profiel: KernstofProfiel };

const BEGIN: Toestand = { normen: STANDAARD_NORMEN, profiel: LEEG_KERNSTOF_PROFIEL };

let toestand: Toestand = BEGIN;
let geladen: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

function abonneer(luisteraar: () => void) {
  luisteraars.add(luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
  };
}

export function zetKernstofWeergave(weergave: Pick<VoedingsdoelenWeergave, "kernstofNormen" | "kernstofProfiel">) {
  toestand = {
    normen: weergave.kernstofNormen ?? STANDAARD_NORMEN,
    profiel: weergave.kernstofProfiel ?? LEEG_KERNSTOF_PROFIEL,
  };
  for (const luisteraar of luisteraars) luisteraar();
}

function laadEenmaal() {
  geladen ??= fetchVoedingsdoelen()
    .then(zetKernstofWeergave)
    .catch(() => {
      geladen = null;
    });
}

function useKernstofToestand(): Toestand {
  const huidig = useSyncExternalStore(abonneer, () => toestand, () => BEGIN);
  useEffect(() => {
    laadEenmaal();
  }, []);
  return huidig;
}

export function useKernstofNormen(): KernstofNormen {
  return useKernstofToestand().normen;
}

export function useKernstofProfiel(): KernstofProfiel {
  return useKernstofToestand().profiel;
}

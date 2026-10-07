"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  LEEG_KERNSTOF_PROFIEL,
  type KernstofProfiel,
} from "@/lib/account-kernstof-profiel";
import type { VoedingsdoelenWeergave } from "@/lib/account-voedingsdoelen";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { Voedingsrichting } from "@/lib/nutrition-voedingsrichting";
import type { GevolgdeNormen } from "@/data/nutrition/voedingsnormen";
import { STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN, type KernstofNormen } from "@/lib/nutrition-normen";
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

type Toestand = {
  normen: KernstofNormen;
  gevolgd: GevolgdeNormen;
  profiel: KernstofProfiel;
  /** Je eiwitdoel in gram: handmatig, anders de ondergrens van de richtlijn. Null zonder gewicht. */
  eiwitDoelG: number | null;
  /** Je gewone maaltijden uit Je doelen; null = alle drie. */
  gewoneMaaltijden: EetmomentId[] | null;
  /** Je richting uit Je doelen (`NUT_DOEL`); kiest alleen volgorde en tekst. */
  voedingsrichting: Voedingsrichting | null;
};

const BEGIN: Toestand = {
  normen: STANDAARD_NORMEN,
  gevolgd: STANDAARD_GEVOLGDE_NORMEN,
  profiel: LEEG_KERNSTOF_PROFIEL,
  eiwitDoelG: null,
  gewoneMaaltijden: null,
  voedingsrichting: null,
};

function eiwitDoelUit(weergave: Partial<Pick<VoedingsdoelenWeergave, "doelen" | "richtlijn">>): number | null | undefined {
  if (!("doelen" in weergave) && !("richtlijn" in weergave)) return undefined;
  const doel = weergave.doelen?.eiwitDoelG ?? weergave.richtlijn?.gramsLow ?? null;
  return doel !== null && doel > 0 ? doel : null;
}

let toestand: Toestand = BEGIN;
let geladen: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

function abonneer(luisteraar: () => void) {
  luisteraars.add(luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
  };
}

export function zetKernstofWeergave(
  weergave: Pick<VoedingsdoelenWeergave, "kernstofNormen" | "kernstofProfiel"> &
    Partial<Pick<VoedingsdoelenWeergave, "gevolgdeNormen" | "doelen" | "richtlijn">>,
) {
  const eiwitDoelG = eiwitDoelUit(weergave);
  toestand = {
    eiwitDoelG: eiwitDoelG === undefined ? toestand.eiwitDoelG : eiwitDoelG,
    gewoneMaaltijden: weergave.doelen ? weergave.doelen.gewoneMaaltijden : toestand.gewoneMaaltijden,
    voedingsrichting: weergave.doelen ? (weergave.doelen.voedingsrichting ?? null) : toestand.voedingsrichting,
    normen: weergave.kernstofNormen ?? STANDAARD_NORMEN,
    gevolgd: weergave.gevolgdeNormen ?? STANDAARD_GEVOLGDE_NORMEN,
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

/** De normen voor de gevolgde stoffen (buitenring, Patroon), uit dezelfde gedeelde toestand. */
export function useGevolgdeNormen(): GevolgdeNormen {
  return useKernstofToestand().gevolgd;
}

/** Je eiwitdoel in gram (handmatig, anders de richtlijn), uit dezelfde gedeelde toestand. */
export function useEiwitDoel(): number | null {
  return useKernstofToestand().eiwitDoelG;
}

/** Je gewone maaltijden (eetpatroon), uit dezelfde gedeelde toestand; null = alle drie. */
export function useGewoneMaaltijden(): EetmomentId[] | null {
  return useKernstofToestand().gewoneMaaltijden;
}

/** Je richting (`NUT_DOEL`), uit dezelfde gedeelde toestand; null = niet gekozen. */
export function useVoedingsrichting(): Voedingsrichting | null {
  return useKernstofToestand().voedingsrichting;
}

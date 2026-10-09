"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { DoelEvaluatie } from "@/lib/account-voedingsdoelen";

/**
 * De evaluatie van je doel (richtingdatum, startstanden, laatste "Houden") als
 * één gedeelde toestand: de stand-regel legt de startstand vast en het
 * evaluatieblok leest hem, zonder dat elk blok zelf ophaalt.
 *
 * Null tot er een antwoord is en bij een fout: dan zwijgen de blokken.
 */

let toestand: DoelEvaluatie | null = null;
let geladen: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

function zet(volgende: Partial<DoelEvaluatie>) {
  toestand = {
    gekozenOp: volgende.gekozenOp ?? null,
    startstand: volgende.startstand ?? {},
    bevestigdOp: volgende.bevestigdOp ?? null,
  };
  for (const luisteraar of luisteraars) luisteraar();
}

function abonneer(luisteraar: () => void) {
  luisteraars.add(luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
  };
}

async function haal(): Promise<void> {
  const response = await fetch("/api/account/doel-evaluatie", { credentials: "include" });
  if (!response.ok) throw new Error("laden mislukt");
  zet((await response.json()) as DoelEvaluatie);
}

export function herlaadDoelEvaluatie(): Promise<void> {
  geladen = haal().catch(() => {
    geladen = null;
  });
  return geladen;
}

export function useDoelEvaluatie(): DoelEvaluatie | null {
  const huidig = useSyncExternalStore(abonneer, () => toestand, () => null);
  useEffect(() => {
    geladen ??= haal().catch(() => {
      geladen = null;
    });
  }, []);
  return huidig;
}

async function stuur(body: Record<string, unknown>): Promise<DoelEvaluatie> {
  const response = await fetch("/api/account/doel-evaluatie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("opslaan mislukt");
  zet((await response.json()) as DoelEvaluatie);
  return toestand as DoelEvaluatie;
}

export function postStartstand(stof: string, stand: { aandeelPct: number; dagen: number }): Promise<DoelEvaluatie> {
  return stuur({ actie: "startstand", stof, ...stand });
}

export function postBevestig(): Promise<DoelEvaluatie> {
  return stuur({ actie: "bevestig" });
}

/** Voor tests: vergeet de gedeelde toestand, zodat elke test opnieuw ophaalt. */
export function wisDoelEvaluatieCache(): void {
  toestand = null;
  geladen = null;
}

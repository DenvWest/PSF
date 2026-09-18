"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Licht of donker voor het voedingsdashboard.
 *
 * ## Waarom dit bestaat
 *
 * Het dashboard stond op hardcoded donkere hex-waardes, verspreid door de
 * JSX. Daardoor was een licht thema niet "nog niet gebouwd" maar onmogelijk:
 * elke kleur zat vast in een component. De kleuren zijn nu tokens in
 * `globals.css` (`--vd-*`), en dit zet alleen het vlaggetje dat bepaalt welke
 * set geldt.
 *
 * ## Waarom de keuze de sessie niet overleeft
 *
 * `localStorage` mag niet in dit project — alles wat blijft hoort in Supabase.
 * Een themavoorkeur is die tabel (en die migratie) nu niet waard, en zonder
 * keuze volgt het scherm `prefers-color-scheme`, wat voor de meeste mensen al
 * het goede antwoord geeft. De schakelaar is er voor wie daarvan af wil wijken
 * op het moment zelf.
 *
 * Wil je hem wél laten blijven: dat is een kolom op `accounts` plus een
 * schrijfpad, geen verbouwing van dit bestand.
 */

export type VoedingThema = "systeem" | "licht" | "donker";

const ThemaContext = createContext<{
  thema: VoedingThema;
  setThema: (thema: VoedingThema) => void;
}>({ thema: "systeem", setThema: () => {} });

export function useVoedingThema() {
  return useContext(ThemaContext);
}

export function VoedingThemaProvider({ children }: { children: ReactNode }) {
  const [thema, setThema] = useState<VoedingThema>("systeem");

  return (
    <ThemaContext.Provider value={{ thema, setThema }}>
      {/*
        Het attribuut staat op een wrapper en niet op <html>: dit dashboard is
        één oppervlak binnen een site die verder licht is, en een root-attribuut
        zou de header en de footer meenemen.
      */}
      <div
        data-voeding-thema={thema === "systeem" ? undefined : thema}
        className="vd-root"
      >
        {children}
      </div>
    </ThemaContext.Provider>
  );
}

/** De schakelaar zelf — pil-vorm, zoals de `.themeBtn` uit de prebuild. */
export function VoedingThemaKnop() {
  const { thema, setThema } = useVoedingThema();

  const volgende: VoedingThema =
    thema === "donker" ? "licht" : thema === "licht" ? "systeem" : "donker";

  const label =
    thema === "donker" ? "Donker" : thema === "licht" ? "Licht" : "Systeem";

  return (
    <button
      type="button"
      onClick={() => setThema(volgende)}
      aria-label={`Weergave: ${label}. Klik voor ${
        volgende === "systeem" ? "systeeminstelling" : volgende
      }.`}
      className="vd-themaknop"
    >
      <span aria-hidden>
        {thema === "donker" ? "◐" : thema === "licht" ? "○" : "◑"}
      </span>
      {label}
    </button>
  );
}

"use client";

import type { ReactNode } from "react";

/**
 * Scope voor het gedeelde donkere voedingsdashboard-thema.
 *
 * ## Waarom dit nog een wrapper is en geen losse `<div className="vd-root">`
 *
 * `.vd-root` draagt de `--vd-*`-tokens uit `globals.css` (nu ook gebruikt door
 * Dagboek/Mijn Dag en CockpitShell). Tot 23 september 2026 zette deze
 * component ook een licht/donker-keuze via een schakelaar en een
 * `data-voeding-thema`-attribuut. Die keuze is vervallen: er is nog maar één
 * donker thema, en Dagboek had nooit een lichte variant. De losse
 * `VoedingThemaProvider`-naam blijft staan zodat bestaande imports
 * (`PatroonScherm.tsx`) niet per se hoeven te wijzigen.
 */
export function VoedingThemaProvider({ children }: { children: ReactNode }) {
  return <div className="vd-root">{children}</div>;
}

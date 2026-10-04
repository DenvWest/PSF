"use client";

import { useEffect, useState } from "react";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { trackEvent } from "@/lib/ga4";
import { isInformatieveStof, type InformatieveStof } from "@/lib/nutrition-rijkste-bronnen";
import { rondVoedingswaarde, type VoedingswaardeRij } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";

/**
 * "Ook gevolgd": de informatieve stoffen die iemand zelf koos, als kleine
 * ringen onder de krans (`BESLUIT_RIJKSTE_BRONNEN_EN_RINGTEGELS_2026-10.md`).
 *
 * Bewust níét in de krans: die draagt de telling van de vijf kernstoffen. Hier
 * geen telling, geen ✓ en geen stofkleur — één neutrale tint, zoals de
 * voedingswaardetabel en "Ook gevolgd" op Je patroon. De ring vult tot de RI;
 * een stof zonder RI (natrium, verzadigd vet, suikers) toont alleen het getal.
 *
 * Getallen komen uit dezelfde `berekenVoedingswaarde`-rijen als de tabel, en
 * de keuze uit `useGevolgdeStoffen`: geen tweede rekenpad, geen tweede opslag.
 * De "+" klapt dezelfde kiezer open als op Je doelen en Je patroon.
 */

const STRAAL = 22;
const DIKTE = 5;

function Ring({ vulling }: { vulling: number | null }) {
  const [getekend, setGetekend] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGetekend(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const deel = vulling === null ? 0 : Math.min(vulling, 1) * 100;

  return (
    <svg viewBox="0 0 56 56" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
      <circle
        cx="28"
        cy="28"
        r={STRAAL}
        fill="none"
        stroke="var(--vd-track)"
        strokeWidth={DIKTE}
        strokeDasharray={vulling === null ? "2 5" : undefined}
      />
      {deel > 0 ? (
        <circle
          cx="28"
          cy="28"
          r={STRAAL}
          fill="none"
          pathLength={100}
          stroke="var(--vd-ink-3)"
          strokeWidth={DIKTE}
          strokeLinecap="round"
          strokeDasharray={`${getekend ? deel : 0} 100`}
          className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700 motion-safe:ease-out"
        />
      ) : null}
    </svg>
  );
}

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function DagboekOokGevolgd({
  rijen,
  onKiesStof,
}: {
  rijen: readonly VoedingswaardeRij[];
  onKiesStof: (stof: InformatieveStof) => void;
}) {
  const { stoffen, geladen } = useGevolgdeStoffen();
  const [kiezen, setKiezen] = useState(false);

  if (!geladen) return null;

  const gevolgd = stoffen.flatMap((veld) => rijen.find((rij) => rij.veld === veld) ?? []);

  function wisselKiezer() {
    if (!kiezen) trackEvent("nutrition_dagboek_gevolgd_toevoegen_open", { gevolgd: gevolgd.length });
    setKiezen(!kiezen);
  }

  return (
    <section aria-labelledby="dagboek-ook-gevolgd" className="@container flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2 px-0.5">
        <h3 id="dagboek-ook-gevolgd" className="m-0 font-sans text-[12px] font-semibold text-[var(--vd-ink-2)]">
          Ook gevolgd
        </h3>
        <span className="text-[10.5px] text-[var(--vd-ink-4)]">zonder oordeel · % van de RI</span>
      </div>

      <ul className="m-0 flex list-none snap-x snap-mandatory gap-2 overflow-x-auto p-0 pb-1 [scrollbar-width:none] @[520px]:grid @[520px]:grid-cols-5 @[520px]:overflow-visible">
        {gevolgd.map((rij) => {
          const tikbaar = isInformatieveStof(rij.veld);
          const midden =
            rij.aandeel !== null ? `${Math.round(rij.aandeel * 100)}%` : rij.waarde !== null ? rondVoedingswaarde(rij.waarde) : "—";
          const onder =
            rij.waarde === null ? "n.o." : rij.aandeel !== null ? `${rondVoedingswaarde(rij.waarde)} ${rij.unit}` : rij.unit;
          const inhoud = (
            <>
              <span className="relative block h-14 w-14">
                <Ring vulling={rij.aandeel} />
                <span className="absolute inset-0 flex items-center justify-center font-serif text-[13px] leading-none text-[var(--vd-ink)]">
                  {midden}
                </span>
              </span>
              <span className="max-w-full truncate text-[10.5px] font-semibold leading-tight text-[var(--vd-ink-2)]">
                {hoofdletter(rij.label)}
              </span>
              <span className="font-mono text-[9.5px] tabular-nums text-[var(--vd-ink-4)]">{onder}</span>
            </>
          );
          const kaart =
            "flex w-full flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-1 py-2.5 text-center";
          return (
            <li key={rij.veld} className="w-[86px] shrink-0 snap-start @[520px]:w-auto">
              {tikbaar ? (
                <button
                  type="button"
                  onClick={() => onKiesStof(rij.veld as InformatieveStof)}
                  aria-label={`${hoofdletter(rij.label)}: rijkste bronnen`}
                  className={`${kaart} cursor-pointer transition-colors hover:border-white/20 hover:bg-white/[0.05]`}
                >
                  {inhoud}
                </button>
              ) : (
                <div className={kaart}>{inhoud}</div>
              )}
            </li>
          );
        })}
        <li className="w-[86px] shrink-0 snap-start @[520px]:w-auto">
          <button
            type="button"
            onClick={wisselKiezer}
            aria-expanded={kiezen}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 px-1 py-2.5 text-center text-[var(--vd-ink-3)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
          >
            <span aria-hidden className="text-[20px] leading-none">
              {kiezen ? "×" : "+"}
            </span>
            <span className="text-[10.5px] font-semibold leading-tight">
              {kiezen ? "Klaar" : gevolgd.length > 0 ? "Stoffen kiezen" : "Volg ook vezels, calcium…"}
            </span>
          </button>
        </li>
      </ul>

      {kiezen ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-[var(--vd-ink-2)]">
          <GevolgdeStoffenKiezer surface="dagboek" />
        </div>
      ) : null}
    </section>
  );
}

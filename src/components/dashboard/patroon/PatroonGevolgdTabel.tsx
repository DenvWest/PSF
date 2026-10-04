"use client";

import { useState } from "react";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import { trackEvent } from "@/lib/ga4";
import type { GevolgdeReeks } from "@/lib/nutrition-gevolgde-vensters";
import type { VensterLengte } from "@/lib/nutrition-tekortsysteem";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";

/**
 * "Ook gevolgd": de stoffen die je zelf koos, onder de kernstoffen en in
 * dezelfde vier kolommen. Informatief — neutrale tint, geen ✓, geen
 * richting, geen link naar een vergelijking (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`,
 * "Herziening"). Waar een RI bestaat staat het deel daarvan in de cel, anders
 * het gemiddelde zelf.
 *
 * De "+" opent dezelfde kiezer als op Je doelen; beide schrijven naar
 * dezelfde lijst.
 */
export default function PatroonGevolgdTabel({
  reeksen,
  zelfde,
}: {
  reeksen: readonly GevolgdeReeks[];
  /** Vensters zonder nieuwe dagen, gelijk aan de kernstoffentabel erboven. */
  zelfde: ReadonlySet<VensterLengte>;
}) {
  const [kiezen, setKiezen] = useState(false);

  function wisselKiezer() {
    if (!kiezen) trackEvent("nutrition_patroon_gevolgd_toevoegen_open", { gevolgd: reeksen.length });
    setKiezen(!kiezen);
  }

  return (
    <section aria-labelledby="patroon-ook-gevolgd" className="vd-tabel">
      <div className="vd-tabel-kop">
        <span id="patroon-ook-gevolgd">Ook gevolgd · zonder oordeel</span>
      </div>

      {reeksen.map((reeks) => (
        <div key={reeks.veld} className="vd-tabel-rij vd-venster-rij">
          <span className="vd-naam">
            {reeks.label.charAt(0).toUpperCase() + reeks.label.slice(1)}
            <i>{reeks.ri !== null ? `RI ${rondVoedingswaarde(reeks.ri)} ${reeks.unit}` : "gem. per dag"}</i>
          </span>

          {reeks.vensters.map((venster) => {
            const vulling = venster.aandeel === null ? 0 : Math.min(Math.round(venster.aandeel * 100), 100);
            return (
              <span
                key={venster.dagen_terug}
                className="vd-cel"
                data-zelfde={zelfde.has(venster.dagen_terug) ? "ja" : "nee"}
              >
                {vulling > 0 ? (
                  <span className="bg-[var(--vd-ink-3)]" style={{ width: `${vulling}%` }} />
                ) : null}
                <b data-gevuld={vulling > 0 ? "ja" : "nee"}>
                  {venster.dagen === 0 || venster.gemiddeld === null
                    ? "—"
                    : venster.aandeel !== null
                      ? percentageADH(venster.aandeel)
                      : `${rondVoedingswaarde(venster.gemiddeld)} ${reeks.unit}`}
                </b>
              </span>
            );
          })}

          <span className="vd-trend" aria-hidden />
        </div>
      ))}

      <div className="vd-tabel-rij grid gap-3">
        <button
          type="button"
          aria-expanded={kiezen}
          onClick={wisselKiezer}
          className="w-fit cursor-pointer border-0 bg-transparent p-0 text-left text-[12.5px] font-semibold text-[var(--vd-sage-2)] hover:underline"
        >
          {kiezen ? "Klaar" : reeksen.length > 0 ? "+ Stof toevoegen of weghalen" : "+ Volg ook vezels, calcium, ijzer…"}
        </button>
        {kiezen ? (
          <div className="text-[var(--vd-ink-2)]">
            <GevolgdeStoffenKiezer surface="patroon" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

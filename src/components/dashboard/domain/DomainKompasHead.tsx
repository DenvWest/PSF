"use client";

import type { ReactNode } from "react";
import KompasDomainGauge from "@/components/app/KompasDomainGauge";
import { DeltaBadge } from "@/components/app/primitives";

export type DomainKompasHeadProps = {
  /** "Beweging", "Slaap" — draagt de enige <h1> van het scherm. */
  label: string;
  score: number;
  /** "Gemiddeld", "Onder gemiddeld" — de bandnaam bij het cijfer. */
  bandLabel: string;
  /** "gemeten vandaag", "nog geen beweegcheck". */
  measuredLine: string;
  delta?: number | null;
  /** De conclusiezin uit de check, of wat er zonder check te zeggen valt. */
  statusLine: string;
  /** De voorbehoud-regel bij het cijfer, tussen de stand en de ladder. */
  noteLine?: string | null;
  /** De ladder. Staat ín de kop, niet als tweede blok eronder (lock N6). */
  children?: ReactNode;
};

/**
 * De domeinkaart bovenaan een Kompas-domeinscherm: ring, naam, stand, en de
 * ladder eronder.
 *
 * Dit is `kdome` uit slaap v2 (`renderK`, r.1475) in React. Wat het vervangt is
 * een CockpitTile met een gauge van 120px en geen kop — beweging was daardoor
 * het enige domein waar je scherm niet vertelde welk domein je open had, en de
 * halve eerste schermhoogte ging op aan één cijfer.
 *
 * Domein-agnostisch met opzet: de vier domeinen die nu nog een prebuild-iframe
 * zijn komen hier langs zodra ze naar React verhuizen, en dan hoort de kop
 * hetzelfde te zijn zonder dat er iets gekopieerd wordt.
 *
 * Sinds 20 augustus geen sparkline meer rechtsboven — die lijn oogde als
 * ruis naast het cijfer en kwam op geen enkel domeinscherm tot zijn recht.
 * De ring die overblijft is groter en steviger: hij draagt nu het
 * zwaartepunt van de kop in plaats van een klein rondje naast de titel.
 */
export default function DomainKompasHead({
  label,
  score,
  bandLabel,
  measuredLine,
  delta = null,
  statusLine,
  children,
  noteLine = null,
}: DomainKompasHeadProps) {
  return (
    <section
      aria-label={`${label} — je stand`}
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <KompasDomainGauge value={score} label={label} size={104} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 font-serif text-[27px] font-normal leading-tight text-[#F1EFE8]">
            {label}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#7E8C82]">
            <span>
              {bandLabel} · {measuredLine}
            </span>
            {delta != null ? <DeltaBadge delta={delta} /> : null}
          </p>
        </div>
      </div>

      <p className="mt-3.5 max-w-[56ch] text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
        {statusLine}
      </p>

      {noteLine ? (
        <p className="mt-3 max-w-[58ch] border-l border-white/10 pl-2.5 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
          {noteLine}
        </p>
      ) : null}

      {children}
    </section>
  );
}

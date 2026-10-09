"use client";

import type { MaaltijdProduct } from "@/lib/nutrition-maaltijd-patroon";
import {
  aandeelVan,
  adhRegelKernstof,
  adhRegelVeld,
  doelRegel,
  normRegel,
  referentieVoorKernstof,
  referentieVoorVeld,
} from "@/lib/nutrition-maaltijd-referentie";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeNormen, useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * Wat één product op je maaltijd leverde, gemiddeld per keer dat je het at:
 * per stof de hoeveelheid, het deel van je dagnorm, je eigen doel als je er
 * een zette, en de ADH zoals die op het etiket staat. Geen kleur en geen
 * vinkje: één product haalt geen dagnorm.
 */

const MACROS = ["energyKcal", "proteinG", "carbohydrateG", "fatG"] as const;

type Regel = {
  sleutel: string;
  label: string;
  waarde: number;
  unit: string;
  benaderd: boolean;
  aandeel: number | null;
  onder: string[];
};

export default function PatroonMaaltijdProduct({ product }: { product: MaaltijdProduct }) {
  const normen = useKernstofNormen();
  const gevolgd = useGevolgdeNormen();
  const profiel = useKernstofProfiel();

  const macro = MACROS.flatMap((veld) => {
    const r = product.rijen.find((rij) => rij.veld === veld);
    if (!r || r.waarde === null) return [];
    return [`${veld === "energyKcal" ? "" : `${r.label.toLowerCase()} `}${r.benaderd ? "≈ " : ""}${rondVoedingswaarde(r.waarde)} ${r.unit}`];
  });

  const regels: Regel[] = [
    ...product.rijen
      .filter((r) => !MACROS.includes(r.veld as (typeof MACROS)[number]) && !r.waarvan && r.waarde !== null && r.waarde > 0)
      .map((r): Regel => {
        const ref = referentieVoorVeld(r.veld, gevolgd, profiel);
        return {
          sleutel: r.veld,
          label: r.label,
          waarde: r.waarde ?? 0,
          unit: r.unit,
          benaderd: r.benaderd === true,
          aandeel: aandeelVan(ref, r.waarde),
          onder: [normRegel(ref) ?? "geen dagnorm", doelRegel(ref, r.waarde, r.unit), adhRegelVeld(r.aandeelRi)].filter(
            (regel): regel is string => regel !== null,
          ),
        };
      }),
    ...product.kernstoffen
      .filter((k) => k.gemiddeld !== null && k.gemiddeld > 0)
      .map((k): Regel => {
        const ref = referentieVoorKernstof(k.nutrient, normen, profiel);
        return {
          sleutel: k.nutrient,
          label: k.label,
          waarde: k.gemiddeld ?? 0,
          unit: k.unit,
          benaderd: k.benaderd,
          aandeel: aandeelVan(ref, k.gemiddeld),
          onder: [normRegel(ref), doelRegel(ref, k.gemiddeld, k.unit), adhRegelKernstof(k.nutrient, k.gemiddeld)].filter(
            (regel): regel is string => regel !== null,
          ),
        };
      }),
  ];

  return (
    <div className="border-b border-[var(--vd-line)] bg-[var(--vd-surface-2)] px-3 py-2.5">
      <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">
        Per keer gemiddeld{" "}
        {product.eenheid === "g" ? `${product.hoeveelheid} g` : `${product.hoeveelheid}×`}
        {macro.length > 0 ? ` · ${macro.join(" · ")}` : ""}
      </p>

      {regels.length === 0 ? (
        <p className="m-0 mt-1.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
          Van dit product is geen gehalte bekend voor de stoffen die je patroon volgt.
        </p>
      ) : (
        <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
          {regels.map((regel) => (
            <li key={regel.sleutel} className="grid grid-cols-[1fr_64px_52px] items-start gap-2">
              <span className="vd-naam">
                {regel.label}
                {regel.onder.map((tekst) => (
                  <i key={tekst}>{tekst}</i>
                ))}
              </span>
              <span className="vd-getal">
                {regel.benaderd ? "≈ " : ""}
                {rondVoedingswaarde(regel.waarde)} {regel.unit}
              </span>
              <span className="vd-getal">
                {regel.aandeel === null ? "—" : `${regel.benaderd ? "≈ " : ""}${percentageADH(regel.aandeel)}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="m-0 mt-2 text-[0.625rem] leading-relaxed text-[var(--vd-ink-4)]">
        Het percentage is het deel van je dagnorm. De ADH op het etiket is een vaste wettelijke waarde voor
        iedereen; je norm hangt af van wie je bent, daarom verschillen ze.
      </p>
    </div>
  );
}

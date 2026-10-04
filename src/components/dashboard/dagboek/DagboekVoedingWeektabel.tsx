"use client";

import { weekLabel } from "@/lib/nutrition-weekoverzicht";
import type { VoedingWeekoverzicht, VoedingWeekRij } from "@/lib/nutrition-voeding-weekoverzicht";

/**
 * De Gem./Doel/Over-tabel met week-navigatie voor Laag B (Voedingsstoffen- en
 * Macro's-tabblad) — naar `PatroonScherm.tsx`'s `.vd-weekbalk`/`.vd-tabel--los`,
 * toegepast op `VoedingWeekoverzicht` in plaats van het tekortsysteem. Zelfde
 * CSS-klassen, geen nieuwe styling. Telt catalogus- en etiketproducten, net
 * als de dagtabel erboven.
 *
 * `rijen` wordt meegegeven (niet het hele overzicht doorgerekend hier) zodat
 * "Voedingsstoffen" en "Macro's" dezelfde tabelvorm delen met een andere
 * rij-selectie (bijv. Macro's toont alleen koolhydraten/vet/eiwit).
 */
export default function DagboekVoedingWeektabel({
  overzicht,
  rijen,
  onVorigeWeek,
  onVolgendeWeek,
  isHuidigeWeek,
}: {
  overzicht: VoedingWeekoverzicht;
  rijen: readonly VoedingWeekRij[];
  onVorigeWeek: () => void;
  onVolgendeWeek: () => void;
  isHuidigeWeek: boolean;
}) {
  return (
    <>
      <div className="vd-weekbalk">
        <button
          type="button"
          onClick={onVorigeWeek}
          aria-label="Vorige week"
          className="vd-blader"
        >
          ‹
        </button>
        <h3 className="vd-weektitel">{weekLabel(overzicht.start, overzicht.eind)}</h3>
        <button
          type="button"
          onClick={onVolgendeWeek}
          disabled={isHuidigeWeek}
          aria-label="Volgende week"
          className="vd-blader"
        >
          ›
        </button>
      </div>

      <p className="vd-note" style={{ marginTop: 0 }}>
        {overzicht.dagenGeregistreerd === 0 ? (
          "In deze week staat nog niets in je dagboek."
        ) : (
          <>
            Je registreerde{" "}
            <strong>
              {overzicht.dagenGeregistreerd}{" "}
              {overzicht.dagenGeregistreerd === 1 ? "dag" : "dagen"}
            </strong>{" "}
            in deze week. Alles hieronder is het gemiddelde daarover.
            {overzicht.zonderWaarde > 0
              ? ` ${overzicht.zonderWaarde === 1 ? "1 product had" : `${overzicht.zonderWaarde} producten hadden`} geen waarden, dus dit is minstens wat je binnenkreeg.`
              : null}
          </>
        )}
      </p>

      <div className="vd-tabel vd-tabel--los">
        <div className="vd-tabel-kop vd-week-kop">
          <span>Stof</span>
          <span>Gem.</span>
          <span>Doel</span>
        </div>

        {rijen.map((rij) => (
          <div key={rij.veld} className="vd-tabel-rij vd-week-rij">
            <span className="vd-naam">
              <span className="vd-naam-kop">{rij.label}</span>
              <i>
                {overzicht.dagenGeregistreerd === 0
                  ? "nog niets geregistreerd"
                  : rij.doel === null
                    ? "geen doel ingesteld"
                    : rij.over === null
                      ? `${rij.doel} ${rij.unit} — doel gehaald`
                      : `nog ${rij.over} ${rij.unit} tot ${rij.doel} ${rij.unit}`}
              </i>
            </span>

            <span className="vd-getal">
              {overzicht.dagenGeregistreerd === 0 ? "n.o." : `${rij.gemiddeld} ${rij.unit}`}
            </span>

            <span className="vd-cel">
              <b data-gevuld="nee">
                {rij.doel === null ? "—" : `${rij.doel} ${rij.unit}`}
              </b>
            </span>
          </div>
        ))}
      </div>

      <p className="vd-note">
        <strong>Informatief, geen tekort-oordeel.</strong> Dit doel is wat jij
        zelf instelde bij Je doelen — het systeem berekent hier niets voor.
      </p>
    </>
  );
}

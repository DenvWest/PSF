"use client";

import { useState } from "react";
import MaandKalender, { maandVan } from "@/components/dashboard/shared/MaandKalender";
import {
  MAX_PERIODE_DAGEN,
  periodeLabel,
  periodeTussen,
  periodeVoorKeuze,
  verschuifDag,
  type Periode,
  type PeriodeKeuze,
} from "@/lib/nutrition-periode";

/**
 * Eén periodekiezer voor Per maaltijd en Per stof: Vandaag · 7 dagen ·
 * 30 dagen · Kies. "Kies" klapt een maandkalender open. Tik een dag en je
 * kijkt naar die dag; tik een tweede dag en de periode loopt ertussen.
 *
 * Een stipje onder een dag betekent dat er iets geregistreerd is. Dagen
 * verder terug dan {@link MAX_PERIODE_DAGEN} of na vandaag zijn niet te
 * kiezen.
 */

const SNEL: readonly { id: Exclude<PeriodeKeuze, "eigen">; label: string }[] = [
  { id: "vandaag", label: "Vandaag" },
  { id: "7", label: "7 dagen" },
  { id: "30", label: "30 dagen" },
];

export default function PatroonPeriodeKiezer({
  keuze,
  periode,
  vandaag,
  geregistreerd,
  onKies,
}: {
  keuze: PeriodeKeuze;
  periode: Periode;
  vandaag: string;
  /** Datums met minstens één product. */
  geregistreerd: ReadonlySet<string>;
  onKies: (keuze: PeriodeKeuze, periode: Periode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [maand, setMaand] = useState(() => maandVan(periode.tot));
  const [eersteTik, setEersteTik] = useState<string | null>(null);

  const vroegste = verschuifDag(vandaag, -(MAX_PERIODE_DAGEN - 1));

  function tik(datum: string) {
    if (eersteTik === null) {
      setEersteTik(datum);
      onKies("eigen", { van: datum, tot: datum });
    } else {
      setEersteTik(null);
      onKies("eigen", periodeTussen(eersteTik, datum));
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div className="vd-segment !flex flex-1" role="group" aria-label="Periode">
          {SNEL.map((optie) => (
            <button
              key={optie.id}
              type="button"
              aria-pressed={keuze === optie.id}
              onClick={() => {
                setOpen(false);
                setEersteTik(null);
                onKies(optie.id, periodeVoorKeuze(optie.id, vandaag));
              }}
              className="flex-1 !px-1"
            >
              {optie.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={keuze === "eigen"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex-1 !px-1"
          >
            Kies
          </button>
        </div>
      </div>

      <p className="vd-tag mt-1.5 mb-0" aria-live="polite">
        {periodeLabel(periode)}
        {eersteTik !== null ? " · tik een tweede dag voor een reeks" : ""}
      </p>

      {open ? (
        <MaandKalender
          maand={maand}
          onMaand={setMaand}
          vroegste={vroegste}
          vandaag={vandaag}
          geregistreerd={geregistreerd}
          isRand={(datum) => datum === periode.van || datum === periode.tot}
          isGekozen={(datum) => datum >= periode.van && datum <= periode.tot}
          onTik={tik}
          voetnoot={`● = dag met registratie · maximaal ${MAX_PERIODE_DAGEN} dagen terug`}
        />
      ) : null}
    </div>
  );
}

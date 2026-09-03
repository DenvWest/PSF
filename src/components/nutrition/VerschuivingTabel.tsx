"use client";

import { surfaceStyles } from "@/lib/dashboard-surface";
import {
  verschuivingBronregel,
  type Verschuiving,
} from "@/lib/voedingsbasis-verschuiving";

/**
 * De verschuivingstabel: je antwoorden per categorie, per meetmoment.
 *
 * Zie `src/lib/voedingsbasis-verschuiving.ts` voor waarom hier antwoorden staan
 * en geen pijlen — de meetmomenten dragen bewust geen positie, dus een pijl
 * omhoog zou verzonnen zijn.
 *
 * **Waarom hij aansluit op de kop.** De tabel hoort bij de categorieën
 * eronder: hij zegt hoe díé stand tot stand kwam. Een losse kaart met eigen
 * rand ertussen zou hem tot een apart blok maken, terwijl het dezelfde vraag
 * beantwoordt in de tijd.
 */

export default function VerschuivingTabel({
  verschuiving,
}: {
  verschuiving: Verschuiving;
}) {
  const s = surfaceStyles("dashboard");

  if (verschuiving.momenten.length < 2 || verschuiving.rijen.length === 0) {
    return null;
  }

  const bronregel = verschuivingBronregel(verschuiving);

  return (
    <div className="overflow-hidden rounded-b-xl border border-t-0 border-white/10 bg-black/25">
      {bronregel ? (
        <p className={`m-0 px-3.5 pb-2 pt-2.5 text-[11px] leading-relaxed ${s.zacht}`}>
          {bronregel}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Je antwoorden per categorie, per meetmoment — nieuwste links
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={`sticky left-0 bg-[#141d1a] py-2 pl-3.5 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] ${s.zacht}`}
              >
                Categorie
              </th>
              {verschuiving.momenten.map((moment, index) => (
                <th
                  key={`${moment.dateLabel}-${index}`}
                  scope="col"
                  className="whitespace-nowrap py-2 pr-3.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em]"
                >
                  {/* De datum draagt de kolom; "nu" erbij zegt welke van de
                      vier je huidige stand is, zonder de datum te vervangen —
                      een verschuiving zonder tijdvak is niet te wegen. */}
                  <span className={index === 0 ? s.tekst : s.zacht}>{moment.dateLabel}</span>
                  {index === 0 ? (
                    <span className="ml-1.5 text-[9px] font-semibold text-[#9CC5A9]">nu</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {verschuiving.rijen.map((rij) => (
              <tr key={rij.categorieId} className={`border-t ${s.rij}`}>
                <th
                  scope="row"
                  className={`sticky left-0 bg-[#141d1a] py-2 pl-3.5 pr-3 text-left text-[12px] font-medium ${s.tekst}`}
                >
                  <span className="flex items-center gap-1.5">
                    {rij.label}
                    {rij.veranderd ? (
                      <span
                        aria-label="veranderd"
                        title="Ander antwoord dan je eerste meting"
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#9CC5A9]"
                      />
                    ) : null}
                  </span>
                </th>
                {rij.cellen.map((cel, index) => (
                  <td
                    key={index}
                    className={`whitespace-nowrap py-2 pr-3.5 text-[12px] ${
                      index === 0 ? s.tekst : s.zacht
                    }`}
                  >
                    {cel.answerLabel ?? <span className="text-[#5F6C64]">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { clarityTag } from "@/lib/clarity";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { MaaltijdPatroon, MaaltijdRij } from "@/lib/nutrition-maaltijd-patroon";
import { aandeelVanNorm } from "@/lib/nutrition-normen";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import { trackEvent } from "@/lib/ga4";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";

/**
 * Per maaltijd: wat ligt er gemiddeld op je ontbijt, je lunch, je avondeten.
 *
 * De maaltijden zijn de kop van het scherm (een segmentrij), omdat mensen hun
 * dag per moment terughalen en niet per stof (zie `nutrition-eetmomenten.ts`).
 * Daaronder: energie en macro's als tegels, dan alle micronutriënten en
 * kernstoffen in één tabel met het gemiddelde, de dichtheid per 100 kcal en
 * het aandeel van de dagelijkse referentie. Onderaan de maaltijden naast
 * elkaar, zodat je ziet welke zijn calorieën het rijkst besteedt.
 *
 * Geen oordeel per maaltijd: %RI is een etiketvermelding, geen doel per
 * maaltijd. Macro's krijgen geen percentage (macro-besluit §0.1).
 */

const MACRO_TEGELS = ["energyKcal", "proteinG", "carbohydrateG", "fatG"] as const;

function rij(maaltijd: MaaltijdPatroon, veld: string): MaaltijdRij | undefined {
  return maaltijd.rijen.find((r) => r.veld === veld);
}

function getal(waarde: number | null | undefined): string {
  return waarde === null || waarde === undefined ? "—" : rondVoedingswaarde(waarde);
}

export default function PatroonMaaltijden({
  patroon,
  periodeDagen,
}: {
  patroon: readonly MaaltijdPatroon[];
  periodeDagen: number;
}) {
  const normen = useKernstofNormen();
  const [moment, setMoment] = useState<EetmomentId>(
    () => patroon.find((m) => m.keer > 0)?.moment ?? "ontbijt",
  );
  const maaltijd = patroon.find((m) => m.moment === moment) ?? patroon[0];
  if (!maaltijd) return null;

  const kies = (volgende: EetmomentId) => {
    setMoment(volgende);
    trackEvent("nutrition_patroon_maaltijd_gekozen", { moment: volgende });
    clarityTag("nutrition_patroon_maaltijd", volgende);
  };

  const kcal = rij(maaltijd, "energyKcal")?.waarde ?? null;
  const tabelRijen = maaltijd.rijen.filter((r) => r.veld !== "energyKcal");
  const metKeer = patroon.filter((m) => m.keer > 0);

  return (
    <section aria-label="Gemiddeld per maaltijd">
      <div className="vd-segment mb-3 !flex w-full" role="group" aria-label="Kies een maaltijd">
        {patroon.map((m) => (
          <button
            key={m.moment}
            type="button"
            aria-pressed={m.moment === moment}
            onClick={() => kies(m.moment)}
            className="flex-1 !px-1"
          >
            {m.label}
          </button>
        ))}
      </div>

      {maaltijd.keer === 0 ? (
        <p className="vd-note" style={{ marginTop: 0 }}>
          De laatste {periodeDagen} dagen staat er bij {maaltijd.label.toLowerCase()} nog niets
          geregistreerd. Vul het in je dagboek in — dan zie je hier wat er gemiddeld op je bord ligt.
        </p>
      ) : (
        <>
          <p className="vd-eyebrow" style={{ margin: "0 0 0.5rem" }}>
            Gemiddeld per {maaltijd.label.toLowerCase()} · {maaltijd.keer} keer in {periodeDagen} dagen
          </p>

          <div className="mb-3 grid grid-cols-4 gap-2">
            {MACRO_TEGELS.map((veld) => {
              const r = rij(maaltijd, veld);
              return (
                <div
                  key={veld}
                  className="rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] px-2 py-2.5 text-center"
                >
                  <span className="block text-[0.625rem] text-[var(--vd-ink-3)]">
                    {veld === "energyKcal" ? "Energie" : r?.label}
                  </span>
                  <b className="block font-mono text-[0.9375rem] text-[var(--vd-ink)]">
                    {getal(r?.waarde)}
                  </b>
                  <span className="block text-[0.625rem] text-[var(--vd-ink-3)]">{r?.unit}</span>
                </div>
              );
            })}
          </div>

          <div className="vd-tabel">
            <div className="vd-tabel-kop grid-cols-[1fr_58px_58px_52px]">
              <span>Stof</span>
              <span>Gem.</span>
              <span>/100 kcal</span>
              <span>ADH</span>
            </div>

            {tabelRijen.map((r) => (
              <div key={r.veld} className="vd-tabel-rij grid-cols-[1fr_58px_58px_52px]">
                <span className={`vd-naam ${r.waarvan ? "pl-3 !font-normal !text-[var(--vd-ink-2)]" : ""}`}>
                  {r.label}
                </span>
                <span className="vd-getal">
                  {getal(r.waarde)} {r.waarde === null ? "" : r.unit}
                </span>
                <span className="vd-getal">{getal(r.per100kcal)}</span>
                <span className="vd-getal">{r.aandeel === null ? "—" : percentageADH(r.aandeel)}</span>
              </div>
            ))}

            <div className="vd-tabel-kop">
              <span className="!text-left">Kernstoffen · tegen je dagnorm</span>
            </div>
            {maaltijd.kernstoffen.map((k) => {
              const aandeel = k.gemiddeld === null ? null : aandeelVanNorm(normen, k.nutrient, k.gemiddeld);
              return (
                <div key={k.nutrient} className="vd-tabel-rij grid-cols-[1fr_58px_58px_52px]">
                  <span className="vd-naam">
                    {k.label}
                    {k.uitSupplement ? (
                      <i>
                        waarvan {rondVoedingswaarde(k.uitSupplement)} {k.unit} uit supplement
                      </i>
                    ) : null}
                  </span>
                  <span className="vd-getal">
                    {k.gemiddeld === null ? "n.o." : `${rondVoedingswaarde(k.gemiddeld)} ${k.unit}`}
                  </span>
                  <span className="vd-getal">
                    {k.gemiddeld === null || kcal === null || kcal <= 0
                      ? "—"
                      : rondVoedingswaarde((k.gemiddeld / kcal) * 100)}
                  </span>
                  <span className="vd-getal">{percentageADH(aandeel)}</span>
                </div>
              );
            })}
          </div>

          {maaltijd.zonderWaarde > 0 || maaltijd.supplementen > 0 ? (
            <p className="vd-note">
              {maaltijd.zonderWaarde > 0
                ? `${maaltijd.zonderWaarde} ${maaltijd.zonderWaarde === 1 ? "product droeg" : "producten droegen"} geen voedingswaarde bij — de getallen zijn een ondergrens. `
                : ""}
              {maaltijd.supplementen > 0
                ? `Supplementen tellen alleen mee bij hun eigen kernstof (${maaltijd.supplementen} keer genomen bij ${maaltijd.label.toLowerCase()}).`
                : ""}
            </p>
          ) : null}
        </>
      )}

      {metKeer.length > 1 ? (
        <>
          <p className="vd-eyebrow" style={{ margin: "1.25rem 0 0.375rem" }}>
            Hoe rijk is elke maaltijd · per 100 kcal
          </p>
          <div className="vd-tabel">
            <div className="vd-tabel-kop grid-cols-[1fr_56px_52px_52px]">
              <span>Maaltijd</span>
              <span>kcal</span>
              <span>Eiwit</span>
              <span>Vezels</span>
            </div>
            {metKeer.map((m) => (
              <button
                key={m.moment}
                type="button"
                onClick={() => kies(m.moment)}
                aria-pressed={m.moment === moment}
                className="vd-tabel-rij w-full cursor-pointer grid-cols-[1fr_56px_52px_52px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit aria-pressed:bg-[var(--vd-surface-2)]"
              >
                <span className="vd-naam">{m.label}</span>
                <span className="vd-getal">{getal(rij(m, "energyKcal")?.waarde)}</span>
                <span className="vd-getal">{getal(rij(m, "proteinG")?.per100kcal)} g</span>
                <span className="vd-getal">{getal(rij(m, "fiberG")?.per100kcal)} g</span>
              </button>
            ))}
          </div>
          <p className="vd-note">
            Per 100 kcal zie je welke maaltijd zijn calorieën het meest laat opleveren, los van hoe groot hij
            is. Kosten per maaltijd tonen we nog niet: daar is nog geen betrouwbare prijsbron voor.
          </p>
        </>
      ) : null}
    </section>
  );
}

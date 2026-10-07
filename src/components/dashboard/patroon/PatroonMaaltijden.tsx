"use client";

import { Fragment, useState } from "react";
import PatroonMaaltijdProduct from "@/components/dashboard/patroon/PatroonMaaltijdProduct";
import { clarityTag } from "@/lib/clarity";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { MaaltijdPatroon, MaaltijdRij } from "@/lib/nutrition-maaltijd-patroon";
import {
  aandeelVan,
  doelRegel,
  normRegel,
  referentieVoorKernstof,
  referentieVoorVeld,
  sterksteBijdragen,
} from "@/lib/nutrition-maaltijd-referentie";
import { datumsTussen, periodeLabel, type Periode } from "@/lib/nutrition-periode";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import { trackEvent } from "@/lib/ga4";
import { useGevolgdeNormen, useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * Per maaltijd: wat ligt er gemiddeld op je ontbijt, je lunch, je avondeten.
 *
 * De maaltijden zijn de kop van het scherm (een segmentrij), omdat mensen hun
 * dag per moment terughalen en niet per stof (zie `nutrition-eetmomenten.ts`).
 * Daaronder: energie en macro's als tegels, dan alle micronutriënten en
 * kernstoffen in één tabel met het gemiddelde, de dichtheid per 100 kcal en
 * het aandeel van je persoonlijke dagnorm. Onderaan de maaltijden naast
 * elkaar, zodat je ziet welke zijn calorieën het rijkst besteedt.
 *
 * Geen oordeel per maaltijd: de norm is een dagnorm, geen doel per maaltijd. Macro's krijgen geen percentage (macro-besluit §0.1).
 *
 * Elke rij zegt waartegen hij rekent: de norm met bron, en je eigen doel als
 * je er een zette (`nutrition-maaltijd-referentie.ts`). Een tik op een product
 * in "Wat je at" toont wat dat product alleen leverde.
 */

const GEEN_NORM: Partial<Record<string, string>> = {
  proteinG: "doel op Je doelen (gewicht en activiteit)",
  fiberG: "norm volgt uit je gewicht op Je doelen",
};

const MACRO_TEGELS = ["energyKcal", "proteinG", "carbohydrateG", "fatG"] as const;

function rij(maaltijd: MaaltijdPatroon, veld: string): MaaltijdRij | undefined {
  return maaltijd.rijen.find((r) => r.veld === veld);
}

function getal(waarde: number | null | undefined, benaderd = false): string {
  if (waarde === null || waarde === undefined) return "—";
  return `${benaderd ? "≈ " : ""}${rondVoedingswaarde(waarde)}`;
}

export default function PatroonMaaltijden({
  patroon,
  periode,
}: {
  patroon: readonly MaaltijdPatroon[];
  periode: Periode;
}) {
  const normen = useKernstofNormen();
  const gevolgd = useGevolgdeNormen();
  const profiel = useKernstofProfiel();
  const [openProduct, setOpenProduct] = useState<string | null>(null);
  const [moment, setMoment] = useState<EetmomentId>(
    () => patroon.find((m) => m.keer > 0)?.moment ?? "ontbijt",
  );
  const maaltijd = patroon.find((m) => m.moment === moment) ?? patroon[0];
  if (!maaltijd) return null;

  const kies = (volgende: EetmomentId) => {
    setMoment(volgende);
    setOpenProduct(null);
    trackEvent("nutrition_patroon_maaltijd_gekozen", { moment: volgende });
    clarityTag("nutrition_patroon_maaltijd", volgende);
  };

  const kcal = rij(maaltijd, "energyKcal")?.waarde ?? null;
  const tabelRijen = maaltijd.rijen.filter((r) => r.veld !== "energyKcal");
  const metKeer = patroon.filter((m) => m.keer > 0);
  const eenDag = periode.van === periode.tot;
  const dagen = datumsTussen(periode).length;
  const periodeTekst = eenDag ? `op ${periodeLabel(periode)}` : `(${periodeLabel(periode)})`;
  const naam = maaltijd.label.toLowerCase();

  const stofRijen = tabelRijen.map((r) => {
    const ref = referentieVoorVeld(r.veld, gevolgd, profiel);
    return { r, ref, aandeel: aandeelVan(ref, r.waarde) };
  });
  const kernRijen = maaltijd.kernstoffen.map((k) => {
    const ref = referentieVoorKernstof(k.nutrient, normen, profiel);
    return { k, ref, aandeel: aandeelVan(ref, k.gemiddeld) };
  });
  const sterkst = sterksteBijdragen([
    ...stofRijen.flatMap(({ r, aandeel }) => (aandeel === null || r.waarvan ? [] : [{ label: r.label, aandeel }])),
    ...kernRijen.flatMap(({ k, ref, aandeel }) =>
      aandeel === null || ref.weektotaal ? [] : [{ label: k.label, aandeel }],
    ),
  ]);

  const toggleProduct = (product: { naam: string; supplement: boolean }) => {
    const open = openProduct === product.naam ? null : product.naam;
    setOpenProduct(open);
    if (open) {
      trackEvent("nutrition_patroon_product_geopend", {
        moment,
        soort: product.supplement ? "supplement" : "voeding",
      });
    }
  };

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
          {eenDag ? "Op" : "In"} {periodeLabel(periode)} staat er bij {maaltijd.label.toLowerCase()} nog niets
          geregistreerd. Vul het in je dagboek in — dan zie je hier wat er gemiddeld op je bord ligt.
        </p>
      ) : (
        <>
          <p className="vd-eyebrow" style={{ margin: "0 0 0.5rem" }}>
            {eenDag
              ? `${maaltijd.label} ${periodeTekst}`
              : `Gemiddeld per ${naam} · ${maaltijd.keer} van ${dagen} dagen geregistreerd ${periodeTekst}`}
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
                    {getal(r?.waarde, r?.benaderd)}
                  </b>
                  <span className="block text-[0.625rem] text-[var(--vd-ink-3)]">{r?.unit}</span>
                </div>
              );
            })}
          </div>

          {maaltijd.benaderdeProducten.length > 0 ? (
            <p className="vd-note" style={{ margin: "-0.25rem 0 0.75rem" }}>
              ≈ {maaltijd.benaderdeProducten.join(", ")}{" "}
              {maaltijd.benaderdeProducten.length === 1 ? "telt" : "tellen"} mee met de waarden van een
              vergelijkbaar NEVO-product.
            </p>
          ) : null}

          {maaltijd.producten.length > 0 ? (
            <section aria-label="Wat je at" className="vd-tabel">
              <div className="vd-tabel-kop">
                <span className="!text-left">{eenDag ? "Wat je at" : "Wat je meestal at"}</span>
              </div>
              {maaltijd.producten.slice(0, 8).map((product) => {
                const open = openProduct === product.naam;
                return (
                  <Fragment key={product.naam}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleProduct(product)}
                      className="vd-tabel-rij w-full cursor-pointer grid-cols-[1fr_auto_14px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit hover:bg-[var(--vd-surface-2)]"
                    >
                      <span className="vd-naam">
                        {product.naam}
                        {product.supplement ? <i>supplement</i> : null}
                      </span>
                      <span className="vd-getal">
                        {product.eenheid === "g" ? `${product.hoeveelheid} g` : `${product.hoeveelheid}×`}
                        {!eenDag && product.keer > 1 ? ` · ${product.keer} keer` : ""}
                      </span>
                      <span aria-hidden className="text-[var(--vd-ink-3)]">
                        {open ? "▾" : "›"}
                      </span>
                    </button>
                    {open ? <PatroonMaaltijdProduct product={product} /> : null}
                  </Fragment>
                );
              })}
            </section>
          ) : null}

          <p className="vd-note" style={{ margin: "0.75rem 0 0.375rem" }}>
            &lsquo;Van norm&rsquo; is het deel van je dagnorm dat {eenDag ? `deze ${naam}` : `een gemiddelde ${naam}`}{" "}
            dekt. Onder elke stof staat welke norm dat is en waar hij vandaan komt; een eigen doel uit Je doelen
            staat er apart onder.
            {!eenDag && maaltijd.keer < dagen
              ? ` Dagen zonder ${naam} tellen niet mee: niet ingevuld is geen lege ${naam}.`
              : ""}
          </p>

          {sterkst.length > 0 ? (
            <p className="vd-note" style={{ margin: "0 0 0.5rem" }}>
              <b className="text-[var(--vd-ink)]">Waar je {naam} het meest aan bijdraagt:</b>{" "}
              {sterkst.map((b) => `${b.label.toLowerCase()} ${percentageADH(b.aandeel)}`).join(", ")} van je
              dagnorm.
            </p>
          ) : null}

          <div className="vd-tabel">
            <div className="vd-tabel-kop grid-cols-[1fr_58px_58px_52px]">
              <span>Stof · dagnorm</span>
              <span>Gem.</span>
              <span>/100 kcal</span>
              <span>Van norm</span>
            </div>

            {stofRijen.map(({ r, ref, aandeel }) => {
              const onder = r.waarvan ? null : (normRegel(ref) ?? GEEN_NORM[r.veld] ?? "geen dagnorm");
              const doel = r.waarvan ? null : doelRegel(ref, r.waarde, r.unit);
              return (
                <div key={r.veld} className="vd-tabel-rij grid-cols-[1fr_58px_58px_52px]">
                  <span className={`vd-naam ${r.waarvan ? "pl-3 !font-normal !text-[var(--vd-ink-2)]" : ""}`}>
                    {r.label}
                    {onder ? <i>{onder}</i> : null}
                    {doel ? <i>{doel}</i> : null}
                  </span>
                  <span className="vd-getal">
                    {getal(r.waarde, r.benaderd)} {r.waarde === null ? "" : r.unit}
                  </span>
                  <span className="vd-getal">{getal(r.per100kcal)}</span>
                  <span className="vd-getal">
                    {aandeel === null ? "—" : `${r.benaderd ? "≈ " : ""}${percentageADH(aandeel)}`}
                  </span>
                </div>
              );
            })}

            <div className="vd-tabel-kop">
              <span className="!text-left">Kernstoffen · tegen je dagnorm</span>
            </div>
            {kernRijen.map(({ k, ref, aandeel }) => {
              const onder = normRegel(ref);
              const doel = doelRegel(ref, k.gemiddeld, k.unit);
              return (
                <div key={k.nutrient} className="vd-tabel-rij grid-cols-[1fr_58px_58px_52px]">
                  <span className="vd-naam">
                    {k.label}
                    {onder ? <i>{onder}</i> : null}
                    {doel ? <i>{doel}</i> : null}
                    {k.uitSupplement ? (
                      <i>
                        waarvan {rondVoedingswaarde(k.uitSupplement)} {k.unit} uit supplement
                      </i>
                    ) : null}
                  </span>
                  <span className="vd-getal">
                    {k.gemiddeld === null ? "n.o." : `${getal(k.gemiddeld, k.benaderd)} ${k.unit}`}
                  </span>
                  <span className="vd-getal">
                    {k.gemiddeld === null || kcal === null || kcal <= 0
                      ? "—"
                      : rondVoedingswaarde((k.gemiddeld / kcal) * 100)}
                  </span>
                  <span className="vd-getal">
                    {k.benaderd && aandeel !== null ? "≈ " : ""}
                    {percentageADH(aandeel)}
                  </span>
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

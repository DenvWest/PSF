"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import SupplementThumbnail from "@/components/dashboard/voortgang/SupplementThumbnail";
import { gehalteWeergavePer100g, type GehalteWeergave } from "@/lib/nutrition-catalog-gehalte";
import { weergaveVoorStandaardPortie } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { etiketBronVoor, type EtiketBron } from "@/lib/nutrition-etiket";
import { bedragVanSupermarktveld } from "@/lib/nutrition-supermarkt-items";
import { VOEDINGSWAARDE_VELDEN } from "@/lib/nutrition-voedingswaarde";
import { useNevoProducten } from "@/lib/use-nevo-producten";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import { trackEvent } from "@/lib/ga4";
import type { VergelijkResultaat } from "@/components/dashboard/dagboek/DagboekVergelijkZoek";

/**
 * De vergelijking als echte tabel: producten als kolommen, stoffen als rijen,
 * zodat je per stof horizontaal leest wie wint. Het hoogste gehalte in een
 * rij krijgt de nadruk, met de verhouding tot de nummer twee erbij.
 *
 * Twee standen. "Per portie" is wat je daadwerkelijk binnenkrijgt (1
 * opscheplepel, 1 schep eiwitpoeder) en de standaard. "Per 100 g" is de
 * eerlijke etiketvergelijking tussen voedingsmiddelen; een supplement heeft
 * daar geen zinnige waarde en staat dan op n.v.t.
 *
 * Een product zonder gemeten gehalte valt niet weg maar krijgt een streepje:
 * vroeger verdween het uit elke rij en leek de vergelijking één product te
 * tonen. Een streepje is "niet gemeten"; meldt NEVO een 0 of spoor, dan staat
 * er "0" of "spoor". Een rij waarin geen enkel product een getal heeft,
 * verdwijnt. Een benadering (vergelijkbaar NEVO-record) staat er met "≈" en de
 * NEVO-naam bij — vergelijken mag, optellen in je dag niet
 * (`docs/plan/BESLUIT_NUL_SPOOR_BENADERING_2026-10.md`).
 *
 * Bovenaan de 5 stoffen die dit systeem trackt, met winnaar en verhouding.
 * Daaronder het etiket uit NEVO (energie, macro's, brede micronutriënten),
 * zoals in het productdetail: alleen getallen, geen winnaar, geen balk —
 * informatief, zonder oordeel (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md`
 * §0.1). Eiwit staat al bovenaan en komt daar niet nog eens.
 */

type Stand = "portie" | "100g";

type Cel = GehalteWeergave | { soort: "nvt" };

const RI_TONEN: ReadonlySet<NutrientId> = new Set(["magnesium", "zinc", "vitamin_d"]);

function celVoor(resultaat: VergelijkResultaat, nutrient: NutrientId, stand: Stand): Cel {
  if (stand === "portie") return weergaveVoorStandaardPortie(resultaat.bron, resultaat.entry.key, nutrient);
  if (resultaat.bron === "supplement") return { soort: "nvt" };
  return gehalteWeergavePer100g(catalogEntry(resultaat.entry.key), nutrient);
}

type EtiketCel = { soort: "waarde"; value: number; benadering: boolean } | { soort: "onbekend" } | { soort: "nvt" };

const ETIKET_VELDEN = VOEDINGSWAARDE_VELDEN.filter((veld) => veld.veld !== "proteinG");

function etiketCelVoor(
  resultaat: VergelijkResultaat,
  bron: EtiketBron | null,
  product: SupermarktProduct | null,
  veld: (typeof ETIKET_VELDEN)[number],
  stand: Stand,
): EtiketCel {
  if (resultaat.bron === "supplement") return { soort: "nvt" };
  if (!bron || !product || !bron.velden.some((v) => v.veld === veld.veld)) return { soort: "onbekend" };
  const grams = stand === "portie" ? resultaat.entry.porties[0]?.grams : 100;
  if (!grams) return { soort: "onbekend" };
  const value = bedragVanSupermarktveld(product, veld.veld, grams);
  return value === null ? { soort: "onbekend" } : { soort: "waarde", value, benadering: bron.benadering };
}

/** De NEVO-naam waarvan dit product zijn waarden leent, of null als het eigen waarden heeft. */
function benaderingVan(resultaat: VergelijkResultaat): string | null {
  if (resultaat.bron === "supplement") return null;
  for (const nutrient of NUTRIENT_ORDER) {
    const cel = gehalteWeergavePer100g(catalogEntry(resultaat.entry.key), nutrient);
    if (cel.soort !== "onbekend" && cel.benadering) return cel.benadering;
  }
  return null;
}

function getal(value: number): string {
  return value.toLocaleString("nl-NL", { maximumFractionDigits: value < 10 ? 1 : 0 });
}

function portieLabel(resultaat: VergelijkResultaat): string | null {
  if (resultaat.bron === "supplement") return resultaat.entry.porties[0]?.labelNl ?? null;
  const portie = catalogEntry(resultaat.entry.key)?.porties[0];
  return portie ? `${portie.labelNl} · ${portie.grams} g` : null;
}

export default function DagboekVergelijkTabel({
  producten,
  onTerug,
  onVerwijder,
}: {
  producten: readonly VergelijkResultaat[];
  onTerug: () => void;
  onVerwijder: (resultaat: VergelijkResultaat) => void;
}) {
  const [stand, setStand] = useState<Stand>("portie");
  const heeftVoeding = producten.some((r) => r.bron === "voeding");

  const rijen = NUTRIENT_ORDER.map((nutrient) => {
    const cellen = producten.map((resultaat) => celVoor(resultaat, nutrient, stand));
    const waarden = cellen.flatMap((cel) => (cel.soort === "waarde" ? [cel.value] : []));
    const gesorteerd = [...waarden].sort((a, b) => b - a);
    const hoogste = gesorteerd[0] ?? 0;
    const tweede = gesorteerd[1];
    const verhouding =
      waarden.length >= 2 && tweede !== undefined && tweede > 0 && hoogste / tweede >= 1.1
        ? hoogste / tweede
        : null;
    return { nutrient, label: nutrientReferences[nutrient].label, cellen, hoogste, verhouding, aantal: waarden.length };
  }).filter((rij) => rij.aantal > 0);

  const zonderGehalte = producten.filter((resultaat) =>
    NUTRIENT_ORDER.every((nutrient) => celVoor(resultaat, nutrient, "portie").soort === "onbekend"),
  );
  const etiketBronnen = producten.map((resultaat) =>
    resultaat.bron === "voeding" ? etiketBronVoor(resultaat.entry) : null,
  );
  const nevoProducten = useNevoProducten(
    [...new Set(etiketBronnen.flatMap((bron) => (bron ? [bron.code] : [])))].sort(),
  );
  const etiketRijen = ETIKET_VELDEN.map((veld) => ({
    ...veld,
    cellen: producten.map((resultaat, index) => {
      const bron = etiketBronnen[index];
      const product = bron ? (nevoProducten.get(`nevo:${bron.code}`) ?? null) : null;
      return etiketCelVoor(resultaat, bron, product, veld, stand);
    }),
  })).filter((rij) => rij.cellen.some((cel) => cel.soort === "waarde"));

  const benaderingen = producten.flatMap((resultaat, index): { label: string; naam: string | null }[] => {
    const naam = benaderingVan(resultaat);
    if (naam) return [{ label: resultaat.entry.labelNl, naam }];
    const bron = etiketBronnen[index];
    const getoond = etiketRijen.some((rij) => rij.cellen[index]?.soort === "waarde");
    return bron?.benadering && getoond ? [{ label: resultaat.entry.labelNl, naam: null }] : [];
  });
  const heeftNul = rijen.some((rij) => rij.cellen.some((cel) => cel.soort === "nul" || cel.soort === "spoor"));
  const heeftStreepje = rijen.some((rij) => rij.cellen.some((cel) => cel.soort === "onbekend"));

  function kiesStand(nieuw: Stand) {
    if (nieuw === stand) return;
    setStand(nieuw);
    trackEvent("nutrition_dagboek_vergelijk_stand", { stand: nieuw, aantal: producten.length });
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="vergelijk-titel">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar zoeken"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 id="vergelijk-titel" className="m-0 min-w-0 flex-1 font-serif text-[19px] font-normal text-[var(--vd-ink)]">
          Vergelijking
        </h2>
        {heeftVoeding ? (
          <div role="radiogroup" aria-label="Vergelijk per" className="flex shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            {(["portie", "100g"] as const).map((optie) => (
              <button
                key={optie}
                type="button"
                role="radio"
                aria-checked={stand === optie}
                onClick={() => kiesStand(optie)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                  stand === optie
                    ? "bg-[var(--vd-sage)] text-[var(--vd-bg)]"
                    : "text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
                }`}
              >
                {optie === "portie" ? "Per portie" : "Per 100 g"}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">
            Gehaltes {stand === "portie" ? "per portie" : "per 100 gram"}, per stof naast elkaar
          </caption>
          <thead>
            <tr className="bg-white/[0.03]">
              <th scope="col" className="w-[68px] border-b border-white/10 px-2 py-2.5 text-left align-bottom text-[10.5px] font-semibold uppercase tracking-wide text-[var(--vd-ink-4)] sm:w-[110px] sm:px-4">
                Stof
              </th>
              {producten.map((resultaat) => {
                const portie = stand === "portie" ? portieLabel(resultaat) : "100 g";
                return (
                  <th
                    key={`${resultaat.bron}-${resultaat.entry.key}`}
                    scope="col"
                    className="relative border-b border-l border-white/10 px-1.5 pb-2.5 pt-3 text-center align-top font-normal sm:px-3"
                  >
                    <button
                      type="button"
                      onClick={() => onVerwijder(resultaat)}
                      aria-label={`Verwijder ${resultaat.entry.labelNl} uit vergelijking`}
                      className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[14px] leading-none text-[var(--vd-ink-4)] transition-colors hover:bg-white/10 hover:text-[var(--vd-ink)]"
                    >
                      &times;
                    </button>
                    <span className="flex flex-col items-center gap-1.5">
                      {resultaat.bron === "voeding" ? (
                        <FoodThumbnail entry={resultaat.entry} size={40} />
                      ) : (
                        <SupplementThumbnail entry={resultaat.entry} size={40} />
                      )}
                      <span className="line-clamp-2 text-[11.5px] font-semibold leading-tight text-[var(--vd-ink)]">
                        {resultaat.entry.labelNl}
                      </span>
                      {portie ? (
                        <span className="line-clamp-2 text-[10px] leading-tight text-[var(--vd-ink-4)]">{portie}</span>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rijen.map((rij) => (
              <tr key={rij.nutrient} className="border-b border-white/10 last:border-b-0">
                <th scope="row" className="px-2 py-3 text-left align-middle text-[12px] font-semibold text-[var(--vd-ink)] sm:px-4 sm:text-[13px]">
                  {rij.label}
                </th>
                {rij.cellen.map((cel, index) => {
                  const resultaat = producten[index];
                  const sleutel = `${resultaat.bron}-${resultaat.entry.key}`;
                  if (cel.soort === "nul" || cel.soort === "spoor") {
                    return (
                      <td key={sleutel} className="border-l border-white/10 px-1.5 py-3 text-center align-middle">
                        <span
                          aria-label={cel.soort === "nul" ? "gemeten: niets" : "gemeten: een spoor"}
                          className="font-mono text-[12px] tabular-nums text-[var(--vd-ink-3)]"
                        >
                          {cel.benadering ? "≈ " : ""}
                          {cel.soort === "nul" ? "0" : "spoor"}
                          {cel.soort === "nul" ? (
                            <span className="ml-0.5 text-[10px] text-[var(--vd-ink-4)]">{cel.unit}</span>
                          ) : null}
                        </span>
                      </td>
                    );
                  }
                  if (cel.soort !== "waarde") {
                    return (
                      <td key={sleutel} className="border-l border-white/10 px-1.5 py-3 text-center align-middle text-[11px] text-[var(--vd-ink-4)]">
                        {cel.soort === "nvt" ? "n.v.t." : <span aria-label="niet gemeten">—</span>}
                      </td>
                    );
                  }
                  const winnaar = rij.aantal >= 2 && cel.value === rij.hoogste && cel.value > 0;
                  const breedte = rij.hoogste > 0 ? Math.max(4, Math.round((cel.value / rij.hoogste) * 100)) : 0;
                  const ri = REFERENCE_INTAKES[rij.nutrient];
                  const riAandeel =
                    stand === "portie" && RI_TONEN.has(rij.nutrient) && ri.unit === cel.unit
                      ? Math.round((cel.value / ri.value) * 100)
                      : null;
                  return (
                    <td
                      key={sleutel}
                      className={`border-l border-white/10 px-1.5 py-3 align-middle sm:px-3 ${
                        winnaar ? "bg-[rgb(var(--vd-sage-rgb)/14%)]" : ""
                      }`}
                    >
                      <span className="flex flex-col items-center gap-1">
                        <span
                          className={`font-mono text-[12.5px] tabular-nums sm:text-[13.5px] ${
                            winnaar ? "font-semibold text-[var(--vd-sage-2)]" : "text-[var(--vd-ink)]"
                          }`}
                        >
                          {cel.benadering ? <span aria-label="benadering">≈ </span> : null}
                          {getal(cel.value)}
                          <span className="ml-0.5 text-[10px] font-normal text-[var(--vd-ink-3)]">{cel.unit}</span>
                        </span>
                        <span aria-hidden className="relative block h-1.5 w-full max-w-[96px] overflow-hidden rounded-full bg-[var(--vd-track)]">
                          <span
                            className={`absolute inset-y-0 left-0 rounded-full ${winnaar ? "bg-[var(--vd-sage-2)]" : "bg-[var(--vd-sage)] opacity-60"}`}
                            style={{ width: `${breedte}%` }}
                          />
                        </span>
                        {winnaar && rij.verhouding ? (
                          <span className="text-[10px] font-semibold text-[var(--vd-sage-2)]">
                            {getal(rij.verhouding)}× zoveel
                          </span>
                        ) : riAandeel !== null ? (
                          <span className="text-[10px] text-[var(--vd-ink-4)]">{riAandeel}% ADH</span>
                        ) : null}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {etiketRijen.length > 0 ? (
            <tbody>
              <tr className="border-y border-white/10 bg-white/[0.03]">
                <th
                  scope="colgroup"
                  colSpan={producten.length + 1}
                  className="px-2 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wide text-[var(--vd-ink-4)] sm:px-4"
                >
                  Etiket · ter informatie
                </th>
              </tr>
              {etiketRijen.map((rij) => (
                <tr key={rij.veld} className="border-b border-white/[0.06] last:border-b-0">
                  <th
                    scope="row"
                    className={`px-2 py-2 text-left align-middle font-normal sm:px-4 ${
                      rij.waarvan ? "pl-4 text-[11px] text-[var(--vd-ink-3)] sm:pl-7" : "text-[12px] text-[var(--vd-ink-2)]"
                    }`}
                  >
                    {rij.label}
                  </th>
                  {rij.cellen.map((cel, index) => {
                    const resultaat = producten[index];
                    const sleutel = `${resultaat.bron}-${resultaat.entry.key}`;
                    if (cel.soort !== "waarde") {
                      return (
                        <td key={sleutel} className="border-l border-white/10 px-1.5 py-2 text-center align-middle text-[11px] text-[var(--vd-ink-4)]">
                          {cel.soort === "nvt" ? "n.v.t." : <span aria-label="niet gemeten">—</span>}
                        </td>
                      );
                    }
                    const riAandeel = stand === "portie" && rij.ri !== null ? Math.round((cel.value / rij.ri) * 100) : null;
                    return (
                      <td key={sleutel} className="border-l border-white/10 px-1.5 py-2 text-center align-middle">
                        <span className="font-mono text-[11.5px] tabular-nums text-[var(--vd-ink-2)]">
                          {cel.benadering ? <span aria-label="benadering">≈ </span> : null}
                          {getal(cel.value)}
                          <span className="ml-0.5 text-[10px] text-[var(--vd-ink-4)]">{rij.unit}</span>
                        </span>
                        {riAandeel !== null ? (
                          <span className="block text-[10px] text-[var(--vd-ink-4)]">{riAandeel}% ADH</span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>

        {rijen.length === 0 ? (
          <p className="m-0 px-3.5 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-3)]">
            Van deze producten is nog geen gehalte bekend voor de stoffen die dit dagboek volgt.
          </p>
        ) : null}
      </div>

      {zonderGehalte.length > 0 && rijen.length > 0 ? (
        <p className="m-0 rounded-xl border-l-2 border-[var(--vd-amber)] bg-[var(--vd-amber-fill)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
          Van {zonderGehalte.map((r) => r.entry.labelNl).join(" en ")} zijn nog geen gemeten gehaltes
          bekend.
        </p>
      ) : null}

      {benaderingen.length > 0 && rijen.length > 0 ? (
        <p className="m-0 rounded-xl border-l-2 border-[var(--vd-amber)] bg-[var(--vd-amber-fill)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
          {benaderingen.map((b, index) => (
            <span key={b.label}>
              {index > 0 ? " " : null}≈ {b.label}: NEVO heeft geen eigen record,{" "}
              {b.naam ? (
                <>dit zijn de waarden van &lsquo;{b.naam}&rsquo;; in je dagboek telt hij mee met &ldquo;≈&rdquo;.</>
              ) : (
                "dit zijn calorieën en macro's van een vergelijkbaar product, om te vergelijken; in je dagboek telt hij niet mee."
              )}
            </span>
          ))}
        </p>
      ) : null}

      {heeftNul || heeftStreepje ? (
        <p className="m-0 px-1 text-[11px] leading-relaxed text-[var(--vd-ink-4)]">
          {heeftNul ? "0 of spoor: gemeten, en er zit (vrijwel) niets in. " : null}
          {heeftStreepje ? "Een streepje: niet gemeten." : null}
        </p>
      ) : null}

      <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
        {stand === "portie"
          ? "Per portie: wat je daadwerkelijk binnenkrijgt per keer, op de gebruikelijke portie van elk product. RI = referentie-inname volgens EU 1169/2011."
          : "Per 100 g: de etiketvergelijking tussen voedingsmiddelen, los van hoeveel je ervan eet. Supplementen staan hier op n.v.t."}
      </p>
    </section>
  );
}

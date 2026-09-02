"use client";

import { useEffect, useMemo } from "react";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { NEVO_CITATION } from "@/data/nutrition/food-sources";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import {
  categorieDetail,
  type CategorieBron,
  type CategorieNutrient,
} from "@/lib/nutrition-categorie-detail";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Het doordruk-paneel onder een categorierij: wat levert deze groep, en uit
 * welke bronnen.
 *
 * ## Waarom bronnen náást elkaar en niet onder elkaar opgeteld
 *
 * Elke rij toont wat één portie van dát voedingsmiddel levert. Ze staan er om
 * te kunnen kíezen — "wil ik dit uit amandelen of uit pompoenpitten halen" —
 * niet om een dagtotaal te bouwen. De check meet frequenties, geen grammen, en
 * bij magnesium en zink bepaalt fytaat de opname méér dan het gehalte. Zie de
 * kop van `nutrient-routes.ts`; die grens verandert hier niet.
 *
 * ## Wat de kolommen dragen
 *
 * `Bron` en `Portie` komen uit onze eigen tabel. `Levert` is de NEVO-waarde
 * omgerekend naar die portie — onze bewerking, niet het brondcijfer, en
 * daarom staat de brondnaam los in de voetnoot in plaats van als bewering bij
 * het getal. Een bron zonder geverifieerd cijfer draagt dat zichtbaar.
 */

const BAND_KLEUR: Record<IntakeBand, string> = {
  below: "#C8956C",
  around: "#C99A3C",
  meets: "#9CC5A9",
};

const BAND_LABEL: Record<IntakeBand, string> = {
  below: "ruimte",
  around: "bijna",
  meets: "op orde",
};

function BronRij({ bron }: { bron: CategorieBron }) {
  return (
    <tr className="border-t border-white/5">
      <td className="py-1.5 pr-3 align-top text-[12px] leading-snug text-[#E7EDE8]">
        {bron.labelNl}
        {bron.opnameNote ? (
          <span
            className="ml-1.5 inline-block cursor-help text-[10px] text-[#C99A3C]"
            title={bron.opnameNote}
          >
            opname ↓
          </span>
        ) : null}
      </td>
      <td className="py-1.5 pr-3 align-top text-[11.5px] leading-snug text-[#9FB0A6]">
        {bron.portionNl}
      </td>
      <td className="py-1.5 pr-1 text-right align-top text-[12px] font-semibold leading-snug tabular-nums text-[#E7EDE8]">
        {bron.amount === null ? (
          <span className="font-normal text-[#7E8C82]">—</span>
        ) : (
          <>
            {bron.amount}
            {bron.unit ? <span className="ml-0.5 font-normal text-[#9FB0A6]">{bron.unit}</span> : null}
          </>
        )}
      </td>
      <td className="py-1.5 pl-2 text-right align-top">
        <span
          className={`text-[10px] ${bron.bronGeverifieerd ? "text-[#9CC5A9]" : "text-[#7E8C82]"}`}
          title={
            bron.bronGeverifieerd
              ? `Gehalte uit ${NEVO_CITATION}${bron.bronNaam ? ` — "${bron.bronNaam}"` : ""}`
              : "Indicatief cijfer, nog niet tegen een brondataset gelegd"
          }
        >
          {bron.bronGeverifieerd ? "NEVO" : "indicatief"}
        </span>
      </td>
    </tr>
  );
}

function NutrientBlok({ nutrient }: { nutrient: CategorieNutrient }) {
  return (
    <section className="mt-3 first:mt-0">
      <header className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="m-0 flex items-center gap-2 text-[12.5px] font-semibold text-[#E7EDE8]">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: BAND_KLEUR[nutrient.band] }}
          />
          {nutrient.label}
          <span className="text-[11px] font-normal text-[#9FB0A6]">
            {BAND_LABEL[nutrient.band]}
          </span>
        </h4>
        <p className="m-0 text-[11px] leading-snug text-[#7E8C82]">{nutrient.referenceLabel}</p>
      </header>

      {nutrient.confidence <= 2 ? (
        <p className="mb-1.5 mt-0 max-w-[62ch] text-[11px] leading-relaxed text-[#9FB0A6] text-pretty">
          {nutrient.confidenceWhy}
        </p>
      ) : null}

      {nutrient.bronnen.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Sterkste bronnen van {nutrient.label} binnen deze categorie, per portie
            </caption>
            <thead>
              <tr>
                <th className="pb-1 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                  Bron
                </th>
                <th className="pb-1 pr-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                  Portie
                </th>
                <th className="pb-1 pr-1 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                  Levert
                </th>
                <th className="pb-1 pl-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                  Cijfer
                </th>
              </tr>
            </thead>
            <tbody>
              {nutrient.bronnen.map((bron) => (
                <BronRij key={bron.key} bron={bron} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default function CategorieDetailPaneel({
  categorieId,
  categorieLabel,
  report,
  surface,
}: {
  categorieId: VoedselgroepId;
  categorieLabel: string;
  report: NutritionSelfReport | null;
  surface: string;
}) {
  const detail = useMemo(
    () => categorieDetail(categorieId, report),
    [categorieId, report],
  );

  useEffect(() => {
    trackEvent("nutrition_basis_category_expanded", {
      surface,
      category_id: categorieId,
      nutrient_count: detail.nutrienten.length,
      source_count: detail.bronCount,
    });
    emitAccountClientEvent("nutrition.basis_category_expanded", {
      category_id: categorieId,
      nutrient_count: detail.nutrienten.length,
      surface,
    });
    clarityTag("nutrition_basis_doordruk", categorieId);
  }, [categorieId, detail.bronCount, detail.nutrienten.length, surface]);

  if (detail.nutrienten.length === 0) {
    return (
      <p className="m-0 py-2 text-[12px] leading-relaxed text-[#9FB0A6]">
        Bij deze categorie kies je niet tussen bronnen — hier gaat het om hoe vaak,
        niet om waaruit.
      </p>
    );
  }

  return (
    <div className="py-1">
      <p className="mb-2 mt-0 max-w-[62ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
        Wat {categorieLabel.toLowerCase()} bij jou levert, en welke bronnen daar het
        sterkst aan bijdragen. Per portie — deze getallen tellen niet bij elkaar op.
      </p>

      {detail.nutrienten.map((nutrient) => (
        <NutrientBlok key={nutrient.nutrient} nutrient={nutrient} />
      ))}

      {detail.geverifieerdCount > 0 ? (
        <p className="mb-0 mt-3 text-[10.5px] leading-relaxed text-[#7E8C82]">
          Gehaltes gemerkt met NEVO: {NEVO_CITATION}. Onze portiewaarden zijn daaruit
          omgerekend naar de portie in de tabel.
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import { NEVO_GEHALTES_EDITIE } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { gehaltePer100g, nevoOmega3Delen } from "@/lib/nutrition-catalog-gehalte";
import { weergaveVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { toBase } from "@/lib/nutrition-units";
import NevoMacroBlok from "@/components/dashboard/dagboek/NevoMacroBlok";
import VoedingswaardeTabel from "@/components/dashboard/dagboek/VoedingswaardeTabel";
import { macroPortieVoor } from "@/lib/catalogus-macro-portie";
import { etiketBronVoor, etiketVanProduct } from "@/lib/nutrition-etiket";
import { berekenVoedingswaarde, nevoCodeVoorItem, rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import type { ProteinTargetRange } from "@/lib/protein-target";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useNevoProducten } from "@/lib/use-nevo-producten";

/**
 * Wat één product op één portie levert: de vijf kernstoffen met ADH-balk en
 * daaronder het etiket uit NEVO (`VoedingswaardeTabel`), zonder oordeel
 * (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1).
 *
 * Eén blok voor twee schermen: de portie-invoer vóór het toevoegen
 * (`DagboekVoedingPortie`) en het productdetail erna (`DagboekProductDetail`).
 * Wat je ziet voordat je iets toevoegt, is zo precies wat je erna terugziet.
 *
 * Eiwit staat in allebei en komt in allebei uit `bedragVanItem`. Een gemeten 0
 * of spoor staat er als "0"/"spoor". Een benadering die getoond mag worden
 * (`scripts/nevo-benadering-micros.json`) toont de kernstoffen van het
 * vergelijkbare NEVO-record met "≈" en de NEVO-naam; die tellen als ≈ mee in je
 * dag, maar kleuren nooit "gehaald" (`docs/plan/BESLUIT_MICRO_IN_BEELD_2026-10.md`
 * §1b). Het etiket van een
 * vrijgegeven benadering komt van hetzelfde record, als benadering gelabeld;
 * van een andere benadering alleen calorieën en macro's (`NevoMacroBlok`).
 *
 * Eiwit heeft geen RI en rekent daarom tegen je eiwitdoel. Daaronder staan de
 * stoffen die je zelf volgt (`useGevolgdeStoffen`) met %RI in een neutrale
 * tint; de andere stoffen blijven %RI, de etiketvermelding
 * (`BESLUIT_KERNSTOF_NORMEN_2026-10.md` §4).
 */
export default function DagboekProductLevert({
  item,
  proteinTarget = null,
}: {
  item: DagboekItem;
  proteinTarget?: ProteinTargetRange | null;
}) {
  const voedingEntry = item.bron === "voeding" ? catalogEntry(item.key) : null;
  const nevoCode = nevoCodeVoorItem(item);
  const etiketBron = etiketBronVoor(voedingEntry);
  const benaderingEtiket = etiketBron?.benadering && etiketBron.naam ? etiketBron : null;
  const laadCode = nevoCode ?? benaderingEtiket?.code ?? null;
  const nevoProducten = useNevoProducten(laadCode ? [laadCode] : []);
  const nevoProduct = laadCode ? (nevoProducten.get(`nevo:${laadCode}`) ?? null) : null;
  const isBenadering = voedingEntry ? macroPortieVoor(voedingEntry)?.benadering === true : false;
  const nevoStoffen = voedingEntry
    ? NUTRIENT_ORDER.filter((nutrient) => gehaltePer100g(voedingEntry, nutrient)?.bron === "nevo")
    : [];
  const omega3Delen =
    voedingEntry && nevoStoffen.includes("omega3") ? nevoOmega3Delen(voedingEntry.key) : null;
  const { stoffen: gevolgdeStoffen } = useGevolgdeStoffen();
  const etiketRijen =
    nevoProduct && nevoCode ? berekenVoedingswaarde({ items: [item], nevoProducten }).rijen : [];
  const gevolgd = gevolgdeStoffen.flatMap((veld) => {
    const rij = etiketRijen.find((r) => r.veld === veld);
    return rij && rij.waarde !== null ? [rij] : [];
  });
  const eiwitDoel = proteinTarget && proteinTarget.gramsLow > 0 ? proteinTarget.gramsLow : null;
  const naarPortie = (mgPer100g: number | null) =>
    mgPer100g === null ? null : Math.round(((mgPer100g * item.grams) / 100) * 10) / 10;

  const rijen = NUTRIENT_ORDER.map((nutrient) => {
    const weergave = weergaveVanItem(item, nutrient);
    if (weergave.soort === "onbekend") return null;
    const label = nutrientReferences[nutrient].label;
    if (weergave.soort !== "waarde") {
      return { nutrient, label, soort: weergave.soort, waarde: 0, unit: weergave.unit, aandeel: 0, benadering: weergave.benadering };
    }
    const inBasis = toBase(weergave.value, weergave.unit, nutrient);
    if (inBasis === null) return null;
    return {
      nutrient,
      label,
      soort: weergave.soort,
      waarde: inBasis,
      unit: weergave.unit,
      aandeel:
        nutrient === "protein" ? (eiwitDoel === null ? null : inBasis / eiwitDoel) : aandeelVanRi(nutrient, inBasis),
      benadering: weergave.benadering,
    };
  }).filter((rij): rij is NonNullable<typeof rij> => rij !== null);
  const benadering = rijen.find((rij) => rij.benadering)?.benadering ?? null;
  const heeftGetal = rijen.some((rij) => rij.soort === "waarde") || gevolgd.length > 0;


  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10">
        <header className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <h3 className="m-0 font-sans text-[13.5px] font-bold text-[var(--vd-ink)]">
            Wat dit levert
          </h3>
        </header>

        {!heeftGetal ? (
          <p className="m-0 px-4 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
            Van dit product is nog geen gehalte bekend voor de stoffen die dit dagboek volgt.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-4">
            {rijen.map((rij) => {
              const vulling = rij.aandeel === null ? 0 : Math.min(Math.round(rij.aandeel * 100), 100);
              const gedekt = !rij.benadering && rij.aandeel !== null && rij.aandeel >= 1;
              return (
                <li key={rij.nutrient} className="flex items-center gap-3">
                  <span className="w-[72px] shrink-0 text-[12px] font-medium text-[var(--vd-ink-2)]">
                    {rij.label}
                  </span>
                  <span className="relative h-[22px] flex-1 overflow-hidden rounded-md bg-[var(--vd-track)]">
                    {rij.aandeel !== null ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-md"
                        style={{
                          width: `${vulling}%`,
                          background: gedekt ? "var(--vd-sage)" : "var(--vd-terra)",
                        }}
                      />
                    ) : null}
                    <span className="relative flex h-full items-center justify-end px-2 font-mono text-[10.5px] font-bold tabular-nums text-[var(--vd-ink)]">
                      {rij.soort === "spoor"
                        ? "spoor"
                        : rij.aandeel === null
                          ? "eigen doel"
                          : `${rij.benadering ? "≈ " : ""}${vulling}% ${rij.nutrient === "protein" ? "van je doel" : "ADH"}`}
                    </span>
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink-3)]">
                    {rij.benadering ? "≈ " : null}
                    {rij.soort === "spoor" ? "spoor" : `${Math.round(rij.waarde * 10) / 10} ${rij.unit}`}
                  </span>
                </li>
              );
            })}
            {gevolgd.length > 0 ? (
              <li className="pt-1 text-[10.5px] font-semibold text-[var(--vd-ink-4)]">Ook gevolgd</li>
            ) : null}
            {gevolgd.map((rij) => {
              const vulling = rij.aandeelRi === null ? 0 : Math.min(Math.round(rij.aandeelRi * 100), 100);
              return (
                <li key={rij.veld} className="flex items-center gap-3">
                  <span className="w-[72px] shrink-0 text-[12px] font-medium text-[var(--vd-ink-2)]">
                    {rij.label}
                  </span>
                  <span className="relative h-[22px] flex-1 overflow-hidden rounded-md bg-[var(--vd-track)]">
                    {rij.aandeelRi !== null ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-md"
                        style={{ width: `${vulling}%`, background: "var(--vd-ink-4)" }}
                      />
                    ) : null}
                    <span className="relative flex h-full items-center justify-end px-2 font-mono text-[10.5px] font-bold tabular-nums text-[var(--vd-ink)]">
                      {rij.aandeelRi === null ? "geen ADH" : `${vulling}% ADH`}
                    </span>
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink-3)]">
                    {rondVoedingswaarde(rij.waarde ?? 0)} {rij.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {benadering && heeftGetal ? (
          <p className="m-0 border-t border-white/10 bg-[var(--vd-amber-fill)] px-4 py-3 text-[11px] leading-relaxed text-[var(--vd-ink-2)]">
            ≈ Benadering: NEVO heeft geen eigen record voor dit product. Dit zijn de waarden van
            &lsquo;{benadering}&rsquo; (NEVO-online versie {NEVO_GEHALTES_EDITIE}, RIVM, Bilthoven). Ze tellen
            met &ldquo;≈&rdquo; mee in je dag; &lsquo;gehaald&rsquo; rekent zonder.
          </p>
        ) : null}

        {nevoStoffen.length > 0 ? (
          <footer className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-[11px] leading-relaxed text-[var(--vd-ink-4)]">
            {omega3Delen ? (
              <p className="m-0">
                Omega-3: EPA {naarPortie(omega3Delen.epaMg) ?? "n.o."} mg + DHA{" "}
                {naarPortie(omega3Delen.dhaMg) ?? "n.o."} mg. De som is door ons berekend
                (afgeleid), NEVO geeft EPA en DHA los.
              </p>
            ) : null}
            <p className="m-0">
              Gehaltes uit NEVO-online versie {NEVO_GEHALTES_EDITIE}, RIVM, Bilthoven.
            </p>
          </footer>
        ) : null}
      </section>

      {nevoProduct && benaderingEtiket ? (
        <VoedingswaardeTabel
          titel="Voedingswaarde · benadering"
          toelichting={`${item.grams} g · ≈ ${benaderingEtiket.naam}`}
          voedingswaarde={etiketVanProduct(nevoProduct, benaderingEtiket, item.grams)}
          bronProducten={[nevoProduct]}
        />
      ) : nevoProduct && nevoCode ? (
        <VoedingswaardeTabel
          titel="Voedingswaarde"
          toelichting={`${item.grams} g`}
          voedingswaarde={berekenVoedingswaarde({ items: [item], nevoProducten })}
          bronProducten={[nevoProduct]}
        />
      ) : isBenadering && voedingEntry && !benaderingEtiket ? (
        <NevoMacroBlok entry={voedingEntry} grams={item.grams} />
      ) : null}
    </>
  );
}

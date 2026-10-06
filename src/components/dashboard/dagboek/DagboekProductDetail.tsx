"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import { NEVO_GEHALTES_EDITIE } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { gehaltePer100g, nevoOmega3Delen } from "@/lib/nutrition-catalog-gehalte";
import { weergaveVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { toBase } from "@/lib/nutrition-units";
import NevoMacroBlok from "@/components/dashboard/dagboek/NevoMacroBlok";
import VoedingswaardeTabel from "@/components/dashboard/dagboek/VoedingswaardeTabel";
import { macroPortieVoor } from "@/lib/catalogus-macro-portie";
import { berekenVoedingswaarde, nevoCodeVoorItem } from "@/lib/nutrition-voedingswaarde";
import { useNevoProducten } from "@/lib/use-nevo-producten";

/**
 * Het detailscherm van één gelogd product: wat dít item levert, per stof.
 *
 * Het omgekeerde aanzicht van `DagboekNutrientDetail` (klik op een stof → zie
 * alle bijdragende items): hier klik je op een product en zie je alleen wat
 * dát ene item aan de vijf kernstoffen levert, als ADH-balk per stof — dezelfde
 * balkvorm als de premium nutriëntentabel op Je patroon (`vd-cel`), nu in
 * Tailwind omdat de rest van dit scherm dat idioom gebruikt.
 *
 * ## Twee lagen onder elkaar
 *
 * Bovenaan de vijf kernstoffen met ADH-balk, dezelfde getallen als de krans.
 * Daaronder de rest van het etiket uit NEVO (`VoedingswaardeTabel`), zonder
 * oordeel (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1). Eiwit
 * staat in allebei en komt in allebei uit `bedragVanItem`. Een gemeten 0 of
 * spoor staat er als "0"/"spoor". Een benadering die getoond mag worden
 * (`scripts/nevo-benadering-micros.json`) toont de kernstoffen van het
 * vergelijkbare NEVO-record met "≈" en de NEVO-naam; die tellen niet mee in je
 * dag (`docs/plan/BESLUIT_NUL_SPOOR_BENADERING_2026-10.md`).
 */

function labelVoor(item: DagboekItem): string | null {
  if (item.bron === "supplement") return supplementCatalogEntry(item.key)?.labelNl ?? null;
  return catalogEntry(item.key)?.labelNl ?? null;
}

function eenheidVoor(item: DagboekItem): string {
  if (item.bron === "supplement") {
    return supplementCatalogEntry(item.key)?.porties[0]?.labelNl ?? "portie";
  }
  return "g";
}

export default function DagboekProductDetail({
  item,
  onTerug,
  onVerwijder,
  busy = false,
}: {
  item: DagboekItem;
  onTerug: () => void;
  onVerwijder: (item: DagboekItem) => void;
  busy?: boolean;
}) {
  const label = labelVoor(item);
  const voedingEntry = item.bron === "voeding" ? catalogEntry(item.key) : null;
  const eenheid = eenheidVoor(item);
  const nevoCode = nevoCodeVoorItem(item);
  const nevoProducten = useNevoProducten(nevoCode ? [nevoCode] : []);
  const nevoProduct = nevoCode ? (nevoProducten.get(`nevo:${nevoCode}`) ?? null) : null;
  const isBenadering = voedingEntry ? macroPortieVoor(voedingEntry)?.benadering === true : false;
  const nevoStoffen = voedingEntry
    ? NUTRIENT_ORDER.filter((nutrient) => gehaltePer100g(voedingEntry, nutrient)?.bron === "nevo")
    : [];
  const omega3Delen =
    voedingEntry && nevoStoffen.includes("omega3") ? nevoOmega3Delen(voedingEntry.key) : null;
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
      aandeel: aandeelVanRi(nutrient, inBasis),
      benadering: weergave.benadering,
    };
  }).filter((rij): rij is NonNullable<typeof rij> => rij !== null);
  const benadering = rijen.find((rij) => rij.benadering)?.benadering ?? null;
  const heeftGetal = rijen.some((rij) => rij.soort === "waarde");

  if (!label) {
    return (
      <div className="flex flex-col gap-4">
        <header className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onTerug}
            aria-label="Terug naar je dag"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
          >
            <Icons.ChevronLeft s={18} />
          </button>
          <h2 className="m-0 font-serif text-[19px] font-normal text-[var(--vd-ink)]">Product</h2>
        </header>
        <p className="m-0 text-[13px] text-[var(--vd-ink-3)]">
          Dit product staat niet meer in de catalogus.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar je dag"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        {voedingEntry ? <FoodThumbnail entry={voedingEntry} size={40} /> : null}
        <div className="min-w-0">
          <h2 className="m-0 truncate font-serif text-[19px] font-normal text-[var(--vd-ink)]">
            {label}
          </h2>
          <span className="text-[11px] text-[var(--vd-ink-4)]">
            {item.grams} {eenheid}
            {item.bron === "supplement" ? " · supplement" : null}
          </span>
        </div>
      </header>

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
              const gedekt = rij.aandeel !== null && rij.aandeel >= 1;
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
                          : `${rij.benadering ? "≈ " : ""}${vulling}% ADH`}
                    </span>
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink-3)]">
                    {rij.benadering ? "≈ " : null}
                    {rij.soort === "spoor" ? "spoor" : `${Math.round(rij.waarde * 10) / 10} ${rij.unit}`}
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
            niet mee in je dag.
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

      {nevoProduct ? (
        <VoedingswaardeTabel
          titel="Voedingswaarde"
          toelichting={`${item.grams} ${eenheid}`}
          voedingswaarde={berekenVoedingswaarde({ items: [item], nevoProducten })}
          bronProducten={[nevoProduct]}
        />
      ) : isBenadering && voedingEntry ? (
        <NevoMacroBlok entry={voedingEntry} grams={item.grams} />
      ) : null}

      <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
        Dit is wat <b className="font-semibold text-[var(--vd-ink)]">{item.grams} {eenheid}</b>{" "}
        {label.toLowerCase()} levert — niet je hele dag. Bovenaan de vijf stoffen uit je krans,
        met dezelfde percentages; daaronder de rest van het etiket, zonder oordeel. Je hele dag
        staat onder &ldquo;Voedingsstoffen&rdquo;.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => onVerwijder(item)}
        className="self-start rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--vd-ink-3)] transition-colors hover:border-[var(--vd-terra)] hover:text-[var(--vd-terra)] disabled:opacity-50"
      >
        Verwijder uit dagboek
      </button>
    </div>
  );
}

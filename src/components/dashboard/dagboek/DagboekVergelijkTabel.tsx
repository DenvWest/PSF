"use client";

import * as Icons from "@/components/app/icons";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { bedragVoorStandaardPortie } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import type { VergelijkResultaat } from "@/components/dashboard/dagboek/DagboekVergelijkZoek";

/**
 * De vergelijking zelf: per stof een rij, en binnen die rij een staaf per
 * gekozen product — de hoogste eerst, zodat je in één oogopslag ziet welk
 * product voor déze stof wint. Elk product draagt zijn eigen realistische
 * portie ("1 plakje zalm", "1 schep eiwitpoeder"), niet een gedeelde 100 g,
 * want dat is wat iemand daadwerkelijk zou eten of nemen.
 *
 * Bewust beperkt tot de 5 stoffen die dit systeem trackt — zie het docblok
 * bij `DagboekProductDetail.tsx` voor waarom er geen macro's of volledige
 * vitamine/mineralenset bij staan.
 */

type Rij = {
  nutrient: (typeof NUTRIENT_ORDER)[number];
  label: string;
  waarden: {
    resultaat: VergelijkResultaat;
    value: number;
    unit: string;
    portieLabel: string;
  }[];
};

export default function DagboekVergelijkTabel({
  producten,
  onTerug,
  onVerwijder,
}: {
  producten: readonly VergelijkResultaat[];
  onTerug: () => void;
  onVerwijder: (resultaat: VergelijkResultaat) => void;
}) {
  const rijen: Rij[] = NUTRIENT_ORDER.map((nutrient) => {
    const waarden = producten
      .map((resultaat) => {
        const bedrag = bedragVoorStandaardPortie(
          resultaat.bron,
          resultaat.entry.key,
          nutrient,
        );
        if (!bedrag) return null;
        return {
          resultaat,
          value: bedrag.value,
          unit: bedrag.unit,
          portieLabel: bedrag.portieLabel,
        };
      })
      .filter((rij): rij is NonNullable<typeof rij> => rij !== null)
      .sort((a, b) => b.value - a.value);

    return { nutrient, label: nutrientReferences[nutrient].label, waarden };
  }).filter((rij) => rij.waarden.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar zoeken"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 font-serif text-[19px] font-normal text-[var(--vd-ink)]">
          Vergelijking
        </h2>
      </header>

      <div className="flex flex-wrap gap-2">
        {producten.map((resultaat) => (
          <span
            key={`${resultaat.bron}-${resultaat.entry.key}`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2 text-[11.5px] text-[var(--vd-ink-2)]"
          >
            {resultaat.bron === "voeding" ? (
              <FoodThumbnail entry={resultaat.entry} size={40} />
            ) : (
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--vd-accent-2-rgb)/25%)] text-[11px] font-semibold text-[var(--vd-accent-2)]"
              >
                {resultaat.entry.labelNl.trim().charAt(0).toUpperCase() || "?"}
              </span>
            )}
            {resultaat.entry.labelNl}
            <button
              type="button"
              onClick={() => onVerwijder(resultaat)}
              aria-label={`Verwijder ${resultaat.entry.labelNl} uit vergelijking`}
              className="ml-0.5 cursor-pointer text-[14px] leading-none text-[var(--vd-ink-4)] transition-colors hover:text-[var(--vd-ink)]"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {rijen.length === 0 ? (
        <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-3)]">
          Van deze producten is nog geen gehalte bekend voor de stoffen die dit
          dagboek volgt.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {rijen.map((rij) => {
            const hoogste = Math.max(...rij.waarden.map((w) => w.value), 1);
            return (
              <li key={rij.nutrient} className="overflow-hidden rounded-2xl border border-white/10">
                <header className="border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                  <h3 className="m-0 font-sans text-[13px] font-bold text-[var(--vd-ink)]">
                    {rij.label}
                  </h3>
                </header>
                <ul className="m-0 flex list-none flex-col gap-2 p-3">
                  {rij.waarden.map(({ resultaat, value, unit, portieLabel }) => {
                    const breedte = Math.max(6, Math.round((value / hoogste) * 100));
                    return (
                      <li
                        key={`${resultaat.bron}-${resultaat.entry.key}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="w-[92px] shrink-0 truncate text-[11.5px] text-[var(--vd-ink-2)]">
                          {resultaat.entry.labelNl}
                        </span>
                        <span className="relative h-[20px] flex-1 overflow-hidden rounded-md bg-[var(--vd-track)]">
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 rounded-md bg-[var(--vd-sage)]"
                            style={{ width: `${breedte}%` }}
                          />
                        </span>
                        <span className="w-[76px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink)]">
                          {Math.round(value * 10) / 10} {unit}
                        </span>
                        <span className="hidden w-[96px] shrink-0 truncate text-right text-[10px] text-[var(--vd-ink-4)] sm:block">
                          {portieLabel}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
        Elk product staat op zijn eigen realistische portie, niet op 100 g —
        dit is dus wat je daadwerkelijk zou binnenkrijgen per keer, niet een
        gehalte om te vergelijken op etiketniveau.
      </p>
    </div>
  );
}

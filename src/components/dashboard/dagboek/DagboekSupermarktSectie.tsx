"use client";

import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import {
  bedragVanSupermarktveld,
  somVanSupermarktveld,
  SUPERMARKT_MACRO_VELDEN,
  type SupermarktPortie,
} from "@/lib/nutrition-supermarkt-items";

/**
 * Gelogde supermarktporties (Laag A) — een eigen, kleine sectie onder de
 * eetmomenten-tabellen, niet een kolom erbij in `DagboekMaaltijd`.
 *
 * ## Waarom een eigen sectie en geen rij in `DagboekMaaltijd`
 *
 * Die tabel toont vaste kolommen voor de vijf kernstoffen (magnesium, eiwit,
 * zink, omega-3) per `DagboekItem`. Een supermarktproduct draagt geen van
 * die stoffen — het zou de kolommen leeg trekken zonder iets toe te voegen.
 * Deze sectie toont in plaats daarvan calorieën/macro's, in dezelfde
 * "minstens"-toon als de rest van het dagboek. Zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1: een
 * parallelle laag, geen vervanging.
 */
export default function DagboekSupermarktSectie({
  logs,
  onVerwijder,
  busy = false,
}: {
  logs: readonly SupermarktPortie[];
  onVerwijder: (id: string) => void;
  busy?: boolean;
}) {
  if (logs.length === 0) return null;

  const bronProducten = logs.flatMap((log) => (log.product ? [log.product] : []));

  const totalen = SUPERMARKT_MACRO_VELDEN.map((veld) => ({
    ...veld,
    waarde: somVanSupermarktveld(logs, veld.veld),
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10">
      <header className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
        <h3 className="m-0 font-sans text-[13.5px] font-bold text-[var(--vd-ink)]">
          Calorieën &amp; macro&apos;s
        </h3>
        <span className="text-[10.5px] text-[var(--vd-ink-4)]">informatief</span>
      </header>

      <ul className="m-0 flex list-none flex-col divide-y divide-white/[0.06] p-0">
        {logs.map((log) => {
          const { product } = log;
          const naam = product?.naam ?? "Product niet meer beschikbaar";
          const kcal = product ? bedragVanSupermarktveld(product, "energyKcal", log.grams) : null;
          return (
            <li key={log.id} className="flex items-center gap-2.5 px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] text-[var(--vd-ink)]">{naam}</span>
                <span className="block text-[10px] text-[var(--vd-ink-4)]">
                  {log.grams} g · {kcal === null ? "n.o." : `${Math.round(kcal)} kcal`}
                </span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => onVerwijder(log.id)}
                aria-label={`Verwijder ${naam}`}
                className="cursor-pointer rounded px-1 text-[13px] leading-none text-[var(--vd-ink-4)] transition-colors hover:text-[var(--vd-ink)] disabled:opacity-40"
              >
                &times;
              </button>
            </li>
          );
        })}
        <li className="flex items-center gap-2.5 bg-white/[0.03] px-3 py-2">
          <span className="flex-1 text-[11.5px] font-bold text-[var(--vd-ink)]">
            Samen minstens
          </span>
          <span className="flex gap-3 font-mono text-[11px] tabular-nums text-[var(--vd-ink)]">
            {totalen.map((totaal) => (
              <span key={totaal.veld}>
                {totaal.waarde === null ? "n.o." : Math.round(totaal.waarde * 10) / 10}{" "}
                <span className="text-[var(--vd-ink-4)]">{totaal.unit}</span>
              </span>
            ))}
          </span>
        </li>
      </ul>
      <div className="border-t border-white/[0.06] px-3 py-2">
        <SupermarktBronRegel producten={bronProducten} berekend />
      </div>
    </section>
  );
}

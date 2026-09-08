"use client";

import type { DagstripDag } from "@/lib/nutrition-dagstrip";

/**
 * De zeven dagen boven het dagboek.
 *
 * Eén rij pillen, vandaag rechts. De gevulde dagen dragen een stip in plaats
 * van een tweede kleur: kleur is hier al bezet door "welke dag staat open", en
 * twee betekenissen op één eigenschap maakt allebei onleesbaar.
 */
export default function VoedingDagstrip({
  dagen,
  geselecteerd,
  gevuldeDagen,
  onSelect,
}: {
  dagen: readonly DagstripDag[];
  geselecteerd: string;
  /** Datums waarvoor al iets geregistreerd is. */
  gevuldeDagen: ReadonlySet<string>;
  onSelect: (date: string) => void;
}) {
  return (
    <nav aria-label="Kies een dag" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ul className="m-0 flex list-none gap-1.5 p-0">
        {dagen.map((dag) => {
          const actief = dag.date === geselecteerd;
          const gevuld = gevuldeDagen.has(dag.date);
          return (
            <li key={dag.date} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(dag.date)}
                aria-current={actief ? "date" : undefined}
                aria-label={`${dag.volledigLabel}${gevuld ? " — ingevuld" : ""}`}
                className={`flex min-h-[58px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border px-1.5 py-2 transition ${
                  actief
                    ? "border-[rgba(90,143,106,0.65)] bg-[rgba(90,143,106,0.16)]"
                    : "border-white/[0.07] bg-black/20 hover:border-white/20"
                }`}
              >
                <span
                  className={`text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
                    dag.isWeekend ? "text-[#9CC5A9]" : "text-[#7E8C82]"
                  }`}
                >
                  {dag.kortLabel}
                </span>
                <span
                  className={`text-[16px] font-semibold tabular-nums leading-none ${
                    actief ? "text-[#F1EFE8]" : "text-[#CDD7D0]"
                  }`}
                >
                  {dag.dagNummer}
                </span>
                <span
                  aria-hidden
                  className={`h-1 w-1 rounded-full ${
                    gevuld ? "bg-[#9CC5A9]" : "bg-transparent"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

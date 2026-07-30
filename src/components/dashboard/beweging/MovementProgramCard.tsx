"use client";

import MovementDoorway from "@/components/dashboard/beweging/MovementDoorway";
import type { MovementSessionCatalogEntry } from "@/data/movement/session-catalog";

export type MovementProgramCardProps = {
  entry: MovementSessionCatalogEntry;
  sportUnchanged?: boolean;
  onOpenProgramma?: () => void;
};

export default function MovementProgramCard({
  entry,
  sportUnchanged = true,
  onOpenProgramma,
}: MovementProgramCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Jouw programma
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] ${
            sportUnchanged
              ? "border-white/10 text-[#9FB0A6]"
              : "border-[#79B98C]/50 bg-[#5A8F6A]/12 text-[#79B98C]"
          }`}
        >
          {sportUnchanged ? "ongewijzigd door je sport" : "programma bijgewerkt"}
        </span>
      </div>

      <h3 className="mt-2 font-serif text-[18px] text-[#F1EFE8]">{entry.label}</h3>
      <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]">
        {entry.goal}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-[#9FB0A6]">
          <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
            Duur
          </span>
          <strong className="font-semibold text-[#F1EFE8]">{entry.durationMin}</strong>
        </span>
        <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-[#9FB0A6]">
          <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
            Frequentie
          </span>
          <strong className="font-semibold text-[#F1EFE8]">{entry.frequency}</strong>
        </span>
        <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-[#9FB0A6]">
          <span className="font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
            Intensiteit
          </span>
          <strong className="font-semibold text-[#F1EFE8]">{entry.intensity}</strong>
        </span>
      </div>

      {onOpenProgramma ? (
        <MovementDoorway onClick={onOpenProgramma} className="mt-4">
          Bekijk de oefeningen
        </MovementDoorway>
      ) : null}
    </section>
  );
}

"use client";

import { PILLAR } from "@/data/dashboard";
import type { DashboardModel } from "@/types/dashboard";

type VoortgangLogboekSectionProps = {
  model: DashboardModel;
};

export default function VoortgangLogboekSection({ model }: VoortgangLogboekSectionProps) {
  const entries = model.history.slice(0, -1).reverse().slice(0, 5);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
          Logboek
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Elke check verschijnt hier — met je prioriteit van dat moment.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
        Logboek
      </p>
      <ul className="mt-2.5 m-0 list-none space-y-0 p-0">
        {entries.map((entry) => {
          const priority = PILLAR[entry.priority];
          return (
            <li
              key={`${entry.seq}-${entry.date}`}
              className="flex items-center gap-2 border-t border-white/8 py-2 first:border-t-0 first:pt-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] text-[#CDD7D0]">{entry.date}</span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10.5px] text-[#9FB0A6]">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: priority.color }}
                  />
                  {priority.label.toLowerCase()}
                </span>
              </span>
              <span
                className="font-serif text-[15px] tabular-nums text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {entry.vitality}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

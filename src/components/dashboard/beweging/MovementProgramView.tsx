"use client";

import Link from "next/link";
import type { MovementSessionCatalogEntry } from "@/data/movement/session-catalog";
import type { MovementTrainingLocation } from "@/data/movement/session-catalog";
import {
  buildDashboardBewegingStappenplanHref,
  buildDashboardVandaagHref,
} from "@/lib/dashboard-url";

export type MovementProgramViewProps = {
  entry: MovementSessionCatalogEntry;
  trainingLocation: MovementTrainingLocation | null;
};

export default function MovementProgramView({
  entry,
  trainingLocation,
}: MovementProgramViewProps) {
  const exercises = entry.exercises ?? [];
  const locationLabel =
    trainingLocation === "sportschool" ? "sportschool" : "thuis";

  return (
    <div className="@container w-full pb-24 md:pb-8">
      <div className="mx-auto w-full max-w-[1040px] @[1080px]:max-w-[1340px]">
        <header className="mb-5 border-b border-white/10 pb-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Programma · beweging
          </p>
          <h2 className="font-serif text-[22px] font-normal leading-tight text-[#F1EFE8] text-pretty">
            {entry.label}
          </h2>
          <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-[#CDD7D0]">
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
        </header>

        <section className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              De oefeningen
            </p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
              {entry.frequency}
            </span>
          </div>

          {exercises.length > 0 ? (
            <ol className="space-y-3">
              {exercises.map((exercise) => (
                <li
                  key={exercise.name}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-serif text-[16px] text-[#F1EFE8]">{exercise.name}</p>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#9FB0A6]">
                      {exercise.reps}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-[#9FB0A6]">
                    {exercise.cue}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="max-w-[68ch] text-[13px] leading-relaxed text-[#CDD7D0]">
              {entry.structure}
            </p>
          )}

          <p className="mt-5 max-w-[68ch] text-[12px] leading-relaxed text-[#9FB0A6]">
            Geen logboek, geen gewichten-tracker. Afvinken doe je in{" "}
            <Link
              href={buildDashboardVandaagHref("beweging")}
              className="font-semibold text-[#79B98C] no-underline"
            >
              Overzicht
            </Link>{" "}
            — hier lees je alleen wát je doet en hoe.
          </p>
        </section>

        <p className="mt-3 max-w-[68ch] rounded-xl border border-[color:var(--ac)]/20 bg-[color:var(--ac)]/8 px-3.5 py-3 text-[12px] leading-relaxed text-[#CDD7D0]">
          Train je op de {locationLabel === "sportschool" ? "sportschool" : "andere locatie"}?
          Wissel de locatie in{" "}
          <Link
            href={buildDashboardBewegingStappenplanHref()}
            className="font-semibold text-[color:var(--ac)] no-underline"
          >
            je stappenplan
          </Link>{" "}
          — dan past dit programma zich aan.
        </p>
      </div>
    </div>
  );
}

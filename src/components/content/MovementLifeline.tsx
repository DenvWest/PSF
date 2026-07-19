"use client";

import { useState, type CSSProperties } from "react";
import Container from "@/components/layout/Container";

type Band<T> = T & { max: number };

type Metric = { label: string; sev: number };

const ACCENT = "oklch(0.69 0.095 50)";

const METRICS: Metric[] = [
  { label: "Energie", sev: 0.85 },
  { label: "Spierkracht", sev: 1.08 },
  { label: "Herstel na inspanning", sev: 0.98 },
  { label: "Balans & stabiliteit", sev: 1.0 },
  { label: "Zelfstandigheid", sev: 1.12 },
];

const CAPTIONS: Band<{ text: string }>[] = [
  {
    max: 39,
    text: "Je merkt nu waarschijnlijk nog niets. Precies dáárom is dit het slimste moment om te beginnen.",
  },
  {
    max: 49,
    text: "Nu voelt bijna alles nog vanzelfsprekend. Precies de tijd om iets op te bouwen.",
  },
  { max: 59, text: "Nu duiken de eerste “nét wat zwaarder”-momentjes op." },
  { max: 69, text: "Nu telt wat je de jaren hiervoor met je lichaam deed." },
  {
    max: 200,
    text: "Nu betaalt elke investering zich uit — in zelfstandigheid.",
  },
];

const FUTURE_YOU: Band<{ quote: string; by: string }>[] = [
  {
    max: 42,
    quote:
      "Je voelt nu nog nergens iets van — en tóch bepaal je juist op deze leeftijd hoe soepel de rest gaat. Begin je nu, dan ben ik je later oprecht dankbaar.",
    by: "— jij, een jaar of twintig verder",
  },
  {
    max: 52,
    quote:
      "Ik wou dat ik rond mijn 43e was begonnen. Niet omdat ik ziek werd — maar omdat alles nét wat zwaarder werd.",
    by: "— jij, ergens rond je 55e",
  },
  {
    max: 62,
    quote:
      "De trap merk ik nu. Niet dramatisch. Ik hou me alleen vaker even vast dan vroeger.",
    by: "— jij, ergens rond je 60e",
  },
  {
    max: 72,
    quote:
      "Het is nooit te laat om te beginnen — dat weet ik nu. Maar eerder was het wél makkelijker geweest.",
    by: "— jij, ergens rond je 70e",
  },
  {
    max: 200,
    quote: "Wat ik nu het meest waardeer? Dat ik mijn dingen nog zélf doe.",
    by: "— jij, ergens rond je 80e",
  },
];

const MILESTONES = [40, 50, 60, 70, 80];

function agePosition(age: number): number {
  return ((age - 30) / 55) * 100;
}

function scenario(age: number, sev: number, trained: boolean): number {
  const a = Math.min(1, Math.max(0, (age - 30) / 55));
  const drop = trained
    ? sev * (0.15 * a + 0.11 * a * a * a)
    : sev * (0.42 * a + 0.34 * a * a);
  return Math.max(0.08, Math.min(1, 1 - drop));
}

function pickBand<T>(bands: Band<T>[], age: number): Band<T> {
  return bands.find((band) => age <= band.max) ?? bands[bands.length - 1];
}

export default function MovementLifeline() {
  const [age, setAge] = useState(40);
  const caption = pickBand(CAPTIONS, age).text;
  const future = pickBand(FUTURE_YOU, age);

  const futureYou = (
    <>
      <figcaption
        className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: "color-mix(in srgb, var(--ac) 66%, #9FB0A6)" }}
      >
        een berichtje van je toekomstige ik
      </figcaption>
      <blockquote className="mt-2.5 font-serif text-[clamp(18px,2.4vw,25px)] italic leading-[1.32] text-[#F1EFE8]">
        {future.quote}
      </blockquote>
      <p className="mt-2.5 text-[13px] text-[#9FB0A6]">{future.by}</p>
    </>
  );

  return (
    <section
      id="levenslijn"
      aria-label="Jouw levenslijn"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
        {/* Narratief */}
        <div className="lg:pt-2">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "color-mix(in srgb, var(--ac) 62%, #9FB0A6)" }}
          >
            Jouw levenslijn
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,40px)] font-normal leading-[1.08]">
            Sleep door de jaren. Zie het langzaam uit elkaar lopen.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-[#9FB0A6]">
            Twee versies van dezelfde persoon. De één doet níets extra. De ander
            traint 2 à 3 keer per week kracht en conditie. In het begin is het
            verschil klein — daar zit hem juist de truc.
          </p>
          <figure className="mt-8 hidden rounded-2xl border border-white/10 bg-black/25 p-6 lg:block">
            {futureYou}
          </figure>
        </div>

        {/* Interactief */}
        <div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
            <div className="flex items-baseline gap-3">
              <span
                className="font-serif text-[clamp(42px,9vw,64px)] leading-none"
                style={{ color: "var(--ac)" }}
              >
                {age}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
                jaar
              </span>
            </div>
            <p className="mt-2 min-h-[44px] text-[15px] leading-snug text-[#CDD7D0]">
              {caption}
            </p>

            <div className="relative mx-1 mt-7 mb-2 h-0.5 rounded-full bg-white/15">
              {MILESTONES.map((milestone) => (
                <span
                  key={milestone}
                  className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30"
                  style={{ left: `${agePosition(milestone)}%` }}
                >
                  <b className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-normal text-[#7E8C82]">
                    {milestone}
                  </b>
                </span>
              ))}
            </div>

            <input
              type="range"
              min={30}
              max={85}
              step={1}
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
              aria-label="Leeftijd"
              aria-valuetext={`${age} jaar`}
              className="w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[#102018] [&::-moz-range-thumb]:bg-[var(--ac)] [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/15 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/15 [&::-webkit-slider-thumb]:mt-[-9px] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#102018] [&::-webkit-slider-thumb]:bg-[var(--ac)]"
            />

            <div className="mt-6 flex flex-col gap-4">
              {METRICS.map((metric) => {
                const withTraining = scenario(age, metric.sev, true) * 100;
                const without = scenario(age, metric.sev, false) * 100;
                return (
                  <div
                    key={metric.label}
                    className="grid grid-cols-1 gap-1.5 sm:grid-cols-[128px_1fr] sm:items-center sm:gap-4"
                  >
                    <span className="text-[14px] text-[#CDD7D0]">
                      {metric.label}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-[0.06em]"
                          style={{ color: "var(--ac)" }}
                        >
                          met
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <span
                            className="block h-full rounded-full bg-[var(--ac)] transition-[width] duration-300 ease-out"
                            style={{ width: `${withTraining.toFixed(1)}%` }}
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]">
                          zonder
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <span
                            className="block h-full rounded-full bg-white/30 transition-[width] duration-300 ease-out"
                            style={{ width: `${without.toFixed(1)}%` }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-[#9FB0A6]">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2 w-5 rounded-full"
                  style={{ background: "var(--ac)" }}
                />
                Met kracht &amp; conditie
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-2 w-5 rounded-full bg-white/30" />
                Zonder gerichte training
              </span>
            </div>
          </div>

          <figure className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-5 lg:hidden">
            {futureYou}
          </figure>
        </div>
      </div>

      <p className="mt-8 max-w-[70ch] text-[12.5px] leading-relaxed text-[#7E8C82]">
        Dit is een algemeen beeld van normale, leeftijdsgebonden veranderingen —
        geen voorspelling en geen diagnose. Hoe jóuw lijn loopt, hangt af van
        waar je nu staat.
      </p>
      </Container>
    </section>
  );
}

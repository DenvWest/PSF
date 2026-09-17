"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import Container from "@/components/layout/Container";
import {
  NUTRITION_GAP_ACCENT,
  NUTRITION_GAP_NUTRIENTS,
  NUTRITION_GAP_PATTERNS,
  nutritionGapLowCount,
  nutritionGapPattern,
  type NutritionGapNutrientId,
  type NutritionGapPatternId,
} from "@/data/voedingstekort";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";

const LINK =
  "font-medium text-[#F1EFE8] underline decoration-white/30 underline-offset-[3px] transition hover:decoration-white/70";

export default function NutritionGapChart() {
  const [patternId, setPatternId] = useState<NutritionGapPatternId>("plant");
  const [activeId, setActiveId] = useState<NutritionGapNutrientId>("b12");
  const pattern = nutritionGapPattern(patternId);
  const active =
    NUTRITION_GAP_NUTRIENTS.find((item) => item.id === activeId) ??
    NUTRITION_GAP_NUTRIENTS[0];
  const lowCount = nutritionGapLowCount(patternId);

  function selectPattern(id: NutritionGapPatternId) {
    setPatternId(id);
    trackEvent(GA4_EVENTS.VOEDINGSTEKORT_PATROON, { patroon: id });
    clarityTag("voedingstekort_patroon", id);
  }

  function selectNutrient(id: NutritionGapNutrientId) {
    setActiveId(id);
    trackEvent(GA4_EVENTS.VOEDINGSTEKORT_STOF, { stof: id });
    clarityTag("voedingstekort_stof", id);
  }

  return (
    <section
      id="grafiek"
      aria-label="Micronutriëntengrafiek"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Micronutriëntengrafiek
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Wat er typisch op je bord ontbreekt — vooral plantaardig
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#9FB0A6]">
            Acht stoffen. Drie eetpatronen. De staven tonen een algemeen beeld
            van hoe vol een stof meestal zit — geen bloedwaarde. Tik een stof
            aan om te zien wat een chronisch tekort met je lijf doet.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {NUTRITION_GAP_PATTERNS.map((item) => {
            const on = item.id === patternId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPattern(item.id)}
                aria-pressed={on}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-left text-[14.5px] transition-colors ${
                  on
                    ? "border-white/40 bg-white/10 text-[#F1EFE8]"
                    : "border-white/15 bg-white/[0.03] text-[#9FB0A6] hover:border-white/30"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 max-w-[54ch] text-[14.5px] leading-relaxed text-[#9FB0A6]">
          {pattern.hint}{" "}
          {lowCount === 0
            ? "In dit patroon blijft geen stof onder de krappe lijn."
            : `${lowCount} ${lowCount === 1 ? "stof zit" : "stoffen zitten"} hier onder de krappe lijn.`}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
              Typische dekking · {pattern.short}
            </p>
            <ul className="mt-5 flex flex-col gap-3.5">
              {NUTRITION_GAP_NUTRIENTS.map((item) => {
                const value = item.coverage[patternId];
                const on = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectNutrient(item.id)}
                      aria-pressed={on}
                      className={`grid w-full grid-cols-[minmax(0,1fr)_3rem] items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors ${
                        on ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>
                        <span className="flex items-baseline justify-between gap-3">
                          <span
                            className={`text-[14.5px] ${
                              on ? "text-[#F1EFE8]" : "text-[#CDD7D0]"
                            }`}
                          >
                            {item.label}
                          </span>
                        </span>
                        <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <span
                            className="block h-full rounded-full transition-[width] duration-300 ease-out"
                            style={{
                              width: `${value}%`,
                              background:
                                value < 50
                                  ? "color-mix(in srgb, var(--ac) 45%, #F1EFE8)"
                                  : "var(--ac)",
                            }}
                          />
                        </span>
                      </span>
                      <span
                        className="text-right font-serif text-[18px] tabular-nums"
                        style={{
                          color: value < 50 ? "#E8C9A8" : "var(--ac)",
                        }}
                      >
                        {value}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-[12px] leading-relaxed text-[#7E8C82]">
              100 = een praktische doelwaarde grotendeels gedekt. Onder 50 =
              structureel krap in dit patroon. Geen milligrammen, geen labuitslag.
            </p>
          </div>

          {active ? (
            <aside
              className="rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6"
              aria-live="polite"
            >
              <p
                className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: "color-mix(in srgb, var(--ac) 66%, #9FB0A6)" }}
              >
                Chronisch tekort
              </p>
              <h3 className="mt-2 font-serif text-[26px] font-normal leading-[1.12] text-[#F1EFE8]">
                {active.label}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#CDD7D0]">
                {active.bodyRole}
              </p>
              <p className="mt-4 text-[14.5px] leading-relaxed text-[#9FB0A6]">
                {active.chronicShortage}
              </p>
              <p
                className="mt-5 border-l-[3px] py-0.5 pl-4 text-[14px] leading-relaxed text-[#CDD7D0]"
                style={{ borderColor: "var(--ac)" }}
              >
                {active.veganNote}
              </p>
              <p className="mt-5">
                <Link href={active.href} className={LINK}>
                  Verder lezen →
                </Link>
              </p>
            </aside>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

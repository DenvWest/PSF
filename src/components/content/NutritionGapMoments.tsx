"use client";

import { useState, type CSSProperties } from "react";
import Container from "@/components/layout/Container";
import { NUTRITION_GAP_ACCENT } from "@/data/voedingstekort";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

const MOMENTS = [
  "Ik ben vaker moe dan mijn agenda verklaart",
  "Concentreren kost meer dan vroeger",
  "De trap neemt me nét wat meer mee",
  "Ik heb vaker koude handen of voel me vlak",
  "Tintelingen in vingers of voeten, af en toe",
  "Na de winter val ik extra diep in energie",
];

function tallyText(count: number): string {
  if (count === 0) return "Tik de momenten aan die je herkent.";
  if (count <= 2)
    return "Herkenbaar. Los gezien lijkt het niks — maar het zijn vaak de eerste tekenen dat een stof krap zit. Het goede nieuws: de gaten zijn voorspelbaar.";
  if (count <= 4)
    return `Je herkent er ${count}. Dat is geen toeval en zeker geen falen — het is hoe een chronisch tekort zich meestal aandient. Eerst vaag, dan persistenter.`;
  return `Je herkent er ${count}. Zie het niet als “er is iets mis”, maar als een lijst die je grotendeels kunt dichten — en bij aanhoudende klachten met je huisarts kunt checken.`;
}

export default function NutritionGapMoments() {
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const count = selected.size;

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      const size = next.size;
      trackEvent("voedingstekort_momenten", { count: size });
      clarityTag("voedingstekort_momenten", String(size));
      return next;
    });
  }

  return (
    <section
      id="momenten"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Kleine momenten, groot signaal
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Welke van deze herken je al een beetje?
          </h2>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {MOMENTS.map((moment, index) => {
            const on = selected.has(index);
            return (
              <button
                key={moment}
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={on}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-left text-[14.5px] transition-colors ${
                  on
                    ? "border-white/40 bg-white/10 text-[#F1EFE8]"
                    : "border-white/15 bg-white/[0.03] text-[#9FB0A6] hover:border-white/30"
                }`}
              >
                {moment}
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-start gap-4">
          <span
            className="font-serif text-[34px] leading-none"
            style={{ color: "var(--ac)" }}
          >
            {count > 0 ? count : "—"}
          </span>
          <p className="max-w-xl pt-1 text-[15.5px] leading-relaxed text-[#CDD7D0]">
            {tallyText(count)}
          </p>
        </div>
      </Container>
    </section>
  );
}

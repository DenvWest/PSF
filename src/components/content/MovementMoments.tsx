"use client";

import { useState, type CSSProperties } from "react";
import Container from "@/components/layout/Container";

const ACCENT = "oklch(0.69 0.095 50)";

const MOMENTS = [
  "Ik ben sneller moe dan een paar jaar geleden",
  "Traplopen voelt net wat zwaarder",
  "Opstaan van de bank gaat minder soepel",
  "Boodschappentassen voelen zwaarder",
  "Ik herstel langzamer na inspanning of een drukke dag",
  "Tuinieren of klussen put me meer uit dan vroeger",
];

function tallyText(count: number): string {
  if (count === 0) return "Tik de momenten aan die je herkent.";
  if (count <= 2)
    return "Herkenbaar. Los gezien lijkt het niks — maar het zijn vaak de eerste tekenen dat je spierreserve slinkt. Het goede nieuws: juist dáár is veel aan te doen.";
  if (count <= 4)
    return `Je herkent er ${count}. Dat is geen toeval en zeker geen falen — het is normaal. En een groot deel hiervan is te beïnvloeden met gerichte training.`;
  return `Je herkent er ${count}. Zie het niet als “ik word oud”, maar als een lijst die je grotendeels kunt terugdraaien — precies daarvoor is deze gids er.`;
}

export default function MovementMoments() {
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
      return next;
    });
  }

  return (
    <section
      id="momenten"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
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

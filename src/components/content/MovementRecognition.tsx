"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import Container from "@/components/layout/Container";

const ACCENT = "oklch(0.69 0.095 50)";

const ITEMS = [
  "Ik fiets of wandel bijna elke dag",
  "Krachttraining doe ik zelden of nooit gericht",
  "Mijn werk is al lichamelijk zwaar genoeg, denk ik",
  "Ik heb geen tijd of zin in de sportschool",
  "Ik train nog, maar meer uit gewoonte dan met een doel",
  "Ik voel me nog prima — dus waarom zou ik iets veranderen?",
];

const LINK =
  "font-medium text-[#F1EFE8] underline decoration-white/30 underline-offset-[3px] transition hover:decoration-white/70";

export default function MovementRecognition() {
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
      id="herkenning"
      aria-label="Herken je dit?"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Herken je dit?
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Tik aan wat op jou van toepassing is
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[#9FB0A6]">
            Grote kans dat je jezelf best actief vindt. Terecht — de meeste
            mensen bewegen véél minder dan jij. En tóch is er iets dat
            wandelen en fietsen nauwelijks doen.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {ITEMS.map((item, index) => {
            const on = selected.has(index);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={on}
                className={`min-h-11 rounded-full border px-4 py-2.5 text-left text-[14.5px] transition-colors ${
                  on
                    ? "border-white/40 bg-white/10 text-[#F1EFE8]"
                    : "border-white/15 bg-white/[0.03] text-[#9FB0A6] hover:border-white/30"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div
          className="mt-8 max-w-xl border-l-[3px] py-0.5 pl-6"
          style={{ borderColor: "var(--ac)" }}
        >
          <p
            className={`font-serif text-[clamp(20px,2.8vw,27px)] italic leading-[1.32] text-[#F1EFE8] transition-opacity duration-500 ${
              count > 0 ? "opacity-100" : "opacity-40"
            }`}
          >
            Wandelen en fietsen trainen vooral je hart. Je spieren wachten nog
            steeds op hún uitdaging.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#9FB0A6]">
            {count === 0
              ? "Dat is geen oordeel — bijna niemand daagt zijn spieren dagelijks uit. Tik aan wat je herkent."
              : `Je herkent er ${count}. Zie het niet als “ik word oud”, maar als een lijst die je grotendeels kunt terugdraaien — en daar begint deze gids.`}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#9FB0A6]">
            Past dit bij jou? Bekijk{" "}
            <Link href="/profiel/overtrainer" className={LINK}>
              Overtrainer
            </Link>{" "}
            of{" "}
            <Link href="/profiel/lage-batterij" className={LINK}>
              Lage Batterij
            </Link>{" "}
            — of start de{" "}
            <Link href="/intake" className={LINK}>
              gratis Leefstijlcheck
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}

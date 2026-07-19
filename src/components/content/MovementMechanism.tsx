import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";

const ACCENT = "oklch(0.69 0.095 50)";

const STEPS = [
  {
    n: "01",
    title: "Je spiervezels krijgen een seintje",
    body: "Een uitdaging die net iets zwaarder is dan je gewend bent, is genoeg: “hier moeten we sterker worden.”",
  },
  {
    n: "02",
    title: "In de dagen erna herstelt je lichaam zich",
    body: "En bouwt het iets steviger terug op — precies daar waar je het gebruikte.",
  },
  {
    n: "03",
    title: "Je zenuwen en spieren werken beter samen",
    body: "Bewegingen worden efficiënter. Je gebruikt je kracht slimmer, niet alleen meer.",
  },
  {
    n: "04",
    title: "Dagelijkse dingen kosten minder moeite",
    body: "Traplopen, tillen, opstaan voelen lichter — en dat herstelvermogen blijft langer behouden.",
  },
];

export default function MovementMechanism() {
  return (
    <section
      id="motorkap"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": ACCENT } as CSSProperties}
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--ac)" }}
          >
            Onder de motorkap
          </p>
          <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08] text-[#F1EFE8]">
            Wat gebeurt er als je je spieren écht uitdaagt?
          </h2>
        </div>

        <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-5">
              <span
                className="shrink-0 font-serif text-[15px] leading-none"
                style={{ color: "var(--ac)" }}
              >
                {step.n}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-[#F1EFE8]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#9FB0A6]">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

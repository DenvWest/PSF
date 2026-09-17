import type { CSSProperties } from "react";
import Container from "@/components/layout/Container";
import { NUTRITION_GAP_ACCENT } from "@/data/voedingstekort";

const STEPS = [
  {
    n: "01",
    title: "Eerst raakt de voorraad op",
    body: "B12 in de lever, ferritine, vitamine D uit de zomer: je lijf buffert. Dat voelt als ‘ik mis niks’ — tot de buffer leeg is.",
  },
  {
    n: "02",
    title: "Enzymen en zenuwen werken minder soepel",
    body: "Micronutriënten zijn geen calorieën. Ze zijn gereedschap. Zonder gereedschap gaan aanmaak van bloedcellen, schildklierhormoon en zenuwisolatie trager.",
  },
  {
    n: "03",
    title: "Herstel en aanmaak zakken in",
    body: "Spieren, botten, huid, weerstand: alles dat zich stil vernieuwt, krijgt minder bouwstof. Training en slaap doen dan minder dan je verwacht.",
  },
  {
    n: "04",
    title: "Eerst vaag, later groter",
    body: "Moeheid, concentratie, tintelingen, vaker ziek. Geen diagnose van een webpagina — wél reden om de bekende gaten dicht te zetten en bij aanhoudende klachten je huisarts te vragen.",
  },
];

export default function NutritionGapMechanism() {
  return (
    <section
      id="motorkap"
      className="border-b border-white/10 bg-[#102018] text-[#E7EDE8]"
      style={{ "--ac": NUTRITION_GAP_ACCENT } as CSSProperties}
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
            Wat doet een chronisch tekort met je lijf?
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

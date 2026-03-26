import SectionShell from "./ui/SectionShell";
import SectionHeading from "./ui/SectionHeading";

const signals = [
  {
    title: "Chronische stress",
    text: "Aandacht en capaciteit staan onder druk; de achtergrond van verantwoordelijkheid schakelt zelden volledig uit.",
  },
  {
    title: "Mentale vermoeidheid",
    text: "Diepe concentratie is lastiger te beschermen; het ritme van werk en leven vraagt voortdurend herstel.",
  },
  {
    title: "Gebrekkig herstel",
    text: "Het lichaam blijft achter op de vraag: training, reizen en stress stapelen terwijl herstel korter voelt.",
  },
  {
    title: "Onrustige slaap",
    text: "Slaap is vaak genoeg om te functioneren, zelden genoeg om je echt opgeladen te voelen.",
  },
  {
    title: "Onevenwichtige leefstijl",
    text: "Pieken en dalen in energie vervangen een stabiele capaciteit over de week.",
  },
  {
    title: "Voedingsmatige tekorten",
    text: "Zelfs zorgvuldige voeding mist soms de constante basis die het lichaam op lange termijn helpt.",
  },
  {
    title: "Lage veerkracht",
    text: "Kleine verstoringen nemen meer tijd; terugkeren naar baseline voelt minder vanzelfsprekend.",
  },
];

export default function ProblemSection() {
  return (
    <section
      id="approach"
      className="border-b border-[var(--ps-border)]/50 bg-[var(--ps-warm-gray)]/30 py-[var(--ps-section-y)]"
      aria-labelledby="approach-heading"
    >
      <SectionShell>
        <SectionHeading
          eyebrow="De moderne belasting"
          title="Wanneer ambitie en biologie elkaar raken"
          titleAs="h2"
          titleId="approach-heading"
          description="Dit is geen dramatiek—het is het herkennen van patronen. Hoge verwachtingen ontmoeten een lichaam met grenzen. Het doel is geen perfectie; het is een rustigere, preventieve basis en meer veerkracht op de lange termijn."
        />
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {signals.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.25rem] bg-white/85 px-8 py-9 shadow-[0_24px_48px_-28px_rgba(20,20,20,0.08)] sm:px-9 sm:py-10"
            >
              <h3 className="font-display text-xl font-light tracking-tight text-[var(--ps-ink)] sm:text-[1.35rem]">
                {item.title}
              </h3>
              <p className="mt-5 font-sans text-[0.9375rem] leading-[1.75] text-[var(--ps-body)] sm:text-base">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>
    </section>
  );
}
